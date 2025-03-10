import { z } from 'zod';
import { fourFtBaseApiUrl, FourFtResultDetail, ruleSchema } from '@/api/fourft.ts';
import { datasetSchema } from '@/api/dataset.ts';
import { queryOptions } from '@tanstack/react-query';

const RULE_BASE_QUERY_KEY = 'rule';

const ruleDetailSchema = z.object({
  plot: z.string(),
  rule: ruleSchema,
});

type RuleDetail = z.infer<typeof ruleDetailSchema>;

const ruleDetailApiUrl = (fourFtResultId: string, ruleId: string) =>
  `${fourFtBaseApiUrl}/${fourFtResultId}/rules/${ruleId}`;

const fetchRule = async (fourFtResultId: string, ruleId: string): Promise<RuleDetail> => {
  const fetchResult = await fetch(ruleDetailApiUrl(fourFtResultId, ruleId));
  const data = await fetchResult.json();

  try {
    ruleDetailSchema.parse(data);
  } catch (error) {
    console.error('Invalid response', error);
    throw error;
  }

  return data;
};

export const ruleQueryOptions = (fourFtResultId: string, ruleId: number) =>
  queryOptions({
    queryKey: [RULE_BASE_QUERY_KEY, fourFtResultId, ruleId],
    queryFn: () => fetchRule(fourFtResultId, ruleId.toString()),
  });
