import React, { FormEvent, SetStateAction, useMemo, useState } from 'react';
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
import Antecedent from '@/containers/4ftminer/fourFtForm/Antecedent.tsx';
import Succedent from '@/containers/4ftminer/fourFtForm/Succedent.tsx';
import Condition from '@/containers/4ftminer/fourFtForm/Condition.tsx';
import { FourFtSchemaT, QuantifierField } from '@/schema/fourFtForm.ts';
import { Label } from '@/components/ui/label.tsx';
import { InfoIcon } from '@/components/ui/InfoIcon.tsx';
import TextInputField from '@/components/form/TextInputField.tsx';
import { useFieldArray } from 'react-hook-form';
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
  getValues: UseFormGetValues<T>;
  clearErrors: UseFormClearErrors<T>;
  trigger: UseFormTrigger<T>;
  addQuantifier: (field: QuantifierField) => void;
  removeQuantifier: (index: QuantifierField) => void;
  quantifierOptions: QuantifierField[];
  addAnteSucceToEnd: () => void;
  displayConditions?: boolean;
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
  displayConditions = false,
}: Props<FourFtSchemaT> & { handleSubmit: UseFormHandleSubmit<FourFtSchemaT> }) {
  const [showConditionState, setShowConditionState] = useState(displayConditions);

  const datasetHeaderNames: DatasetHeaderName[] = useMemo(() => {
    const headerNames = currentDataset?.value?.header_names ?? [];
    return headerNames.map((headerName) => ({ id: headerName, name: headerName }));
  }, [currentDataset]);

  const { fields: conditionFields, append: appendCondition } = useFieldArray({
    control,
    name: 'condition',
  });

  const showCondition = showConditionState && conditionFields.length > 0;

  const removeAllConditions = () => setValue('condition', [], { shouldValidate: true });

  const addCondition = () => {
    if (conditionFields.length === 0) {
      appendCondition({ ...anteSucceDefault });
    }
    setShowConditionState(true);
  };

  const onSubmitCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const antecedents = getValues('antecedent');
    const succedents = getValues('succedent');
    const validAntecedents = antecedents.filter((cedent) => cedent.isValid);
    const validSuccedents = succedents.filter((cedent) => cedent.isValid);

    // Handle condition literals if present
    const conditions = getValues('condition') || [];
    const validConditions = conditions.filter((cedent) => cedent.isValid);

    setValue('antecedent', validAntecedents, { shouldValidate: true });
    setValue('succedent', validSuccedents, { shouldValidate: true });

    // Only set condition if we have valid conditions
    if (validConditions.length > 0) {
      setValue('condition', validConditions, { shouldValidate: true });
    }

    const isValid = await trigger();
    if (!isValid) {
      addAnteSucceToEnd();
    }
    await handleSubmit(onSubmit)();
  };

  return (
    <div className={'h-full w-full pt-4 border-gray-200'}>
      <form className={'px-4 flex flex-col items-start w-full'} onSubmit={onSubmitCheck}>
        <div
          className={
            'flex flex-col md:gap-4 mt-8 md:mt-0 items-center md:flex-row justify-center gap-2'
          }
        >
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
            'pt-8 flex flex-col lg:flex-row w-full items-center lg:justify-center lg:items-start gap-12 lg:gap-12 xl:gap-24'
          }
        >
          <Antecedent
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
          <Succedent
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

        {/* Condition section - visually separated */}
        <div className="w-full border-t border-gray-200 mt-4 pt-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center gap-8 mb-2">
                <div className="text-lg font-bold">Condition (Optional)</div>
                {showCondition && (
                  <div
                    onClick={removeAllConditions}
                    className="w-4 h-4 mb-0.5 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
                  >
                    <span className={'mb-0.5'}>-</span>
                  </div>
                )}
              </div>
            </div>

            {showCondition ? (
              <Condition
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
            ) : (
              <Button type="button" onClick={addCondition} variant="outline" className="mb-6">
                Add Condition
              </Button>
            )}
          </div>
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
