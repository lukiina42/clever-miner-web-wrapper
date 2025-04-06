import { Label } from '@/components/ui/label.tsx';
import FormErrorMessage from '@/components/form/FormErrorMessage.tsx';
import { Combobox } from '@/components/form/Combobox.tsx';
import { Value } from '@/type/combobox.ts';

interface Props {
  options: Value[];
  onValueChange: (value: Value) => void;
  optionName: string;
  isLoading: boolean;
  label: string;
  errorMessage: string | undefined;
  disabled?: boolean;
  value: Value | undefined;
}

export function ComboboxWrapper({
  options,
  onValueChange,
  optionName,
  isLoading,
  label,
  errorMessage,
  value,
  disabled = false,
}: Props) {
  return (
    <div className={'relative flex flex-col gap-1 justify-end'}>
      <Label htmlFor={optionName}>{label}</Label>
      <Combobox
        options={options}
        onValueChange={onValueChange}
        optionName={optionName}
        isLoading={isLoading}
        disabled={disabled}
        value={value}
      />
      {errorMessage !== undefined && (
        <FormErrorMessage className="top-[-4rem]" errorMessage={errorMessage} />
      )}
    </div>
  );
}
