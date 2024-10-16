import '../../App.css';
import { z } from 'zod';
import useZodForm from '@/components/form/useZodForm.ts';
import { useState } from 'react';
import {
  FloatMandatory,
  IntMandatory,
} from '@/components/form/formValidationTypes.ts';
import FourFtHeading from '@/routes/4ftminer/FourFtHeading.tsx';
import FourFtForm from '@/routes/4ftminer/FourFtForm.tsx';
import { Dataset, useGetDatasets } from '@/api/dataset.ts';
import { useCreateFourFt } from '@/api/fourft.ts';
import FourFtResults from '@/routes/4ftminer/FourFtResults.tsx';

const fourftSchema = z.object({
  base: IntMandatory(1, 1000000),
  confidence: FloatMandatory(0.001, 1),
  // antecedentName: StringMandatory(256),
  // succedentName: StringMandatory(256),
  // antecedentName: z.array(z.object(
  //     {
  //         name: StringMandatory(256),
  //     }
  // )),
  // succedentName: z.array(z.object(
  //     {
  //         name: StringMandatory(256),
  //     }
  // )),
});

const fourftDefaultValues = {
  base: '',
  confidence: '',
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

export type ComboboxState = {
  value: string | undefined;
  errorMessage: string | undefined;
};

const initialComboboxState: ComboboxState = {
  value: undefined,
  errorMessage: undefined,
};

export default function FourFtMiner() {
  const [currentDatasetState, setCurrentDatasetState] = useState<DatasetState>(initialDatasetState);
  const [currentAntecedentName, setCurrentAntecedentName] =
    useState<ComboboxState>(initialComboboxState);
  const [currentSuccedentName, setCurrentSuccedentName] =
    useState<ComboboxState>(initialComboboxState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm({
    schema: fourftSchema,
    defaultValues: fourftDefaultValues,
    mode: 'onSubmit',
  });

  const onSubmit = async (data: FourFtSchemaT) => {
    console.log(data);
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
    if (currentAntecedentName.value === undefined) {
      setCurrentAntecedentName((prevState) => {
        return {
          ...prevState,
          errorMessage: 'Please select an antecedent name',
        };
      });
      return;
    }
    if (currentSuccedentName.value === undefined) {
      setCurrentSuccedentName((prevState) => {
        return {
          ...prevState,
          errorMessage: 'Please select a succedent name',
        };
      });
      return;
    }

    processFourFtRequestMutation.mutate({
      dataset_id: dataset.value.id.toString(),
      antecedentName: currentAntecedentName.value,
      succedentName: currentSuccedentName.value,
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
      <div className={'flex w-full h-full'}>
        <FourFtForm
          onSubmit={onSubmit}
          handleSubmit={handleSubmit}
          register={register}
          errors={errors}
          datasets={datasets}
          setCurrentDataset={setCurrentDatasetState}
          setCurrentAntecedentName={setCurrentAntecedentName}
          setCurrentSuccedentName={setCurrentSuccedentName}
          currentAntecedentName={currentAntecedentName}
          currentSuccedentName={currentSuccedentName}
          currentDataset={currentDatasetState}
          isLoading={processFourFtRequestMutation.isPending}
          datasetsLoading={datasetsLoading}
        />
        <FourFtResults
          rules={processFourFtRequestMutation.data}
          isLoading={processFourFtRequestMutation.isPending}
        />
      </div>
    </div>
  );
}
