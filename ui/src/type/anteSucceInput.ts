import {
  Control,
  FieldErrors,
  FieldValues,
  UseFieldArrayAppend,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form';
import { DatasetState, FourFtSchemaT } from '@/routes/4ftminer/FourFtMiner.tsx';
import { DatasetHeaderName } from '@/routes/4ftminer/FourFtForm.tsx';
import { ReactNode } from 'react';

export type AnteSucceInputProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  currentDataset: DatasetState;
  datasetsLoading: boolean;
  control: Control<T>;
  isUpdate: boolean;
  setValue: UseFormSetValue<T>;
  clearErrors: UseFormClearErrors<T>;
  datasetHeaderNames: DatasetHeaderName[];
  trigger: UseFormTrigger<FourFtSchemaT>;
  children: ReactNode;
  fieldLength: number;
} & (
  | {
      title: 'antecedent';
      append: UseFieldArrayAppend<FourFtSchemaT, 'antecedent'>;
    }
  | {
      title: 'succedent';
      append: UseFieldArrayAppend<FourFtSchemaT, 'succedent'>;
    }
);
