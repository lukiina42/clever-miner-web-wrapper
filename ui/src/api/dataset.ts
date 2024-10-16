import { baseApiUrl } from '@/utils/constants.ts';
import { z } from 'zod';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';

// Define the Zod schema
const datasetSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  name: z.string(),
  url: z.string(),
  header_names: z.array(z.string()),
});

const datasetArraySchema = z.array(datasetSchema);

// Use z.infer to create a TypeScript type
type DatasetApi = z.infer<typeof datasetSchema>;

export type Dataset = Omit<DatasetApi, 'id'> & { id: string };

const DATASETS_COLLECTION_QUERY_KEY = ['datasets'];

const datasetApiUrl = `${baseApiUrl}/dataset`;

const fetchDatasets = async (): Promise<Dataset[]> => {
  const fetchResult = await fetch(datasetApiUrl);
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

export const useGetDatasets = () => {
  return useQuery<Dataset[], Error>({
    queryKey: DATASETS_COLLECTION_QUERY_KEY,
    queryFn: () => fetchDatasets(),
  });
};

interface CreateDatasetPayload {
  file: File;
  delimiter?: string;
}

export const useCreateDataset = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: async (dataset: CreateDatasetPayload) => {
      const data = new FormData();
      data.append('file', dataset.file);
      const result = await fetch(datasetApiUrl, {
        method: 'POST',
        body: data,
      });
      return result.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DATASETS_COLLECTION_QUERY_KEY });
    },
    onError: (error) => {
      throw error;
    },
  });
