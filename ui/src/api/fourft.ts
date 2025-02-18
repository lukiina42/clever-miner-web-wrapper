import { queryOptions, useMutation } from '@tanstack/react-query';
import { Rule } from '@/containers/4ftminer/FourFtResults.tsx';
import { baseApiUrl } from '@/utils/constants.ts';
import { FourFtSchemaT } from '@/schema/fourFtForm.ts';
import { z } from 'zod';
import { Dataset, datasetSchema } from '@/api/dataset.ts';
import { UseNavigateResult } from '@tanstack/react-router';

const fourFtBaseApiUrl = `${baseApiUrl}/fourftminer`;

const fourFtDetailApiUrl = (id: string) => `${fourFtBaseApiUrl}/${id}`;
const fourFtPutApiUrl = (id: string) => `${fourFtBaseApiUrl}/${id}/`;

const FOURFT_BASE_QUERY_KEY = 'fourft';

export const useCreateFourFt = (navigate: UseNavigateResult<string>) =>
  useMutation({
    mutationFn: async (
      data: FourFtSchemaT & {
        dataset_id: string;
      }
    ) => {
      const stringifiedData = JSON.stringify(data);
      const response = await fetch(fourFtBaseApiUrl, {
        method: 'POST',
        body: stringifiedData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      //todo error handling, error boundary
      if (response.status === 400) {
        throw new Error('Invalid data from the user');
      }
      if (response.status === 500) {
        throw new Error('Internal server error');
      }
      if (response.status !== 201) {
        throw new Error('Something went wrong');
      }
      return (await response.json()) as { id: number };
    },
    onSuccess: async (data) => {
      console.log('throwing redirect');
      await navigate({ to: `/fourft/${data.id}` });
    },
    onError: (error) => {
      console.error(error);
      throw error;
    },
  });

export const useFullUpdateFourFt = (id: string) =>
  useMutation({
    mutationFn: async (
      data: FourFtSchemaT & {
        dataset_id: string;
      }
    ) => {
      const stringifiedData = JSON.stringify(data);
      const response = await fetch(fourFtPutApiUrl(id), {
        method: 'PUT',
        body: stringifiedData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      //todo error handling, error boundary
      if (response.status === 400) {
        throw new Error('Invalid data from the user');
      }
      if (response.status === 500) {
        throw new Error('Internal server error');
      }
      return (await response.json()) as Rule[];
    },
    onSuccess: async () => {},
    onError: (error) => {
      console.error(error);
      throw error;
    },
  });

// Define the Zod schema
const cedentSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  min_len: z.number(),
  max_len: z.number(),
});

type CedentApi = z.infer<typeof cedentSchema>;

export type Cedent = Omit<CedentApi, 'id'> & { id: string };

const fourFtResultSchema = z.object({
  id: z.number(),
  dataset_id: z.number(),
  s3_key: z.string().nullable(),
  base: z.number().nullable(),
  confidence: z.number().nullable(),
  rel_base: z.number().nullable(),
  aad: z.number().nullable(),
  ante_min_len: z.number(),
  ante_max_len: z.number(),
  succe_min_len: z.number(),
  succe_max_len: z.number(),
  con_dis_antecedent_type: z.string(),
  con_dis_succedent_type: z.string(),
  antecedent: z.array(cedentSchema),
  succedent: z.array(cedentSchema),
});

const fourFtResultDetailSchema = fourFtResultSchema.extend({
  dataset: datasetSchema,
});

const fourFtArraySchema = z.array(fourFtResultSchema);

type FourFtResultDetailApi = z.infer<typeof fourFtResultDetailSchema>;

export type FourFtResultDetail = Omit<FourFtResultDetailApi, 'id' | 'dataset'> & {
  id: string;
  dataset: Dataset;
};

const fetchFourFtResult = async (fourFtResultId: string): Promise<FourFtResultDetail> => {
  const fetchResult = await fetch(fourFtDetailApiUrl(fourFtResultId));
  const data = await fetchResult.json();

  try {
    fourFtResultSchema.parse(data);
  } catch (error) {
    console.error('Invalid response', error);
    throw error;
  }

  console.log(data);

  return {
    ...data,
    id: data.id.toString(),
    dataset: {
      ...data.dataset,
      id: data.dataset.id.toString(),
    },
  };
};

type FourFtResultApi = z.infer<typeof fourFtResultSchema>;

export type FourFtResult = Omit<FourFtResultApi, 'id'> & { id: string };

const fetchFourFtResults = async (): Promise<FourFtResult[]> => {
  const fetchResult = await fetch(fourFtBaseApiUrl);
  const data = await fetchResult.json();

  try {
    fourFtArraySchema.parse(data);
  } catch (error) {
    console.error('Invalid response', error);
    throw error;
  }

  return data.map((fourFtResultApi: FourFtResultApi) => {
    return {
      ...fourFtResultApi,
      id: fourFtResultApi.id.toString(),
    };
  });
};

export const fourFtResultsQueryOptions = queryOptions({
  queryKey: [FOURFT_BASE_QUERY_KEY],
  queryFn: fetchFourFtResults,
});

export const fourFtResultQueryOptions = (fourFtResultId: string) =>
  queryOptions({
    queryKey: [FOURFT_BASE_QUERY_KEY, fourFtResultId],
    queryFn: () => fetchFourFtResult(fourFtResultId),
  });
