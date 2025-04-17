import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { useState } from 'react';
import { anteSucceDefault } from '@/data/cedent.ts';
import AnteSucceInput from '@/containers/4ftminer/fourFtForm/AnteSucceInput.tsx';
import { AnteSucceInputProps } from '@/type/anteSucceInput.ts';
import { FourFtSchemaT } from '@/schema/fourFtForm.ts';

// Updated Props type to include 'condition' as a valid title
type CedentTitle = 'antecedent' | 'succedent' | 'condition';

type Props = Omit<AnteSucceInputProps<FourFtSchemaT>, 'title'> & {
  title: CedentTitle;
};

export default function AddAnteSucceDialog({
  title,
  append,
  register,
  errors,
  currentDataset,
  datasetsLoading,
  isUpdate,
  control,
  setValue,
  clearErrors,
  trigger,
  datasetHeaderNames,
  fieldLength,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const index = fieldLength - 1;

  const validateInput = async () => await trigger(`${title}.${index}`);

  const onSubmit = async () => {
    if (await validateInput()) {
      setValue(`${title}.${index}.isValid`, true);
      setIsOpen(false);
      clearErrors(title);
      if (!isUpdate) {
        append(anteSucceDefault);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-screen">
        <DialogHeader>
          <DialogTitle>Add {title} literal</DialogTitle>
          <DialogDescription>Enter literal #{fieldLength} values</DialogDescription>
        </DialogHeader>
        <AnteSucceInput
          fieldName={title}
          errors={errors}
          register={register}
          clearErrors={clearErrors}
          setValue={setValue}
          control={control}
          loading={datasetsLoading}
          options={datasetHeaderNames}
          disabled={currentDataset.value === undefined}
          onSubmit={onSubmit}
          index={index}
        />
      </DialogContent>
    </Dialog>
  );
}
