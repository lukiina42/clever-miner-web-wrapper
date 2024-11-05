import { ComboboxHookFormWrapper, Value } from '@/components/form/ComboboxHookFormWrapper';
import {
  Control,
  FieldArrayWithId,
  FieldError,
  FieldErrors,
  UseFieldArrayRemove,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { FourFtSchemaT } from './FourFtMiner';
import { Button } from '@/components/ui/button';
import { capitalizeFirstLetter } from '@/utils/helperFunction';
import TextInputField from '@/components/form/TextInputField';
import { Label } from '@/components/ui/label';
import { InfoIcon } from '@/components/ui/InfoIcon';
import Selectbox from '@/components/form/Selectbox';
import { cedentTypes } from '@/data/cedent';
import SelectOption from '@/components/form/SelectOption';

type Props = {
  fieldName: 'antecedent' | 'succedent';
  fields:
    | FieldArrayWithId<FourFtSchemaT, 'antecedent', 'id'>[]
    | FieldArrayWithId<FourFtSchemaT, 'succedent', 'id'>[];
  remove: UseFieldArrayRemove;
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
  remove,
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
          <div key={field.id} className="flex flex-col gap-4">
            <div className="flex gap-4 items-end">
              <ComboboxHookFormWrapper
                optionName={`${fieldName} #${index + 1} name`}
                label={`${capitalizeFirstLetter(fieldName)} #${index + 1} name`}
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
              <div className={'w-[300px]'}>
                <div className="flex gap-1 items-center">
                  <Label htmlFor={`${fieldName}.${index}.type`}>
                    {capitalizeFirstLetter(fieldName)} type
                  </Label>
                  <InfoIcon
                    textContent={
                      <a
                        target="_blank"
                        className="underline"
                        href="https://www.cleverminer.org/doc/index.html#literal-types"
                      >
                        Types specification
                      </a>
                    }
                  />
                </div>
                <Selectbox
                  {...register(`${fieldName}.${index}.type`)}
                  error={errors[fieldName]?.[index]?.type as FieldError}
                >
                  {cedentTypes.map((option, i) => {
                    return (
                      <SelectOption key={i} value={option.value}>
                        {option.label}
                      </SelectOption>
                    );
                  })}
                </Selectbox>
              </div>
              <div className={'w-[300px]'}>
                <div className="flex gap-1 items-center">
                  <Label htmlFor={`${fieldName}.${index}.minLen`}>Min. length</Label>
                  <InfoIcon textContent="Minimal amount of dataset fields used in a subset" />
                </div>
                <TextInputField
                  {...register(`${fieldName}.${index}.minLen`)}
                  errorMessage={errors[fieldName]?.[index]?.minLen?.message as string | undefined}
                />
              </div>
              <div className={'w-[300px]'}>
                <div className="flex gap-1 items-center">
                  <Label htmlFor={`${fieldName}.${index}.maxLen`}>Max. length</Label>
                  <InfoIcon textContent="Maximal amount of dataset fields used in a subset" />
                </div>
                <TextInputField
                  {...register(`${fieldName}.${index}.maxLen`)}
                  errorMessage={errors[fieldName]?.[index]?.maxLen?.message as string | undefined}
                />
              </div>
              {index !== 0 && (
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="cursor-pointer bg-red-400 hover:bg-red-500"
                >
                  -
                </Button>
              )}
            </div>
            {index !== fields.length - 1 && <div className="w-full border-2 my-4 rounded-xl"></div>}
          </div>
        );
      })}
    </div>
  );
}
