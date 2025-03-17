import { z } from 'zod';
import { fourFtBaseApiUrl, ruleSchema } from '@/api/fourft.ts';
import { queryOptions } from '@tanstack/react-query';
import { authFetch } from '@/utils/authUtils.ts';

const RULE_BASE_QUERY_KEY = 'rule';

const ruleDetailSchema = z.object({
  plot: z.string(),
  rule: ruleSchema,
});

export type RuleDetail = z.infer<typeof ruleDetailSchema>;

const ruleDetailApiUrl = (fourFtResultId: string, ruleId: string) =>
  `${fourFtBaseApiUrl}/${fourFtResultId}/rules/${ruleId}`;

const fetchRule = async (
  fourFtResultId: string,
  ruleId: string,
  token: string
): Promise<RuleDetail> => {
  const fetchResult = await authFetch(ruleDetailApiUrl(fourFtResultId, ruleId), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await fetchResult.json();

  try {
    ruleDetailSchema.parse(data);
  } catch (error) {
    console.error('Invalid response', error);
    throw error;
  }

  return data;
};

export const ruleQueryOptions = (fourFtResultId: string, ruleId: number, token: string) =>
  queryOptions({
    queryKey: [RULE_BASE_QUERY_KEY, fourFtResultId, ruleId],
    queryFn: () => fetchRule(fourFtResultId, ruleId.toString(), token),
  });
