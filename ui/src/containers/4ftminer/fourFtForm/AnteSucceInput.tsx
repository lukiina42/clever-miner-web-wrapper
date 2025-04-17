import { ComboboxHookFormWrapper, Value } from '@/components/form/ComboboxHookFormWrapper.tsx';
import {
  Control,
  FieldError,
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import TextInputField from '@/components/form/TextInputField.tsx';
import { Label } from '@/components/ui/label.tsx';
import { InfoIcon } from '@/components/ui/InfoIcon.tsx';
import Selectbox from '@/components/form/Selectbox.tsx';
import { cedentTypes } from '@/data/cedent.ts';
import SelectOption from '@/components/form/SelectOption.tsx';
import { Button } from '@/components/ui/button.tsx';
import { FourFtSchemaT } from '@/schema/fourFtForm.ts';

type Props = {
  fieldName: 'antecedent' | 'succedent' | 'condition';
  register: UseFormRegister<FourFtSchemaT>;
  errors: FieldErrors<FourFtSchemaT>;
  disabled?: boolean;
  setValue: UseFormSetValue<FourFtSchemaT>;
  clearErrors: UseFormClearErrors<FourFtSchemaT>;
  control: Control<FourFtSchemaT>;
  loading: boolean;
  options: Value[];
  index: number;
  onSubmit: () => Promise<void>;
};

export default function AnteSucceInput({
  fieldName,
  register,
  errors,
  setValue,
  clearErrors,
  onSubmit,
  control,
  loading,
  options,
  disabled,
  index,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <ComboboxHookFormWrapper
          optionName={`literal #${index + 1} name`}
          label={`Literal #${index + 1} name`}
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
            <Label htmlFor={`${fieldName}.${index}.type`}>Literal type</Label>
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
      </div>
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}
