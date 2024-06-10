import '../../App.css'
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery
} from "@tanstack/react-query";
import {z} from "zod";
import useZodForm from "@/components/form/useZodForm.ts";
import {Combobox} from "@/components/form/Combobox.tsx";
import {useState} from "react";
import TextInputField from "@/components/form/TextInputField.tsx";
import {FloatMandatory, IntMandatory, StringMandatory} from "@/components/form/formValidationTypes.ts";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";

const fourftSchema = z.object({
  base: IntMandatory(1, 1000000),
  confidence: FloatMandatory(0.001, 1),
  antecedentName: StringMandatory(256),
  succedentName: StringMandatory(256),
});

const fourftDefaultValues = {
  base: "",
    confidence: "",
    antecedentName: "",
    succedentName: "",
} satisfies DatasetSchemaT;

type DatasetSchemaT = z.infer<typeof fourftSchema>;

interface Dataset {
    created_at: string;
    id: string;
    name: string;
    url: string;
}

export default function FourFtMiner() {

  const queryClientFromHook = useQueryClient()

    const [currentDataset, setCurrentDataset] = useState<Dataset | undefined>()

  const { register, handleSubmit, formState: {errors} } = useZodForm({
    schema: fourftSchema,
    defaultValues: fourftDefaultValues,
    mode: 'onSubmit',
  });

  const onSubmit = async (data: DatasetSchemaT) => {
    console.log(data)
    const dataset = currentDataset
    if (!dataset) {
        console.error('No dataset selected')
        return
    }
    processFourFtRequestMutation.mutate({
        dataset_id: dataset.id,
        ...data,
    })
    // const result = await fetch('http://localhost:8000/clever-miner/4ft', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         datasetId: dataset.id,
    //         base: data.base,
    //         confidence: data.confidence,
    //         antecedentName: data.antecedentName,
    //         succedentName: data.succedentName,
    //     }),
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // })
    //console.log(await result.json())
  }

    const processFourFtRequestMutation = useMutation({
        mutationFn: async (data: DatasetSchemaT & {
            dataset_id: string;
        }) => {
            const stringifiedData = JSON.stringify(data)
            const result = await fetch('http://localhost:8000/clever-miner/fourftminer', {
                method: 'POST',
                body: stringifiedData,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            return result.json()
        },
        onSuccess: async (data) => {
            console.log(data)
            await queryClientFromHook.invalidateQueries({queryKey: ["datasets"]})
        },
        onError: (error) => {
            console.error(error)
        }
    })

    const datasetsQueryResponse = useSuspenseQuery({
        queryKey: ["datasets"],
        queryFn: async () => {
            const fetchResult = await fetch('http://localhost:8000/clever-miner/dataset')
            return await fetchResult.json()
        },
    })

    const datasets = datasetsQueryResponse.data as Dataset[]

      return (
          <div className={"flex flex-col gap-8 w-full h-full justify-center items-center"}>
            <div className={"text-2xl font-bold"}>4FT Miner</div>
              <form className={'flex flex-col items-start gap-5 w-[300px]'} onSubmit={handleSubmit(onSubmit)}>
                  <div className={'text-lg font-bold'}>Configure options</div>
                  <div className={"flex flex-col gap-1"}>
                    <Label htmlFor="dataset">Dataset</Label>
                    <Combobox optionName={"dataset"} options={datasets} onValueChange={(value) => setCurrentDataset(datasets.find(dataset => value.id === dataset.id))} />
                  </div>
                  <div className={'w-full'}>
                    <Label htmlFor="base">Base</Label>
                    <TextInputField {...register("base")} placeholder={'1000'} errorMessage={errors?.base?.message} />
                  </div>
                  <div className={'w-full'}>
                      <Label htmlFor="confidence">Confidence</Label>
                      <TextInputField {...register("confidence")} placeholder={'0.6'} errorMessage={errors?.confidence?.message} />
                  </div>
                  <div className={'w-full'}>
                      <Label htmlFor="antecedentName">Antecedent name</Label>
                      <TextInputField {...register("antecedentName")} placeholder={'Age'} errorMessage={errors?.antecedentName?.message} />
                  </div>
                  <div className={'w-full'}>
                      <Label htmlFor="succedentName">Succedent name</Label>
                      <TextInputField {...register("succedentName")} placeholder={'Income'} errorMessage={errors?.succedentName?.message}/>
                  </div>
                  <Button type={'submit'}>Submit</Button>
              </form>
          </div>
      )
}