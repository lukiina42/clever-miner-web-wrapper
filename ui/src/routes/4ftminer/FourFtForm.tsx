import React, { SetStateAction, useMemo } from 'react';
import { Label } from '@/components/ui/label.tsx';
import TextInputField from '@/components/form/TextInputField.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormClearErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { Dataset } from '@/api/dataset.ts';
import { DatasetState, FourFtSchemaT } from '@/routes/4ftminer/FourFtMiner.tsx';
import { ComboboxWrapper } from '@/components/form/ComboboxWrapper.tsx';
import { ComboboxHookFormWrapper } from '@/components/form/ComboboxHookFormWrapper';

interface Props<T extends FieldValues> {
  onSubmit: (data: T) => void;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  datasets: Dataset[];
  currentDataset: DatasetState;
  setCurrentDataset: React.Dispatch<SetStateAction<DatasetState>>;
  antecedentName: string;
  succedentName: string;
  isLoading: boolean;
  datasetsLoading: boolean;
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  clearErrors: UseFormClearErrors<T>;
}

export default function FourFtForm({
  onSubmit,
  handleSubmit,
  register,
  errors,
  datasets,
  setCurrentDataset,
  succedentName,
  antecedentName,
  currentDataset,
  isLoading,
  datasetsLoading,
  control,
  setValue,
  clearErrors
}: Props<FourFtSchemaT> & { handleSubmit: UseFormHandleSubmit<FourFtSchemaT> }) {
  const datasetHeaderNames = useMemo(() => {
    const headerNames = currentDataset?.value?.header_names ?? [];
    return headerNames.map((headerName) => ({ id: headerName, name: headerName }));
  }, [currentDataset]);

  return (
    <div className={'h-full px-4 pt-4 border-r-2 border-gray-200 w-fit'}>
      <form
        className={'flex flex-col gap-2 items-start w-[300px]'}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={'text-lg font-bold'}>Configure options</div>
        <ComboboxWrapper
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
          disabled={datasetsLoading}
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
        <ComboboxHookFormWrapper
          optionName={'antecedent Name'}
          label={'Antecedent name'}
          isLoading={datasetsLoading}
          options={datasetHeaderNames}
          onValueChange={(value) => {
            setValue('antecedentName', value.name);
            clearErrors('antecedentName')
          }}
          disabled={currentDataset.value === undefined}
          value={antecedentName}
          control={control}
          error={errors.antecedentName}
          {...register('antecedentName')}
        />
        <ComboboxHookFormWrapper
          optionName={'succedent name'}
          label={'Succedent name'}
          isLoading={datasetsLoading}
          options={datasetHeaderNames}
          onValueChange={(value) => {
            setValue('succedentName', value.name);
            clearErrors('succedentName')
          }}
          value={succedentName}
          control={control}
          error={errors.succedentName}
          disabled={currentDataset.value === undefined}
          {...register('succedentName')}
        />
        <Button disabled={isLoading} type={'submit'} className={'mt-2 self-end'}>
          Submit
        </Button>
      </form>
    </div>
  );
}
