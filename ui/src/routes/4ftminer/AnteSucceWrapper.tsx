import { ComboboxHookFormWrapper, Value } from '@/components/form/ComboboxHookFormWrapper';
import {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { FourFtSchemaT } from './FourFtMiner';
import { Button } from '@/components/ui/button';
import { capitalizeFirstLetter } from '@/utils/helperFunction';

type Props = {
  fieldName: 'antecedent' | 'succedent';
  fields:
    | FieldArrayWithId<FourFtSchemaT, 'antecedent', 'id'>[]
    | FieldArrayWithId<FourFtSchemaT, 'succedent', 'id'>[];
  append:
    | UseFieldArrayAppend<FourFtSchemaT, 'antecedent'>
    | UseFieldArrayAppend<FourFtSchemaT, 'succedent'>;
  remove: UseFieldArrayRemove;
  fieldsLength: number;
  register: UseFormRegister<FourFtSchemaT>;
  errors: FieldErrors<FourFtSchemaT>;
  disabled?: boolean;
  setValue: UseFormSetValue<FourFtSchemaT>;
  clearErrors: UseFormClearErrors<FourFtSchemaT>;
  control: Control<FourFtSchemaT>;
  loading: boolean;
  options: Value[];
};

export default function AnteSucceWrapper({
  fieldName,
  fields,
  append,
  remove,
  fieldsLength,
  register,
  errors,
  setValue,
  clearErrors,
  control,
  loading,
  options,
  disabled,
}: Props) {
  return (
    <div className="w-full flex flex-col gap-1">
      {fields.map((field: Record<'id', string>, index: number) => {
        return (
          <div key={field.id} className="flex justify-between items-end">
            <ComboboxHookFormWrapper
              optionName={`${fieldName} name`}
              label={`${capitalizeFirstLetter(fieldName)} name ${index + 1}`}
              isLoading={loading}
              options={options}
              onValueChange={(value) => {
                setValue(`${fieldName}.${index}.name`, value.name);
                clearErrors(`${fieldName}.${index}.name`);
              }}
              disabled={disabled}
              control={control}
              error={errors[fieldName]?.[index]?.name}
              {...register(`${fieldName}.${index}.name`)}
            />
            {index !== 0 && (
              <Button
                onClick={() => remove(index)}
                className="cursor-pointer bg-red-400 hover:bg-red-500"
              >
                -
              </Button>
            )}
            {index === fieldsLength - 1 && (
              <Button
                onClick={() => append({ name: '', id: '' })}
                className="cursor-pointer bg-blue-400 hover:bg-blue-500"
              >
                +
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
