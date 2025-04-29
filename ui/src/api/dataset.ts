import { baseApiUrl } from '@/utils/constants.ts';
import { z } from 'zod';
import { QueryClient, useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';

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

const fetchDatasets = async (filters?: DatasetFilters): Promise<Dataset[]> => {
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

  const fetchResult = await fetch(url);
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

export const useGetDatasets = (filters?: DatasetFilters, suspense = false) => {
  const options = {
    queryKey: [...DATASETS_COLLECTION_QUERY_KEY, filters],
    queryFn: () => fetchDatasets(filters),
  };

  if (suspense) {
    return useSuspenseQuery<Dataset[], Error>(options);
  }
  return useQuery<Dataset[], Error>(options);
};

interface CreateDatasetPayload {
  file: File;
  delimiter: string;
}

export const useCreateDataset = (
  queryClient: QueryClient,
  setOpenForm: Dispatch<SetStateAction<boolean>>
) => {
  return useMutation({
    mutationFn: async (dataset: CreateDatasetPayload) => {
      const data = new FormData();
      data.append('file', dataset.file);
      data.append('delimiter', dataset.delimiter);
      const response = await fetch(datasetApiUrl, {
        method: 'POST',
        body: data,
      });

      if (response.status === 201) {
        await queryClient.invalidateQueries({ queryKey: DATASETS_COLLECTION_QUERY_KEY });
        setOpenForm(false);
        return await response.json();
      }

      const errorData = await response.json();
      if (response.status === 400) {
        throw new Error(errorData.error || 'Invalid data provided');
      } else if (response.status === 413) {
        throw new Error('File too large');
      } else if (response.status === 415) {
        throw new Error('Unsupported file type');
      } else {
        throw new Error(errorData.error || 'An unexpected error occurred');
      }
    },
    onSuccess: async () => {},
    onError: (error) => {
      console.error('Error creating dataset:', error);
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
  return useMutation({
    mutationFn: async (datasetId: string) => {
      const response = await fetch(datasetDetailApiUrl(datasetId), {
        method: 'DELETE',
        headers: {
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
