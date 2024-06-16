import React, { SetStateAction } from 'react';
import { Label } from '@/components/ui/label.tsx';
import { Combobox } from '@/components/form/Combobox.tsx';
import FormErrorMessage from '@/components/form/FormErrorMessage.tsx';
import TextInputField from '@/components/form/TextInputField.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Dataset, DatasetSchemaT } from '@/routes/4ftminer/FourFtMiner.tsx';
import { FieldErrors, FieldValues, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';

interface Props<T extends FieldValues> {
  onSubmit: (data: T) => void;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  datasets: Dataset[];
  setCurrentDataset: React.Dispatch<SetStateAction<Dataset | undefined>>;
  displayDatasetErrorMessage: boolean;
  isLoading: boolean;
}

export default function FourFtForm({
  onSubmit,
  handleSubmit,
  register,
  errors,
  datasets,
  setCurrentDataset,
  displayDatasetErrorMessage,
  isLoading,
}: Props<DatasetSchemaT> & { handleSubmit: UseFormHandleSubmit<DatasetSchemaT> }) {
  return (
    <div className={'h-full px-4 pt-4 border-r-2 border-gray-200 w-fit'}>
      <form
        className={'flex flex-col gap-1 items-start w-[300px]'}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={'text-lg font-bold'}>Configure options</div>
        <div className={'flex flex-col gap-1'}>
          <Label htmlFor="dataset">Dataset</Label>
          <Combobox
            optionName={'dataset'}
            options={datasets}
            onValueChange={(value) =>
              setCurrentDataset(datasets.find((dataset) => value.id === dataset.id))
            }
          />
          {displayDatasetErrorMessage && (
            <FormErrorMessage errorMessage={'You must choose one of the datasets'} />
          )}
        </div>
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
        <div className={'w-full'}>
          <Label htmlFor="antecedentName">Antecedent name</Label>
          <TextInputField
            {...register('antecedentName')}
            placeholder={'Age'}
            errorMessage={errors?.antecedentName?.message}
          />
        </div>
        <div className={'w-full'}>
          <Label htmlFor="succedentName">Succedent name</Label>
          <TextInputField
            {...register('succedentName')}
            placeholder={'Income'}
            errorMessage={errors?.succedentName?.message}
          />
        </div>
        <Button disabled={isLoading} type={'submit'} className={'mt-2 self-end'}>
          Submit
        </Button>
      </form>
    </div>
  );
}
