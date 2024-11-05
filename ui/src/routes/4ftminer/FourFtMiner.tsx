import '../../App.css';
import { z } from 'zod';
import useZodForm from '@/components/form/useZodForm.ts';
import { useState } from 'react';
import {
  ComboboxStringMandatory,
  FloatMandatory,
  IntMandatory,
  StringOptional,
} from '@/components/form/formValidationTypes.ts';
import FourFtHeading from '@/routes/4ftminer/FourFtHeading.tsx';
import FourFtForm from '@/routes/4ftminer/FourFtForm.tsx';
import { Dataset, useGetDatasets } from '@/api/dataset.ts';
import { useCreateFourFt } from '@/api/fourft.ts';
import FourFtResults from '@/routes/4ftminer/FourFtResults.tsx';
import { Form } from '@/components/ui/form.tsx';
import { CedentConDisType, CedentType } from '@/data/cedent';

const cedentZodObject = z.object({
  name: ComboboxStringMandatory(),
  id: StringOptional(128),
  minLen: IntMandatory(1, 64),
  maxLen: IntMandatory(1, 64),
  type: z.nativeEnum(CedentType, {
    invalid_type_error: 'Please choose an option',
  }),
});

const fourftSchema = z.object({
  base: IntMandatory(1, 1000000),
  confidence: FloatMandatory(0.001, 1),
  anteMinLen: IntMandatory(1, 64),
  anteMaxLen: IntMandatory(1, 64),
  succeMinLen: IntMandatory(1, 64),
  succeMaxLen: IntMandatory(1, 64),
  conDisAntecedentType: z.nativeEnum(CedentConDisType, {
    invalid_type_error: 'Please choose an option',
  }),
  conDisSuccedentType: z.nativeEnum(CedentConDisType, {
    invalid_type_error: 'Please choose an option',
  }),
  antecedent: z.array(cedentZodObject),
  succedent: z.array(cedentZodObject),
});

export const anteSucceDefault = {
  name: '',
  id: '',
  minLen: '',
  maxLen: '',
  type: CedentType.Null,
};

const fourftDefaultValues = {
  base: '',
  confidence: '',
  anteMaxLen: '',
  anteMinLen: '',
  succeMaxLen: '',
  succeMinLen: '',
  conDisAntecedentType: CedentConDisType.Null,
  conDisSuccedentType: CedentConDisType.Null,
  antecedent: [anteSucceDefault],
  succedent: [anteSucceDefault],
} satisfies FourFtSchemaT;

export type FourFtSchemaT = z.infer<typeof fourftSchema>;

export type DatasetState = {
  value: Dataset | undefined;
  errorMessage: string | undefined;
};

const initialDatasetState: DatasetState = {
  value: undefined,
  errorMessage: undefined,
};

export default function FourFtMiner() {
  const [currentDatasetState, setCurrentDatasetState] = useState<DatasetState>(initialDatasetState);

  const form = useZodForm({
    schema: fourftSchema,
    defaultValues: fourftDefaultValues,
    mode: 'onSubmit',
  });

  const onSubmit = async (data: FourFtSchemaT) => {
    const dataset = currentDatasetState;
    if (dataset.value === undefined) {
      setCurrentDatasetState((prevState) => {
        return {
          ...prevState,
          errorMessage: 'Please select a dataset',
        };
      });
      return;
    }

    processFourFtRequestMutation.mutate({
      dataset_id: dataset.value.id.toString(),
      ...data,
    });
  };

  const processFourFtRequestMutation = useCreateFourFt();

  const datasetsQueryResponse = useGetDatasets();

  const datasets = datasetsQueryResponse.data ?? [];
  const datasetsLoading = datasetsQueryResponse.isLoading;

  return (
    <div className={'flex flex-col w-full h-full'}>
      <FourFtHeading />
      <div className={'w-full'}>
        <Form {...form}>
          <FourFtForm
            onSubmit={onSubmit}
            handleSubmit={form.handleSubmit}
            register={form.register}
            errors={form.formState.errors}
            control={form.control}
            setValue={form.setValue}
            clearErrors={form.clearErrors}
            datasets={datasets}
            setCurrentDataset={setCurrentDatasetState}
            currentDataset={currentDatasetState}
            isLoading={processFourFtRequestMutation.isPending}
            datasetsLoading={datasetsLoading}
          />
        </Form>
      </div>
      <FourFtResults
        rules={processFourFtRequestMutation.data}
        isLoading={processFourFtRequestMutation.isPending}
      />
    </div>
  );
}
