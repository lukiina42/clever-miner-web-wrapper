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
  useFieldArray,
} from 'react-hook-form';
import { Dataset } from '@/api/dataset.ts';
import { DatasetState, FourFtSchemaT } from '@/routes/4ftminer/FourFtMiner.tsx';
import { ComboboxWrapper } from '@/components/form/ComboboxWrapper.tsx';
import AnteSucceWrapper from './AnteSucceWrapper';

interface Props<T extends FieldValues> {
  onSubmit: (data: T) => void;
  handleSubmit: UseFormHandleSubmit<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  datasets: Dataset[];
  currentDataset: DatasetState;
  setCurrentDataset: React.Dispatch<SetStateAction<DatasetState>>;
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
  currentDataset,
  isLoading,
  datasetsLoading,
  control,
  setValue,
  clearErrors,
}: Props<FourFtSchemaT> & { handleSubmit: UseFormHandleSubmit<FourFtSchemaT> }) {
  const datasetHeaderNames = useMemo(() => {
    const headerNames = currentDataset?.value?.header_names ?? [];
    return headerNames.map((headerName) => ({ id: headerName, name: headerName }));
  }, [currentDataset]);

  const {
    fields: antecedentFields,
    append: appendAntecedent,
    remove: removeAntecedent,
  } = useFieldArray({
    name: 'antecedent',
    control,
  });

  const {
    fields: succedentFields,
    append: appendSuccedent,
    remove: removesuccedent,
  } = useFieldArray({
    name: 'succedent',
    control,
  });

  console.log(errors);

  return (
    <div className={'h-full px-4 pt-4 border-r-2 border-gray-200 w-fit'}>
      <form
        className={'flex flex-col gap-2 items-start w-[350px]'}
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
        <div className={'w-[300px]'}>
          <Label htmlFor="base">Base</Label>
          <TextInputField
            {...register('base')}
            placeholder={'1000'}
            errorMessage={errors?.base?.message as string | undefined}
          />
        </div>
        <div className={'w-[300px]'}>
          <Label htmlFor="confidence">Confidence</Label>
          <TextInputField
            {...register('confidence')}
            placeholder={'0.6'}
            errorMessage={errors?.confidence?.message as string | undefined}
          />
        </div>
        <AnteSucceWrapper
          fieldName={'antecedent'}
          append={appendAntecedent}
          remove={removeAntecedent}
          fields={antecedentFields}
          errors={errors}
          register={register}
          fieldsLength={antecedentFields.length}
          clearErrors={clearErrors}
          setValue={setValue}
          control={control}
          loading={datasetsLoading}
          options={datasetHeaderNames}
          disabled={currentDataset.value === undefined}
        />
        <AnteSucceWrapper
          fieldName={'succedent'}
          append={appendSuccedent}
          remove={removesuccedent}
          fields={succedentFields}
          errors={errors}
          register={register}
          fieldsLength={succedentFields.length}
          clearErrors={clearErrors}
          setValue={setValue}
          control={control}
          loading={datasetsLoading}
          options={datasetHeaderNames}
          disabled={currentDataset.value === undefined}
        />
        <Button disabled={isLoading} type={'submit'} className={'mt-2 self-end'}>
          Submit
        </Button>
      </form>
    </div>
  );
}
