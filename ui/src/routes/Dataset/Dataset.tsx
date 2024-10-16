import '../../App.css';
import { useQueryClient } from '@tanstack/react-query';
import FileField from '@/components/form/FileField.tsx';
import { z } from 'zod';
import useZodForm from '@/components/form/useZodForm.ts';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';
import { useCreateDataset, useGetDatasets } from '@/api/dataset.ts';
import { LoadingSpinner } from '@/components/ui/loadingSpinner.tsx';

const datasetSchema = z.object({
  file: z.any(),
});

const datasetDefaultValues = {
  file: null as unknown as File,
} satisfies DatasetSchemaT;

type DatasetSchemaT = z.infer<typeof datasetSchema>;

export default function Dataset() {
  const queryClientFromHook = useQueryClient();

  const { register, setValue } = useZodForm({
    schema: datasetSchema,
    defaultValues: datasetDefaultValues,
    mode: 'onSubmit',
  });

  const datasetsQueryResponse = useGetDatasets();

  const { isLoading } = datasetsQueryResponse;
  const datasets = datasetsQueryResponse.data ?? [];

  const uploadDatasetMutation = useCreateDataset(queryClientFromHook);

  const addFile = (file: File) => {
    setValue('file', file);
    uploadDatasetMutation.mutate({
      file: file,
    });
  };

  return (
    <div className={'flex flex-col gap-6 h-full w-full justify-center items-center'}>
      <h1>Datasets</h1>

      <FileField
        name="file"
        register={register}
        setValue={addFile}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .data, .txt"
        multiple={false}
      >
        <div className="flex w-fit items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-2 hover:cursor-pointer">
          <DocumentPlusIcon className="w-6 text-gray-500" />
          <p>Upload new dataset</p>
        </div>
      </FileField>
      <div className={'flex flex-col gap-4'}>
        <div className={'text-lg font-bold'}>Uploaded datasets</div>
        <div className={'flex flex-col gap-2'}>
          {isLoading ? (
            <LoadingSpinner className="h-8 w-8 shrink-0 opacity-80" />
          ) : (
            datasets.map((dataset) => {
              return (
                <div key={dataset.id}>
                  <p>{dataset.name}</p>
                  <a target="_blank" href={dataset.url}>
                    Download
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
