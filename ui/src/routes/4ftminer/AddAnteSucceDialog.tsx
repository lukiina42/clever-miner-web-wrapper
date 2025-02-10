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
import AnteSucceInput from '@/routes/4ftminer/AnteSucceInput.tsx';
import { AnteSucceInputProps } from '@/type/anteSucceInput.ts';
import { FourFtSchemaT } from '@/schema/fourFtForm.ts';

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
}: AnteSucceInputProps<FourFtSchemaT>) {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add {title}</DialogTitle>
          <DialogDescription>
            Enter {title} #{fieldLength} values
          </DialogDescription>
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
