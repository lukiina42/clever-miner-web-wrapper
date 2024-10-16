import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loadingSpinner.tsx';
import { Label } from '@/components/ui/label.tsx';
import FormErrorMessage from '@/components/form/FormErrorMessage.tsx';

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

export function Combobox({
  options,
  onValueChange,
  optionName,
  isLoading,
  label,
  errorMessage,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <div className={'flex flex-col gap-1'}>
      <Label htmlFor={optionName}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between"
            disabled={disabled}
          >
            {value
              ? options?.find((option) => option.name === value)?.name
              : `Select ${optionName}...`}
            {isLoading ? (
              <LoadingSpinner className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search option..." />
            <CommandEmpty>{`No ${optionName} found.`}</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {options?.map((option) => {
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={(currentValue) => {
                        console.log(currentValue, options);
                        const correspondingOption = options?.find(
                          (option) => option.id === currentValue
                        );
                        console.log(correspondingOption);
                        setValue(correspondingOption?.name ?? '');
                        if (!correspondingOption) return;
                        onValueChange(correspondingOption);
                        setOpen(false);
                      }}
                      className={'items-start cursor-pointer'}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {option.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errorMessage !== undefined && <FormErrorMessage errorMessage={errorMessage} />}
    </div>
  );
}
