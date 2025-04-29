import '../../../App.css';
import useZodForm from '@/components/form/useZodForm.ts';
import { useState } from 'react';
import FourFtForm from '@/containers/4ftminer/fourFtForm/FourFtForm.tsx';
import { Dataset, useGetDatasets } from '@/api/dataset.ts';
import { useCreateFourFt } from '@/api/fourft.ts';
import { Form } from '@/components/ui/form.tsx';
import { anteSucceDefault } from '@/data/cedent.ts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx';
import { ChevronDown } from 'lucide-react';
import { allQuantifierFields } from '@/data/quantifier.ts';
import clsxm from '@/utils/clsxm.ts';
import {
  enrichSchemaWithQuantifiers,
  fourftDefaultValues,
  FourFtSchemaT,
  QuantifierField,
} from '@/schema/fourFtForm.ts';
import { useNavigate } from '@tanstack/react-router';
import { ClipLoader } from 'react-spinners';
import AlertMessage from '@/components/form/AlertMessage.tsx';

export type DatasetState = {
  value: Dataset | undefined;
  errorMessage: string | undefined;
};

const initialDatasetState: DatasetState = {
  value: undefined,
  errorMessage: undefined,
};

export default function FourFtMinerCreate() {
  const navigate = useNavigate();

  const [currentDatasetState, setCurrentDatasetState] = useState<DatasetState>(initialDatasetState);

  const [formIsOpen, setFormIsOpen] = useState(true);

  const [currentQuantifiers, setCurrentQuantifiers] = useState<QuantifierField[]>([]);
  const quantifierOptions = allQuantifierFields.filter(
    (field) => !currentQuantifiers.includes(field)
  );

  const schema = enrichSchemaWithQuantifiers(currentQuantifiers);

  const form = useZodForm({
    schema: schema,
    defaultValues: fourftDefaultValues,
    mode: 'onSubmit',
  });

  const addQuantifier = (field: QuantifierField) => {
    setCurrentQuantifiers([...currentQuantifiers, field]);
  };

  const removeQuantifier = (field: QuantifierField) => {
    setCurrentQuantifiers(currentQuantifiers.filter((currentField) => currentField !== field));
    form.setValue(field, '');
  };

  const addAnteSucceToEnd = () => {
    const succedents = form.getValues('succedent');
    succedents.push(anteSucceDefault);
    form.setValue('succedent', succedents);
    const antecedents = form.getValues('antecedent');
    antecedents.push(anteSucceDefault);
    form.setValue('antecedent', antecedents);
  };

  const onSubmit = async (data: FourFtSchemaT) => {
    const dataset = currentDatasetState;
    if (dataset.value === undefined) {
      setCurrentDatasetState((prevState) => {
        return {
          ...prevState,
          errorMessage: 'Please select a dataset',
        };
      });
      return;
    }

    processFourFtRequestMutation.mutate({
      dataset_id: dataset.value.id.toString(),
      ...data,
    });

    addAnteSucceToEnd();
  };

  const processFourFtRequestMutation = useCreateFourFt(navigate);

  const datasetsQueryResponse = useGetDatasets();

  const datasets = datasetsQueryResponse.data ?? [];
  const datasetsLoading = datasetsQueryResponse.isLoading;

  return (
    <div className={'flex flex-col w-full h-full items-center'}>
      <div className={'flex flex-col w-full xl:w-4/5 2xl:w-3/5 pb-4'}>
        <Collapsible
          open={formIsOpen}
          onOpenChange={setFormIsOpen}
          className="w-full relative transition-all duration-200 ease-in-out"
        >
          {!formIsOpen && (
            <div className="flex pl-8 pt-8 items-center mb-2">
              <div className="text-xl font-semibold">4ft-Miner parameters Form</div>
            </div>
          )}
          <CollapsibleContent className="w-full">
            {processFourFtRequestMutation.isError && (
              <div className={'pt-4 pl-4'}>
                <AlertMessage message={processFourFtRequestMutation.error.message} />
              </div>
            )}
            <Form {...form}>
              <FourFtForm
                onSubmit={onSubmit}
                handleSubmit={form.handleSubmit}
                register={form.register}
                errors={form.formState.errors}
                control={form.control}
                setValue={form.setValue}
                getValues={form.getValues}
                addAnteSucceToEnd={addAnteSucceToEnd}
                clearErrors={form.clearErrors}
                trigger={form.trigger}
                datasets={datasets}
                setCurrentDataset={setCurrentDatasetState}
                currentDataset={currentDatasetState}
                isLoading={processFourFtRequestMutation.isPending}
                datasetsLoading={datasetsLoading}
                addQuantifier={addQuantifier}
                removeQuantifier={removeQuantifier}
                quantifierOptions={quantifierOptions}
              />
            </Form>
          </CollapsibleContent>
          <CollapsibleTrigger
            className={clsxm(
              `absolute right-[2rem] w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg top-8`
            )}
          >
            <div className={`transition-all ${formIsOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="sr-only">{formIsOpen ? 'Close form' : 'Open form'}</span>
          </CollapsibleTrigger>
        </Collapsible>
        {processFourFtRequestMutation.isPending && (
          <div className={'w-full h-full flex justify-center items-center'}>
            <ClipLoader size={48} />
          </div>
        )}
      </div>
    </div>
  );
}
