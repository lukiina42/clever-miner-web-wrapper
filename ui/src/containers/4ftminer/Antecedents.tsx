import AnteBaseParameters from '@/containers/4ftminer/AnteBaseParameters.tsx';
import {
  Control,
  FieldErrors,
  FieldValues,
  useFieldArray,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form';
import { DatasetState } from '@/containers/4ftminer/FourFtMinerUpdate.tsx';
import { DatasetHeaderName } from '@/containers/4ftminer/FourFtForm.tsx';
import AddAnteSucceDialog from '@/containers/4ftminer/AddAnteSucceDialog.tsx';
import AnteSucceList from '@/containers/4ftminer/AnteSucceList.tsx';
import { Button } from '@/components/ui/button.tsx';
import { displayNotification } from '@/utils/displayNotification.ts';
import { FourFtSchemaT } from '@/schema/fourFtForm.ts';

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  currentDataset: DatasetState;
  datasetsLoading: boolean;
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  clearErrors: UseFormClearErrors<T>;
  datasetHeaderNames: DatasetHeaderName[];
  trigger: UseFormTrigger<T>;
}

export default function Antecedents({
  register,
  errors,
  currentDataset,
  datasetsLoading,
  control,
  setValue,
  trigger,
  clearErrors,
  datasetHeaderNames,
}: Props<FourFtSchemaT>) {
  const {
    fields: antecedentFields,
    append: appendAntecedent,
    remove: removeAntecedent,
  } = useFieldArray({
    name: 'antecedent',
    control,
  });

  const disabledAdding = currentDataset.value === undefined;

  const handleAddClick = () => {
    if (disabledAdding) displayNotification('Choose a dataset first', 'info');
  };

  const errorMessage = errors.antecedent?.message ?? errors.antecedent?.root?.message ?? '';

  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'text-lg font-bold'}>Configure antecedents</div>
      <div className="flex flex-col gap-6 items-center w-fit">
        <AnteBaseParameters register={register} errors={errors} />
        <AnteSucceList
          remove={removeAntecedent}
          title={'antecedent'}
          append={appendAntecedent}
          errors={errors}
          register={register}
          clearErrors={clearErrors}
          setValue={setValue}
          trigger={trigger}
          control={control}
          datasetsLoading={datasetsLoading}
          datasetHeaderNames={datasetHeaderNames}
          currentDataset={currentDataset}
          fieldLength={antecedentFields.length}
        />
        <AddAnteSucceDialog
          title={'antecedent'}
          append={appendAntecedent}
          errors={errors}
          register={register}
          clearErrors={clearErrors}
          setValue={setValue}
          isUpdate={false}
          trigger={trigger}
          control={control}
          datasetsLoading={datasetsLoading}
          datasetHeaderNames={datasetHeaderNames}
          currentDataset={currentDataset}
          fieldLength={antecedentFields.length}
        >
          <div className={'flex flex-col gap-2 items-center'}>
            <Button
              onClick={handleAddClick}
              type="button"
              className="cursor-pointer bg-black hover:bg-gray-800 w-40"
            >
              <b>+</b> Add antecedent
            </Button>
            {errorMessage !== '' && (
              <div className={'text-xs font-medium text-red-500'}>{errorMessage}</div>
            )}
          </div>
        </AddAnteSucceDialog>
      </div>
    </div>
  );
}
