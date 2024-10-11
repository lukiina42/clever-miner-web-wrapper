import '../../App.css';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';
import useZodForm from '@/components/form/useZodForm.ts';
import { useState } from 'react';
import {
  FloatMandatory,
  IntMandatory,
  StringMandatory,
} from '@/components/form/formValidationTypes.ts';
import FourFtHeading from '@/routes/4ftminer/FourFtHeading.tsx';
import FourFtForm from '@/routes/4ftminer/FourFtForm.tsx';
import FourFtResults, { Rule } from '@/routes/4ftminer/FourFtResults.tsx';

const fourftSchema = z.object({
  base: IntMandatory(1, 1000000),
  confidence: FloatMandatory(0.001, 1),
  antecedentName: StringMandatory(256),
  succedentName: StringMandatory(256),
});

const fourftDefaultValues = {
  base: '',
  confidence: '',
  antecedentName: '',
  succedentName: '',
} satisfies DatasetSchemaT;

export type DatasetSchemaT = z.infer<typeof fourftSchema>;

export interface Dataset {
  created_at: string;
  id: string;
  name: string;
  url: string;
}

export default function FourFtMiner() {
  const [currentDataset, setCurrentDataset] = useState<Dataset | undefined>();
  const [displayDatasetErrorMessage, setDisplayDatasetErrorMessage] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm({
    schema: fourftSchema,
    defaultValues: fourftDefaultValues,
    mode: 'onSubmit',
  });

  const onSubmit = async (data: DatasetSchemaT) => {
    const dataset = currentDataset;
    if (dataset === undefined) {
      setDisplayDatasetErrorMessage(true);
      return;
    }
    setDisplayDatasetErrorMessage(false);
    processFourFtRequestMutation.mutate({
      dataset_id: dataset.id,
      ...data,
    });
  };

  const processFourFtRequestMutation = useMutation({
    mutationFn: async (
      data: DatasetSchemaT & {
        dataset_id: string;
      }
    ) => {
      const stringifiedData = JSON.stringify(data);
      const result = await fetch('http://localhost:8000/clever-miner/fourftminer', {
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

  const datasetsQueryResponse = useSuspenseQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const fetchResult = await fetch('http://localhost:8000/clever-miner/dataset');
      return await fetchResult.json();
    },
  });

  const datasets = datasetsQueryResponse.data as Dataset[];

  return (
    <div className={'flex flex-col w-full h-full'}>
      <FourFtHeading />
      <div className={'flex w-full h-full'}>
        <FourFtForm
          onSubmit={onSubmit}
          handleSubmit={handleSubmit}
          register={register}
          errors={errors}
          datasets={datasets}
          setCurrentDataset={setCurrentDataset}
          displayDatasetErrorMessage={displayDatasetErrorMessage}
          isLoading={processFourFtRequestMutation.isPending}
        />
        <FourFtResults
          rules={processFourFtRequestMutation.data}
          isLoading={processFourFtRequestMutation.isPending}
        />
      </div>
    </div>
  );
}
