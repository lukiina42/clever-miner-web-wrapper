import '../../App.css';
import useZodForm from '@/components/form/useZodForm.ts';
import { useState } from 'react';
import PageHeading from '@/components/ui/PageHeading.tsx';
import FourFtForm from '@/containers/4ftminer/FourFtForm.tsx';
import { Dataset, useGetDatasets } from '@/api/dataset.ts';
import { FourFtResultDetail, useCreateFourFt, useFullUpdateFourFt } from '@/api/fourft.ts';
import FourFtResults from '@/containers/4ftminer/FourFtResults.tsx';
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
  fourftDefaultValues,
  fourftSchema,
  FourFtSchemaT,
  getValuesFromApi,
} from '@/schema/fourFtForm.ts';
import { useNavigate } from '@tanstack/react-router';
import { ClipLoader } from 'react-spinners';

export type DatasetState = {
  value: Dataset | undefined;
  errorMessage: string | undefined;
};

export type QuantifierField = (typeof allQuantifierFields)[number];

const fillQuantifiers = (data: FourFtResultDetail) => {
  const quantifiers: QuantifierField[] = [];
  if (data.base) quantifiers.push('base');
  if (data.rel_base) quantifiers.push('relBase');
  if (data.aad) quantifiers.push('aad');
  if (data.confidence) quantifiers.push('confidence');
  return quantifiers;
};

export default function FourFtMiner(props: { data: FourFtResultDetail | undefined }) {
  const data = props.data;
  const initialDatasetState: DatasetState = {
    value: data?.dataset ?? undefined,
    errorMessage: undefined,
  };

  const navigate = useNavigate();

  const initialQuantifiers = data !== undefined ? fillQuantifiers(data) : [];

  const [currentDatasetState, setCurrentDatasetState] = useState<DatasetState>(initialDatasetState);

  const [formIsOpen, setFormIsOpen] = useState(true);

  const [currentQuantifiers, setCurrentQuantifiers] =
    useState<QuantifierField[]>(initialQuantifiers);
  const quantifierOptions = allQuantifierFields.filter(
    (field) => !currentQuantifiers.includes(field)
  );

  const schema = fourftSchema.superRefine(({ base, relBase, aad, confidence }, ctx) => {
    if (currentQuantifiers.includes('base') && !base) {
      ctx.addIssue({
        code: 'custom',
        message: 'Fill in or remove quantifier',
        path: ['base'],
      });
    }
    if (currentQuantifiers.includes('relBase') && !relBase) {
      ctx.addIssue({
        code: 'custom',
        message: 'Fill in or remove quantifier',
        path: ['relBase'],
      });
    }
    if (currentQuantifiers.includes('aad') && !aad) {
      ctx.addIssue({
        code: 'custom',
        message: 'Fill in or remove quantifier',
        path: ['aad'],
      });
    }
    if (currentQuantifiers.includes('confidence') && !confidence) {
      ctx.addIssue({
        code: 'custom',
        message: 'Fill in or remove quantifier',
        path: ['confidence'],
      });
    }
  });

  const defaultValues = data !== undefined ? getValuesFromApi(data) : fourftDefaultValues;

  const form = useZodForm({
    schema: schema,
    defaultValues: defaultValues,
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

    setFormIsOpen(false);

    addAnteSucceToEnd();
  };

  const processFourFtRequestMutation =
    data !== undefined ? useFullUpdateFourFt(data.id) : useCreateFourFt(navigate);

  const datasetsQueryResponse = useGetDatasets();

  const datasets = datasetsQueryResponse.data ?? [];
  const datasetsLoading = datasetsQueryResponse.isLoading;

  return (
    <div className={'flex flex-col w-full h-full'}>
      <PageHeading title={'4FT Miner'} />
      <Collapsible
        open={formIsOpen}
        onOpenChange={setFormIsOpen}
        className="w-full relative transition-all duration-200 ease-in-out"
      >
        {!formIsOpen && (
          <div className="flex pl-8 pt-8 items-center mb-2">
            <div className="text-xl font-semibold">Four FT parameters Form</div>
          </div>
        )}
        <CollapsibleContent className="w-full">
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
          <ClipLoader size={64} />
        </div>
      )}
      {/*{data !== undefined && (*/}
      {/*  <FourFtResults*/}
      {/*    rules={processFourFtRequestMutation.data}*/}
      {/*    isLoading={processFourFtRequestMutation.isPending}*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  );
}
