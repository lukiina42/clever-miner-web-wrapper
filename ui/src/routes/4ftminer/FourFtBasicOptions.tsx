import React, { SetStateAction } from 'react';
import { ComboboxWrapper } from '@/components/form/ComboboxWrapper.tsx';
import { Label } from '@/components/ui/label.tsx';
import TextInputField from '@/components/form/TextInputField.tsx';
import { FieldErrors, FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Dataset } from '@/api/dataset.ts';
import { DatasetState, FourFtSchemaT, QuantifierField } from '@/routes/4ftminer/FourFtMiner.tsx';
import { Value } from '@/components/form/ComboboxHookFormWrapper.tsx';
import { anteSucceDefault } from '@/data/cedent.ts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { allQuantifierFields } from '@/data/quantifier.ts';
import { capitalizeFirstLetter } from '@/utils/helperFunction.ts';

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  datasets: Dataset[];
  currentDataset: DatasetState;
  setCurrentDataset: React.Dispatch<SetStateAction<DatasetState>>;
  datasetsLoading: boolean;
  setValue: UseFormSetValue<T>;
  addQuantifier: (field: QuantifierField) => void;
  removeQuantifier: (index: QuantifierField) => void;
  quantifierMenuOptions: QuantifierField[];
}

export default function FourFtBasicOptions({
  datasetsLoading,
  datasets,
  setCurrentDataset,
  setValue,
  currentDataset,
  register,
  errors,
  addQuantifier,
  removeQuantifier,
  quantifierMenuOptions,
}: Props<FourFtSchemaT>) {
  const onDatasetChange = (value: Value) => {
    setCurrentDataset({
      value: datasets.find((dataset) => value.id === dataset.id),
      errorMessage: undefined,
    });
    setValue('antecedent', [anteSucceDefault]);
    setValue('succedent', [anteSucceDefault]);
  };

  const quantifierItems = allQuantifierFields.filter(
    (option) => !quantifierMenuOptions.includes(option)
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className={'flex gap-4'}>
        <ComboboxWrapper
          optionName={'dataset'}
          label={'Dataset'}
          isLoading={datasetsLoading}
          options={datasets}
          onValueChange={onDatasetChange}
          errorMessage={currentDataset.errorMessage}
          value={currentDataset.value}
          disabled={datasetsLoading}
        />

        {quantifierItems.map((option) => (
          <div className={'w-[300px]'}>
            <div className={'flex justify-between w-full'}>
              <Label htmlFor={option}>{capitalizeFirstLetter(option)}</Label>
              <div
                onClick={() => removeQuantifier(option)}
                className="w-4 h-4 mb-0.5 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
              >
                <span className={'mb-0.5'}>-</span>
              </div>
            </div>
            <TextInputField {...register(option)} errorMessage={errors?.[option]?.message} />
          </div>
        ))}
      </div>
      {quantifierMenuOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={
              'text-primary-foreground text-sm font-medium py-2 rounded cursor-pointer bg-black hover:bg-gray-800 w-40'
            }
          >
            <b className={'pr-2'}>+</b>Add quantifier
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Available quantifiers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quantifierMenuOptions.map((option) => (
              <DropdownMenuItem
                className={'cursor-pointer'}
                key={option}
                onClick={() => addQuantifier(option)}
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
