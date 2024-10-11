import '../../App.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FileField from '@/components/form/FileField.tsx';
import { z } from 'zod';
import useZodForm from '@/components/form/useZodForm.ts';
import { BeatLoader } from 'react-spinners';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';
import {baseApiUrl} from "@/utils/constants.ts";

const datasetSchema = z.object({
  file: z.any(),
});

const datasetDefaultValues = {
  file: null as unknown as File,
} satisfies DatasetSchemaT;

type DatasetSchemaT = z.infer<typeof datasetSchema>;

interface Dataset {
  created_at: string;
  id: string;
  name: string;
  url: string;
}

export default function Dataset() {
  const queryClientFromHook = useQueryClient();

  const { register, setValue } = useZodForm({
    schema: datasetSchema,
    defaultValues: datasetDefaultValues,
    mode: 'onSubmit',
  });

  const datasetsQueryResponse = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const fetchResult = await fetch('http://localhost:8000/clever-miner/dataset');
      return await fetchResult.json();
    },
  });

  const { isLoading, error } = datasetsQueryResponse;
  const datasets = datasetsQueryResponse.data as Dataset[];

  const uploadDatasetMutation = useMutation({
    mutationFn: async (dataset: { file: File }) => {
      const data = new FormData();
      data.append('file', dataset.file);
      console.log(data.get('file'));
      const result = await fetch('http://localhost:8000/clever-miner/dataset', {
        method: 'POST',
        body: data,
      });
      return result.json();
    },
    onSuccess: async (data) => {
      console.log(data);
      await queryClientFromHook.invalidateQueries({ queryKey: ['datasets'] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

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
            <BeatLoader
              size={15}
              color={'black'}
              cssOverride={{ alignItems: 'center' }}
              aria-label="Loading Spinner"
            />
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
