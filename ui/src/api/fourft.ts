import { useMutation } from '@tanstack/react-query';
import { Rule } from '@/routes/4ftminer/FourFtResults.tsx';
import { FourFtSchemaT } from '@/routes/4ftminer/FourFtMiner.tsx';
import { baseApiUrl } from '@/utils/constants.ts';

const fourFtApiUrl = `${baseApiUrl}/fourftminer`;

export const useCreateFourFt = () =>
  useMutation({
    mutationFn: async (
      data: FourFtSchemaT & {
        dataset_id: string;
      }
    ) => {
      const stringifiedData = JSON.stringify(data);
      const result = await fetch(fourFtApiUrl, {
        method: 'POST',
        body: stringifiedData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return (await result.json()) as Promise<Rule[]>;
    },
    onSuccess: async (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.error(error);
    },
  });
