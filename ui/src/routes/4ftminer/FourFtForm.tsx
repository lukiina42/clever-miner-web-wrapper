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
import AnteSucceBaseParameters from './AnteSucceBaseParameters';
import { Value } from '@/components/form/ComboboxHookFormWrapper.tsx';
import { anteSucceDefault } from '@/data/cedent.ts';

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
    remove: removeSuccedent,
  } = useFieldArray({
    name: 'succedent',
    control,
  });

  const onDatasetChange = (value: Value) => {
    setCurrentDataset({
      value: datasets.find((dataset) => value.id === dataset.id),
      errorMessage: undefined,
    });
    setValue('antecedent', [anteSucceDefault]);
    setValue('succedent', [anteSucceDefault]);
  };

  return (
    <div className={'h-full pt-4 border-gray-200'}>
      <form className={'px-4 flex flex-col items-start w-full'} onSubmit={handleSubmit(onSubmit)}>
        <div className={'w-full flex justify-between'}>
          <div className={'text-lg font-bold'}>Configure basic options</div>
          <Button disabled={isLoading} type={'submit'} className={'mt-2 self-end bg-green-500'}>
            Submit 4FT parameters
          </Button>
        </div>
        <div className="flex gap-4 p-4">
          <ComboboxWrapper
            optionName={'dataset'}
            label={'Dataset'}
            isLoading={datasetsLoading}
            options={datasets}
            onValueChange={onDatasetChange}
            errorMessage={currentDataset.errorMessage}
            disabled={datasetsLoading}
          />
          <div className={'w-[300px]'}>
            <Label htmlFor="base">Base</Label>
            <TextInputField
              {...register('base')}
              errorMessage={errors?.base?.message as string | undefined}
            />
          </div>
          <div className={'w-[300px]'}>
            <Label htmlFor="confidence">Confidence</Label>
            <TextInputField
              {...register('confidence')}
              errorMessage={errors?.confidence?.message as string | undefined}
            />
          </div>
        </div>
        <div className={'text-lg font-bold'}>Configure antecedents</div>
        <div className="flex flex-col gap-6 p-4">
          <AnteSucceBaseParameters fieldName="antecedent" register={register} errors={errors} />
          <div className="w-full border-2 rounded-xl"></div>
          <AnteSucceWrapper
            fieldName={'antecedent'}
            remove={removeAntecedent}
            fields={antecedentFields}
            errors={errors}
            register={register}
            clearErrors={clearErrors}
            setValue={setValue}
            control={control}
            loading={datasetsLoading}
            options={datasetHeaderNames}
            disabled={currentDataset.value === undefined}
          />
          <Button
            type="button"
            onClick={() => appendAntecedent(anteSucceDefault)}
            className="cursor-pointer bg-black hover:bg-blue-500 w-40"
          >
            <b>+</b> Add antecedent
          </Button>
        </div>
        <div className={'text-lg font-bold'}>Configure succedents</div>
        <div className="flex flex-col gap-6 p-4">
          <AnteSucceBaseParameters fieldName="succedent" register={register} errors={errors} />
          <div className="w-full border-2 rounded-xl"></div>
          <AnteSucceWrapper
            fieldName={'succedent'}
            remove={removeSuccedent}
            fields={succedentFields}
            errors={errors}
            register={register}
            clearErrors={clearErrors}
            setValue={setValue}
            control={control}
            loading={datasetsLoading}
            options={datasetHeaderNames}
            disabled={currentDataset.value === undefined}
          />
          <Button
            type="button"
            onClick={() => appendSuccedent(anteSucceDefault)}
            className="cursor-pointer bg-black hover:bg-blue-500 w-40"
          >
            <b>+</b> Add succedent
          </Button>
        </div>
      </form>
    </div>
  );
}
