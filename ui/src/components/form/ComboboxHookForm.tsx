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

interface Value {
  id: string;
  name: string;
}

interface Props {
  options: Value[];
  onValueChange: (value: Value) => void;
  optionName: string;
  isLoading: boolean;
  disabled?: boolean;
  value: string;
}

export function ComboboxHookForm({
  options,
  onValueChange,
  optionName,
  isLoading,
  disabled = false,
  value,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
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
                      const correspondingOption = options?.find(
                        (option) => option.id === currentValue
                      );
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
  );
}
