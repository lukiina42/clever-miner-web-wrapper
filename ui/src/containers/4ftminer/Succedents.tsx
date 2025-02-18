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
import SucceBaseParameters from '@/containers/4ftminer/SucceBaseParameters.tsx';
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

export default function Succedents({
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
    fields: succedentFields,
    append: appendSuccedent,
    remove: removeSuccedent,
  } = useFieldArray({
    name: 'succedent',
    control,
  });

  const disabledAdding = currentDataset.value === undefined;

  const handleAddClick = () => {
    if (disabledAdding) displayNotification('Choose a dataset first', 'info');
  };

  const errorMessage = errors.succedent?.message ?? errors.succedent?.root?.message ?? '';

  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'text-lg font-bold'}>Configure succedents</div>
      <div className="flex flex-col gap-6 items-center w-fit">
        <SucceBaseParameters register={register} errors={errors} />
        <AnteSucceList
          remove={removeSuccedent}
          title={'succedent'}
          append={appendSuccedent}
          errors={errors}
          register={register}
          clearErrors={clearErrors}
          setValue={setValue}
          trigger={trigger}
          control={control}
          datasetsLoading={datasetsLoading}
          datasetHeaderNames={datasetHeaderNames}
          currentDataset={currentDataset}
          fieldLength={succedentFields.length}
        />
        <AddAnteSucceDialog
          title={'succedent'}
          append={appendSuccedent}
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
          fieldLength={succedentFields.length}
        >
          <div className={'flex flex-col gap-2 items-center'}>
            <Button
              onClick={handleAddClick}
              type="button"
              className="cursor-pointer bg-black hover:bg-gray-800 w-40"
            >
              <b>+</b> Add succedent
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
