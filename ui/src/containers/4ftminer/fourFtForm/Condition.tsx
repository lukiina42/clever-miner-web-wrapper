import CedentBaseConditionParameters from '@/containers/4ftminer/fourFtForm/CedentBaseConditionParameters.tsx';
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
import { DatasetState } from '@/containers/4ftminer/fourFtForm/FourFtMinerUpdate.tsx';
import { DatasetHeaderName } from '@/containers/4ftminer/fourFtForm/FourFtForm.tsx';
import AddAnteSucceDialog from '@/containers/4ftminer/fourFtForm/AddAnteSucceDialog.tsx';
import CedentLiteralList from '@/containers/4ftminer/fourFtForm/CedentLiteralList.tsx';
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

export default function Condition({
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
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    name: 'condition',
    control,
  });

  const disabledAdding = currentDataset.value === undefined;

  const handleAddClick = () => {
    if (disabledAdding) displayNotification('Choose a dataset first', 'info');
  };

  const errorMessage = errors.condition?.message ?? errors.condition?.root?.message ?? '';

  return (
    <div className={'flex flex-col gap-2'}>
      <div className="flex flex-col gap-6 items-center w-fit">
        <CedentBaseConditionParameters register={register} errors={errors} />
        <CedentLiteralList
          remove={removeCondition}
          title={'condition'}
          append={appendCondition}
          errors={errors}
          register={register}
          clearErrors={clearErrors}
          setValue={setValue}
          trigger={trigger}
          control={control}
          datasetsLoading={datasetsLoading}
          datasetHeaderNames={datasetHeaderNames}
          currentDataset={currentDataset}
          fieldLength={conditionFields.length}
        />
        <AddAnteSucceDialog
          title={'condition'}
          append={appendCondition}
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
          fieldLength={conditionFields.length}
        >
          <div className={'flex flex-col gap-2 items-center'}>
            <Button
              onClick={handleAddClick}
              type="button"
              className="cursor-pointer bg-black hover:bg-gray-800 w-40"
            >
              <b>+</b> Add literal
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