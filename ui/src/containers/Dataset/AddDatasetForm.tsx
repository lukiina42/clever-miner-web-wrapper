import { Button } from '@/components/ui/button.tsx';
import { useQueryClient } from '@tanstack/react-query';
import useZodForm from '@/components/form/useZodForm.ts';
import { useCreateDataset } from '@/api/dataset.ts';
import FileField from '@/components/form/FileField.tsx';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';
import { z } from 'zod';
import TextInputField from '@/components/form/TextInputField.tsx';
import { StringMandatory, StringOptional } from '@/components/form/formValidationTypes.ts';
import { FormProvider } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { delimiters, DelimiterType } from '@/data/delimiter.ts';
import ButtonLoader from '@/components/ui/ButtonLoader.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Dispatch, SetStateAction } from 'react';
import AlertMessage from '@/components/form/AlertMessage.tsx';

const datasetSchema = z
  .object({
    file: z.any().refine((value) => value !== null && value !== undefined, {
      message: 'Please select a file',
    }),
    delimiter: StringMandatory(32),
    delimiterText: StringOptional(32).nullable().optional(),
  })
  .superRefine(({ delimiter, delimiterText }, ctx) => {
    if (delimiter === DelimiterType.Other && delimiterText === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please specify custom delimiter',
        path: ['delimiterText'],
      });
    }
  });

const datasetDefaultValues = {
  file: null as unknown as File,
  delimiter: '',
  delimiterText: null,
} satisfies DatasetSchemaT;

type DatasetSchemaT = z.infer<typeof datasetSchema>;

export default function AddDatasetForm({
  setIsOpen,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const queryClientFromHook = useQueryClient();

  const form = useZodForm({
    schema: datasetSchema,
    defaultValues: datasetDefaultValues,
    mode: 'onSubmit',
  });

  const { register, setValue, formState, handleSubmit, watch, clearErrors } = form;

  const file = watch('file') as File | null;

  const uploadDatasetMutation = useCreateDataset(queryClientFromHook, setIsOpen);

  const onSubmit = (data: DatasetSchemaT) => {
    const delimiter = data.delimiter === DelimiterType.Other ? data.delimiterText! : data.delimiter;
    const mutationData = {
      file: data.file,
      delimiter,
    };
    uploadDatasetMutation.mutate(mutationData);
  };

  const errors = formState.errors;

  const addFile = (file: File) => {
    setValue('file', file);
    clearErrors('file');
  };

  const delimiter = watch('delimiter');

  return (
    <FormProvider {...form}>
      <form className="grid gap-4 py-2" onSubmit={handleSubmit(onSubmit)}>
        {uploadDatasetMutation.isError && (
          <AlertMessage message={uploadDatasetMutation.error.message} />
        )}

        <FormField
          control={form.control}
          name="delimiter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delimiter</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a delimiter" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {delimiters.map((delimiter) => (
                    <SelectItem
                      className={'cursor-pointer hover:bg-gray-100'}
                      key={delimiter.value}
                      value={delimiter.value}
                    >
                      {delimiter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {delimiter === DelimiterType.Other && (
          <div className={'w-[300px] pb-2'}>
            <Label htmlFor="delimiterText">Custom delimiter</Label>
            <TextInputField
              {...register('delimiterText', {
                onChange: (event) => {
                  const value = event.target.value;
                  setValue('delimiterText', value || null);
                  if (value !== '') {
                    clearErrors('delimiterText');
                  }
                },
              })}
              errorMessage={errors?.delimiterText?.message as string | undefined}
            />
          </div>
        )}
        <FileField
          name="file"
          register={register as any}
          setValue={addFile}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .data, .txt"
          multiple={false}
          errorMessage={errors?.file?.message as string | undefined}
        >
          <div className="flex w-fit items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-2 hover:cursor-pointer hover:bg-gray-100">
            <DocumentPlusIcon className="w-6 text-gray-500" />
            <p>Select a file with the data</p>
          </div>
        </FileField>
        {file !== null && (
          <div>
            Selected file: <span className={'font-bold'}>{file.name}</span>
          </div>
        )}
        <Button type="submit" disabled={uploadDatasetMutation.isPending}>
          {uploadDatasetMutation.isPending ? <ButtonLoader /> : 'Save changes'}
        </Button>
      </form>
    </FormProvider>
  );
}
