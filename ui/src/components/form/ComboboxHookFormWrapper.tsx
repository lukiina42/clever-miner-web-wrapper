import { Label } from '@/components/ui/label.tsx';
import FormErrorMessage from '@/components/form/FormErrorMessage.tsx';
import { Control, FieldError, FieldValues, UseFormSetValue } from 'react-hook-form';
import { FormField, FormItem } from '@/components/ui/form.tsx';
import { ComboboxHookForm } from './ComboboxHookForm';

interface Value {
  id: string;
  name: string;
}

interface Props {
  options: Value[];
  onValueChange: (value: Value) => void;
  optionName: string;
  isLoading: boolean;
  name: string;
  label: string;
  error: FieldError | undefined;
  disabled?: boolean;
  setValue: UseFormSetValue<FieldValues>;
  value: string;
  control: Control<FieldValues>;
}

export function ComboboxHookFormWrapper({
  options,
  onValueChange,
  optionName,
  name,
  isLoading,
  label,
  error,
  disabled = false,
  control,
}: Props) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1">
          <Label htmlFor={optionName}>{label}</Label>
          <ComboboxHookForm
            options={options}
            onValueChange={onValueChange}
            optionName={optionName}
            isLoading={isLoading}
            disabled={disabled}
            value={field.value}
          />
          {error?.message !== undefined && <FormErrorMessage errorMessage={error.message} />}
        </FormItem>
      )}
    />
  );
}
