import React, { SetStateAction } from 'react';
import { ComboboxWrapper } from '@/components/form/ComboboxWrapper.tsx';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import { Dataset } from '@/api/dataset.ts';
import { DatasetState } from '@/containers/4ftminer/FourFtMinerUpdate.tsx';
import { Value } from '@/components/form/ComboboxHookFormWrapper.tsx';
import { anteSucceDefault } from '@/data/cedent.ts';
import { FourFtSchemaT } from '@/schema/fourFtForm.ts';

interface Props<T extends FieldValues> {
  datasets: Dataset[];
  currentDataset: DatasetState;
  setCurrentDataset: React.Dispatch<SetStateAction<DatasetState>>;
  datasetsLoading: boolean;
  setValue: UseFormSetValue<T>;
}

export default function FourFtDatasetField({
  datasetsLoading,
  datasets,
  setCurrentDataset,
  setValue,
  currentDataset,
}: Props<FourFtSchemaT>) {
  const onDatasetChange = (value: Value) => {
    setCurrentDataset({
      value: datasets.find((dataset) => value.id === dataset.id),
      errorMessage: undefined,
    });
    setValue('antecedent', [anteSucceDefault]);
    setValue('succedent', [anteSucceDefault]);
  };

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
      </div>
    </div>
  );
}
