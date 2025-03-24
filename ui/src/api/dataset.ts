import { baseApiUrl } from '@/utils/constants.ts';
import { z } from 'zod';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';
import useSessionTokens from '@/hook/useGetSession.ts';
import { authFetch } from '@/utils/authUtils.ts';

// Define the Zod schema
export const datasetSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  name: z.string(),
  url: z.string(),
  header_names: z.array(z.string()),
  columns_count: z.number(),
  rows_count: z.number(),
});

const datasetArraySchema = z.array(datasetSchema);

// Use z.infer to create a TypeScript type
type DatasetApi = z.infer<typeof datasetSchema>;

export type Dataset = Omit<DatasetApi, 'id'> & { id: string };

const DATASETS_COLLECTION_QUERY_KEY = ['datasets'];

const datasetApiUrl = `${baseApiUrl}/dataset`;
const datasetDetailApiUrl = (id: string) => `${datasetApiUrl}/${id}/`;

export interface DatasetFilters {
  name?: string;
  ordering?: string;
  [key: string]: string | undefined;
}

const fetchDatasets = async (token: string, filters?: DatasetFilters): Promise<Dataset[]> => {
  // Construct URL with query parameters
  let url = datasetApiUrl;

  if (filters) {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.ordering) params.append('ordering', filters.ordering);

    const queryString = params.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const fetchResult = await authFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await fetchResult.json();

  try {
    datasetArraySchema.parse(data);
  } catch (error) {
    console.error('Invalid response', error);
    throw error;
  }

  return data.map((dataset: DatasetApi) => {
    return {
      ...dataset,
      id: dataset.id.toString(),
    };
  });
};

export const useGetDatasets = (filters?: DatasetFilters) => {
  const sessionState = useSessionTokens();

  return useQuery<Dataset[], Error>({
    queryKey: [...DATASETS_COLLECTION_QUERY_KEY, filters],
    queryFn: () => fetchDatasets(sessionState.tokens.accessToken, filters),
  });
};

interface CreateDatasetPayload {
  file: File;
  delimiter: string;
}

export const useCreateDataset = (
  queryClient: QueryClient,
  setOpenForm: Dispatch<SetStateAction<boolean>>
) => {
  const sessionState = useSessionTokens();
  return useMutation({
    mutationFn: async (dataset: CreateDatasetPayload) => {
      const data = new FormData();
      data.append('file', dataset.file);
      data.append('delimiter', dataset.delimiter);
      const response = await authFetch(datasetApiUrl, {
        method: 'POST',
        body: data,
        headers: { Authorization: `Bearer ${sessionState.tokens.accessToken}` },
      });
      if (response.status === 201) {
        await queryClient.invalidateQueries({ queryKey: DATASETS_COLLECTION_QUERY_KEY });
        setOpenForm(false);
      }
      return await response.json();
    },
    onSuccess: async () => {},
    onError: (error) => {
      throw error;
    },
  });
};

/**
 * Hook for deleting a dataset
 * @param queryClient QueryClient for invalidating queries after successful deletion
 * @returns Mutation for deleting a dataset
 */
export const useDeleteDataset = (queryClient: QueryClient) => {
  const sessionState = useSessionTokens();

  return useMutation({
    mutationFn: async (datasetId: string) => {
      const response = await authFetch(datasetDetailApiUrl(datasetId), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionState.tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        await queryClient.invalidateQueries({ queryKey: DATASETS_COLLECTION_QUERY_KEY });
        return true; // Success
      } else if (response.status === 400) {
        // Dataset is being used by some results
        const errorData = await response.json();
        throw new Error(errorData.error || 'Cannot delete dataset because it is in use.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to delete this dataset.');
      } else if (response.status === 404) {
        throw new Error('Dataset not found.');
      } else {
        throw new Error('An unexpected error occurred.');
      }
    },
    onSuccess: () => {},
    onError: (error) => {
      console.error('Error deleting dataset:', error);
      throw error;
    },
  });
};
