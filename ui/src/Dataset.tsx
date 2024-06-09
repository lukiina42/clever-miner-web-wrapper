import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {QueryClient, QueryClientProvider, useMutation, useQueryClient} from "@tanstack/react-query";
import FileField from "./component/form/FileField.tsx";
import {z} from "zod";
import useZodForm from "./component/form/useZodForm.ts";

const datasetSchema = z.object({
  file: z.any(),
});

const datasetDefaultValues = {
  file: null as unknown as File,
} satisfies DatasetSchemaT;

type DatasetSchemaT = z.infer<typeof datasetSchema>;

export default function Dataset() {

  const queryClientFromHook = useQueryClient()

  const { register, setValue } = useZodForm({
    schema: datasetSchema,
    defaultValues: datasetDefaultValues,
    mode: 'onSubmit',
  });

    const uploadDatasetMutation = useMutation({
        mutationFn: async (dataset: {
            name: string,
            file: File
        }) => {
            const data = new FormData()
            data.append('name', dataset.name)
            data.append('file', dataset.file)
            console.log(data.get('file'))
            const result = await fetch('http://localhost:8000/clever-miner/dataset', {
                method: 'POST',
                body: data,
            })
            return result.json()
        },
        onSuccess: async (data) => {
            console.log(data)
            await queryClientFromHook.invalidateQueries({queryKey: "datasets"})
        },
        onError: (error) => {
            console.error(error)
        }
    })

  const addFile = (file: File) => {
    setValue('file', file);
    uploadDatasetMutation.mutate({
      file: file,
      name: "beautiful name"
    });
  };

  return (
      <div className={"flex flex-col gap-2"}>
      <h1>Dataset upload</h1>

      <FileField
        name="file"
        register={register}
        setValue={addFile}
        accept="csv"
        multiple={false}
      >
          <div className="card">
            <p>
              Upload your dataset noob
            </p>
          </div>
      </FileField>
          </div>
  )
}