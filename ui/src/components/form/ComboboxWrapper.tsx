import { Label } from '@/components/ui/label.tsx';
import FormErrorMessage from '@/components/form/FormErrorMessage.tsx';
import { Combobox } from '@/components/form/Combobox.tsx';

interface Value {
  id: string;
  name: string;
}

interface Props {
  options: Value[];
  onValueChange: (value: Value) => void;
  optionName: string;
  isLoading: boolean;
  label: string;
  errorMessage: string | undefined;
  disabled?: boolean;
}

export function ComboboxWrapper({
  options,
  onValueChange,
  optionName,
  isLoading,
  label,
  errorMessage,
  disabled = false,
}: Props) {
  return (
    <div className={'flex flex-col gap-1'}>
      <Label htmlFor={optionName}>{label}</Label>
      <Combobox
        options={options}
        onValueChange={onValueChange}
        optionName={optionName}
        isLoading={isLoading}
        label={label}
        errorMessage={errorMessage}
        disabled={disabled}
      />
      {errorMessage !== undefined && <FormErrorMessage errorMessage={errorMessage} />}
    </div>
  );
}
