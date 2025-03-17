import React, { FormEvent, SetStateAction, useMemo } from 'react';
import { Button } from '@/components/ui/button.tsx';
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form';
import { Dataset } from '@/api/dataset.ts';
import { DatasetState } from '@/containers/4ftminer/fourFtForm/FourFtMinerUpdate.tsx';
import FourFtQuantifiers from '@/containers/4ftminer/fourFtForm/FourFtQuantifiers.tsx';
import FourFtDatasetField from '@/containers/4ftminer/fourFtForm/FourFtDatasetField.tsx';
import Antecedents from '@/containers/4ftminer/fourFtForm/Antecedents.tsx';
import Succedents from '@/containers/4ftminer/fourFtForm/Succedents.tsx';
import { FourFtSchemaT, QuantifierField } from '@/schema/fourFtForm.ts';
import { Label } from '@/components/ui/label.tsx';
import { InfoIcon } from '@/components/ui/InfoIcon.tsx';
import TextInputField from '@/components/form/TextInputField.tsx';

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
  getValues: UseFormGetValues<T>;
  clearErrors: UseFormClearErrors<T>;
  trigger: UseFormTrigger<T>;
  addQuantifier: (field: QuantifierField) => void;
  removeQuantifier: (index: QuantifierField) => void;
  quantifierOptions: QuantifierField[];
  addAnteSucceToEnd: () => void;
}

export type DatasetHeaderName = {
  id: string;
  name: string;
};

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
  trigger,
  control,
  setValue,
  getValues,
  clearErrors,
  addQuantifier,
  removeQuantifier,
  quantifierOptions,
  addAnteSucceToEnd,
}: Props<FourFtSchemaT> & { handleSubmit: UseFormHandleSubmit<FourFtSchemaT> }) {
  const datasetHeaderNames: DatasetHeaderName[] = useMemo(() => {
    const headerNames = currentDataset?.value?.header_names ?? [];
    return headerNames.map((headerName) => ({ id: headerName, name: headerName }));
  }, [currentDataset]);

  const onSubmitCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const antecedents = getValues('antecedent');
    const succedents = getValues('succedent');
    const validAntecedents = antecedents.filter((cedent) => cedent.isValid);
    const validSuccedents = succedents.filter((cedent) => cedent.isValid);

    setValue('antecedent', validAntecedents, { shouldValidate: true });
    setValue('succedent', validSuccedents, { shouldValidate: true });
    const isValid = await trigger();
    if (!isValid) {
      addAnteSucceToEnd();
    }
    await handleSubmit(onSubmit)();
  };

  return (
    <div className={'h-full w-full pt-4 border-gray-200'}>
      <form className={'px-4 flex flex-col items-start w-full'} onSubmit={onSubmitCheck}>
        <div className={'flex gap-4 items-center'}>
          <FourFtDatasetField
            datasets={datasets}
            currentDataset={currentDataset}
            setCurrentDataset={setCurrentDataset}
            datasetsLoading={datasetsLoading}
            setValue={setValue}
          />
          <div className={'w-[300px]'}>
            <div className="flex gap-1 items-center">
              <Label htmlFor={`name`}>Name</Label>
              <InfoIcon textContent="Used for identification of the procedure" />
            </div>
            <TextInputField
              {...register(`name`)}
              errorMessage={errors.name?.message as string | undefined}
            />
          </div>
        </div>
        <div
          className={
            'pt-8 flex flex-col md:flex-row w-full items-center md:justify-center md:items-start gap-12 md:gap-8 lg:gap-12 xl:gap-24'
          }
        >
          <Antecedents
            errors={errors}
            register={register}
            clearErrors={clearErrors}
            setValue={setValue}
            control={control}
            datasetsLoading={datasetsLoading}
            datasetHeaderNames={datasetHeaderNames}
            currentDataset={currentDataset}
            trigger={trigger}
          />
          <FourFtQuantifiers
            register={register}
            errors={errors}
            addQuantifier={addQuantifier}
            removeQuantifier={removeQuantifier}
            quantifierMenuOptions={quantifierOptions}
          />
          <Succedents
            errors={errors}
            register={register}
            clearErrors={clearErrors}
            setValue={setValue}
            control={control}
            datasetsLoading={datasetsLoading}
            datasetHeaderNames={datasetHeaderNames}
            currentDataset={currentDataset}
            trigger={trigger}
          />
        </div>
        <div className="w-full flex items-start justify-end pr-6 pt-12">
          <Button
            disabled={isLoading}
            type={'submit'}
            className={'mt-2 self-end bg-green-500 hover:bg-green-700'}
          >
            Submit 4FT parameters
          </Button>
        </div>
      </form>
    </div>
  );
}
