import {
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { baseApiUrl } from '@/utils/constants.ts';
import { FourFtSchemaT } from '@/schema/fourFtForm.ts';
import { z } from 'zod';
import { Dataset, datasetSchema } from '@/api/dataset.ts';
import { UseNavigateResult } from '@tanstack/react-router';
import useSessionTokens from '@/hook/useGetSession.ts';
import { authFetch } from '@/utils/authUtils.ts';

export const fourFtBaseApiUrl = `${baseApiUrl}/fourftminer`;

const fourFtDetailApiUrl = (id: string) => `${fourFtBaseApiUrl}/${id}`;
const fourFtPutApiUrl = (id: string) => `${fourFtBaseApiUrl}/${id}/`;

const FOURFT_BASE_QUERY_KEY = 'fourft';

export interface FourFtFilters {
  name?: string;
  dataset_name?: string;
  ordering?: string;
  [key: string]: string | undefined;
}

export const useGetFourFts = (filters?: FourFtFilters, suspense?: boolean) => {
  const sessionState = useSessionTokens();
  const queryParams = {
    queryKey: [FOURFT_BASE_QUERY_KEY, filters],
    queryFn: () => fetchFourFtResults(sessionState?.tokens?.accessToken ?? '', filters),
  };

  if (suspense) {
    return useSuspenseQuery(queryParams);
  }
  return useQuery(queryParams);
};

export const useCreateFourFt = (navigate: UseNavigateResult<string>) => {
  const sessionState = useSessionTokens();

  return useMutation({
    mutationFn: async (
      data: FourFtSchemaT & {
        dataset_id: string;
      }
    ) => {
      const stringifiedData = JSON.stringify(data);
      const response = await authFetch(fourFtBaseApiUrl, {
        method: 'POST',
        body: stringifiedData,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionState?.tokens?.accessToken ?? ''}`,
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
      await navigate({ to: `/fourft/${data.id}` });
    },
    onError: (error) => {
      console.error(error);
      throw error;
    },
  });
};

export const useFullUpdateFourFt = (id: string, queryClient: QueryClient) => {
  const sessionState = useSessionTokens();
  const token = sessionState?.tokens?.accessToken ?? '';

  return useMutation({
    mutationFn: async (
      data: FourFtSchemaT & {
        dataset_id: string;
      }
    ) => {
      const stringifiedData = JSON.stringify(data);
      const response = await authFetch(fourFtPutApiUrl(id), {
        method: 'PUT',
        body: stringifiedData,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      //todo error handling, error boundary
      if (response.status === 400) {
        throw new Error('Invalid data from the user');
      }
      if (response.status === 500) {
        throw new Error('Internal server error');
      }
      await queryClient.invalidateQueries({ queryKey: [FOURFT_BASE_QUERY_KEY] });
    },
    onSuccess: async () => {},
    onError: (error) => {
      console.error(error);
      throw error;
    },
  });
};

/**
 * Hook for deleting a FourFtResult
 * @param queryClient QueryClient for invalidating queries after successful deletion
 * @param navigate Optional navigate function to redirect after deletion
 * @returns Mutation for deleting a FourFtResult
 */
export const useDeleteFourFt = (queryClient: QueryClient, navigate?: UseNavigateResult<string>) => {
  const sessionState = useSessionTokens();
  const token = sessionState?.tokens?.accessToken ?? '';

  return useMutation({
    mutationFn: async (fourFtId: string) => {
      const response = await authFetch(fourFtDetailApiUrl(fourFtId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        await queryClient.invalidateQueries({ queryKey: [FOURFT_BASE_QUERY_KEY] });
        if (navigate) {
          await navigate({
            to: '/fourft',
            search: { ordering: undefined, name: undefined, datasetName: undefined },
          });
        }
        return true; // Success
      } else if (response.status === 403) {
        throw new Error('You do not have permission to delete this result.');
      } else if (response.status === 404) {
        throw new Error('Result not found.');
      } else {
        throw new Error('An unexpected error occurred.');
      }
    },
    onSuccess: () => {},
    onError: (error) => {
      console.error('Error deleting four-ft result:', error);
      throw error;
    },
  });
};

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
  name: z.string(),
  s3_key: z.string().nullable(),
  base: z.number().nullable(),
  dataset_name: z.string(),
  rules_count: z.number(),
  confidence: z.number().nullable(),
  rel_base: z.number().nullable(),
  aad: z.number().nullable(),
  ante_min_len: z.number(),
  ante_max_len: z.number(),
  succe_min_len: z.number(),
  succe_max_len: z.number(),
  cond_min_len: z.number().nullable(),
  cond_max_len: z.number().nullable(),
  con_dis_antecedent_type: z.string(),
  con_dis_succedent_type: z.string(),
  con_dis_condition_type: z.string().nullable(),
  antecedent: z.array(cedentSchema),
  succedent: z.array(cedentSchema),
  condition: z.array(cedentSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

const CedentsStrSchema = z.object({
  cond: z.string(),
  ante: z.string(),
  succ: z.string(),
});

const ParamsSchema = z.object({
  base: z.number(),
  rel_base: z.number(),
  conf: z.number(),
  aad: z.number(),
  bad: z.number(),
  fourfold: z.array(z.number()),
});

export const ruleSchema = z.object({
  rule_id: z.number(),
  cedents_str: CedentsStrSchema,
  params: ParamsSchema,
  rule_text: z.string(),
});

export type Rule = z.infer<typeof ruleSchema>;
export type RuleParams = z.infer<typeof ParamsSchema>;

const fourFtResultDetailSchema = fourFtResultSchema.extend({
  dataset: datasetSchema,
  rules: z.array(ruleSchema),
});

const fourFtArraySchema = z.array(fourFtResultSchema);

type FourFtResultDetailApi = z.infer<typeof fourFtResultDetailSchema>;

export type FourFtResultDetail = Omit<FourFtResultDetailApi, 'id' | 'dataset'> & {
  id: string;
  dataset: Dataset;
};

const fetchFourFtResult = async (
  fourFtResultId: string,
  token: string,
  ordering?: string
): Promise<FourFtResultDetail> => {
  // Construct URL with query parameters
  let url = fourFtDetailApiUrl(fourFtResultId);

  if (ordering) {
    url = `${url}?ordering=${encodeURIComponent(ordering)}`;
  }

  const fetchResult = await authFetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await fetchResult.json();

  try {
    fourFtResultSchema.parse(data);
  } catch (error) {
    console.error('Invalid response', error);
    throw error;
  }

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

const fetchFourFtResults = async (
  token: string,
  filters?: FourFtFilters
): Promise<FourFtResult[]> => {
  // Construct URL with query parameters
  let url = fourFtBaseApiUrl;

  if (filters) {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.dataset_name) params.append('dataset_name', filters.dataset_name);
    if (filters.ordering) params.append('ordering', filters.ordering);

    const queryString = params.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const fetchResult = await authFetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
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

export const fourFtResultsQueryOptions = (token: string) =>
  queryOptions({
    queryKey: [FOURFT_BASE_QUERY_KEY],
    queryFn: () => fetchFourFtResults(token),
  });

export const fourFtResultQueryOptions = (
  fourFtResultId: string,
  token: string,
  ordering?: string
) =>
  queryOptions({
    queryKey: [FOURFT_BASE_QUERY_KEY, fourFtResultId, ordering],
    queryFn: () => fetchFourFtResult(fourFtResultId, token, ordering),
  });

export const useGetFourFtResult = (
  fourFtResultId: string,
  ordering?: string,
  suspense?: boolean
) => {
  const sessionState = useSessionTokens();
  const queryParams = {
    queryKey: [FOURFT_BASE_QUERY_KEY, fourFtResultId, ordering],
    queryFn: () => fetchFourFtResult(fourFtResultId, sessionState.tokens.accessToken, ordering),
  };

  if (suspense) {
    return useSuspenseQuery(queryParams);
  }
  return useQuery(queryParams);
};
