import React, { SetStateAction, useMemo } from 'react';
import { Label } from '@/components/ui/label.tsx';
import { Combobox } from '@/components/form/Combobox.tsx';
import TextInputField from '@/components/form/TextInputField.tsx';
import { Button } from '@/components/ui/button.tsx';
import { FieldErrors, FieldValues, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import { Dataset } from '@/api/dataset.ts';
import { ComboboxState, DatasetState, FourFtSchemaT } from '@/routes/4ftminer/FourFtMiner.tsx';

interface Props<T extends FieldValues> {
  onSubmit: (data: T) => void;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  datasets: Dataset[];
  currentDataset: DatasetState;
  currentAntecedentName: ComboboxState;
  currentSuccedentName: ComboboxState;
  setCurrentDataset: React.Dispatch<SetStateAction<DatasetState>>;
  setCurrentAntecedentName: React.Dispatch<SetStateAction<ComboboxState>>;
  setCurrentSuccedentName: React.Dispatch<SetStateAction<ComboboxState>>;
  isLoading: boolean;
  datasetsLoading: boolean;
}

export default function FourFtForm({
  onSubmit,
  handleSubmit,
  register,
  errors,
  datasets,
  setCurrentDataset,
  setCurrentSuccedentName,
  setCurrentAntecedentName,
  currentSuccedentName,
  currentDataset,
  currentAntecedentName,
  isLoading,
  datasetsLoading,
}: Props<FourFtSchemaT> & { handleSubmit: UseFormHandleSubmit<FourFtSchemaT> }) {
  const datasetHeaderNames = useMemo(() => {
    const headerNames = currentDataset?.value?.header_names ?? [];
    return headerNames.map((headerName) => ({ id: headerName, name: headerName }));
  }, [currentDataset]);

  return (
    <div className={'h-full px-4 pt-4 border-r-2 border-gray-200 w-fit'}>
      <form
        className={'flex flex-col gap-1 items-start w-[300px]'}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={'text-lg font-bold'}>Configure options</div>
        <Combobox
          optionName={'dataset'}
          label={'Dataset'}
          isLoading={datasetsLoading}
          options={datasets}
          onValueChange={(value) =>
            setCurrentDataset({
              value: datasets.find((dataset) => value.id === dataset.id),
              errorMessage: undefined,
            })
          }
          errorMessage={currentDataset.errorMessage}
        />
        <div className={'w-full'}>
          <Label htmlFor="base">Base</Label>
          <TextInputField
            {...register('base')}
            placeholder={'1000'}
            errorMessage={errors?.base?.message}
          />
        </div>
        <div className={'w-full'}>
          <Label htmlFor="confidence">Confidence</Label>
          <TextInputField
            {...register('confidence')}
            placeholder={'0.6'}
            errorMessage={errors?.confidence?.message}
          />
        </div>
        <Combobox
          optionName={'antecedent Name'}
          label={'Antecedent name'}
          isLoading={datasetsLoading}
          options={datasetHeaderNames}
          onValueChange={(value) =>
            setCurrentAntecedentName({
              value: value.id,
              errorMessage: undefined,
            })
          }
          errorMessage={currentAntecedentName.errorMessage}
          disabled={currentDataset.value === undefined}
        />
        <Combobox
          optionName={'succedent name'}
          label={'Succedent name'}
          isLoading={datasetsLoading}
          options={datasetHeaderNames}
          onValueChange={(value) =>
            setCurrentSuccedentName({
              value: value.id,
              errorMessage: undefined,
            })
          }
          errorMessage={currentSuccedentName.errorMessage}
          disabled={currentDataset.value === undefined}
        />
        <Button disabled={isLoading} type={'submit'} className={'mt-2 self-end'}>
          Submit
        </Button>
      </form>
    </div>
  );
}
