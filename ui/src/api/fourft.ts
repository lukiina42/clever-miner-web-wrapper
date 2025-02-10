import { useMutation } from '@tanstack/react-query';
import { Rule } from '@/routes/4ftminer/FourFtResults.tsx';
import { baseApiUrl } from '@/utils/constants.ts';
import { FourFtSchemaT } from '@/schema/fourFtForm.ts';

const fourFtApiUrl = `${baseApiUrl}/fourftminer`;

export const useCreateFourFt = () =>
  useMutation({
    mutationFn: async (
      data: FourFtSchemaT & {
        dataset_id: string;
      }
    ) => {
      const stringifiedData = JSON.stringify(data);
      const response = await fetch(fourFtApiUrl, {
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
      return (await response.json()) as Rule[];
    },
    onSuccess: async () => {},
    onError: (error) => {
      console.error(error);
      throw error;
    },
  });
