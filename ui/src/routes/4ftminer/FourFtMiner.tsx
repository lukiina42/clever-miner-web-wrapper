import '../../App.css';
import { z } from 'zod';
import useZodForm from '@/components/form/useZodForm.ts';
import { useState } from 'react';
import {
  ComboboxStringMandatory,
  FloatOptional,
  IntMandatory,
  IntOptional,
  StringOptional,
} from '@/components/form/formValidationTypes.ts';
import FourFtHeading from '@/routes/4ftminer/FourFtHeading.tsx';
import FourFtForm from '@/routes/4ftminer/FourFtForm.tsx';
import { Dataset, useGetDatasets } from '@/api/dataset.ts';
import { useCreateFourFt } from '@/api/fourft.ts';
import FourFtResults from '@/routes/4ftminer/FourFtResults.tsx';
import { Form } from '@/components/ui/form.tsx';
import { anteSucceDefault, CedentConDisType, CedentType } from '@/data/cedent';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx';
import { ChevronDown } from 'lucide-react';
import { allQuantifierFields } from '@/data/quantifier.ts';
import clsxm from '@/utils/clsxm.ts';

const cedentZodObject = z.object({
  name: ComboboxStringMandatory(),
  id: StringOptional(128),
  minLen: IntMandatory(1, 64),
  maxLen: IntMandatory(1, 64),
  type: z.nativeEnum(CedentType, {
    invalid_type_error: 'Please choose an option',
  }),
});

const fourftSchema = z.object({
  base: IntOptional(1, 1000000),
  relbase: FloatOptional(0.001, 1),
  confidence: FloatOptional(0.001, 1),
  aad: FloatOptional(0.001, 1),
  anteMinLen: IntMandatory(1, 64),
  anteMaxLen: IntMandatory(1, 64),
  succeMinLen: IntMandatory(1, 64),
  succeMaxLen: IntMandatory(1, 64),
  conDisAntecedentType: z.nativeEnum(CedentConDisType, {
    invalid_type_error: 'Please choose an option',
  }),
  conDisSuccedentType: z.nativeEnum(CedentConDisType, {
    invalid_type_error: 'Please choose an option',
  }),
  antecedent: z.array(cedentZodObject),
  succedent: z.array(cedentZodObject),
});

const fourftDefaultValues = {
  base: '',
  relbase: '',
  confidence: '',
  aad: '',
  anteMaxLen: '1',
  anteMinLen: '1',
  succeMaxLen: '1',
  succeMinLen: '1',
  conDisAntecedentType: CedentConDisType.Conjunction,
  conDisSuccedentType: CedentConDisType.Conjunction,
  antecedent: [anteSucceDefault],
  succedent: [anteSucceDefault],
} satisfies FourFtSchemaT;

export type FourFtSchemaT = z.infer<typeof fourftSchema>;

export type DatasetState = {
  value: Dataset | undefined;
  errorMessage: string | undefined;
};

const initialDatasetState: DatasetState = {
  value: undefined,
  errorMessage: undefined,
};

export type QuantifierField = (typeof allQuantifierFields)[number];

export default function FourFtMiner() {
  const [currentDatasetState, setCurrentDatasetState] = useState<DatasetState>(initialDatasetState);

  const [formIsOpen, setFormIsOpen] = useState(true);

  const [currentQuantifiers, setCurrentQuantifiers] = useState<QuantifierField[]>([]);
  const quantifierOptions = allQuantifierFields.filter(
    (field) => !currentQuantifiers.includes(field)
  );

  console.log(currentDatasetState);

  const schema = fourftSchema.superRefine(({ base, relbase, aad, confidence }, ctx) => {
    if (currentQuantifiers.includes('base') && !base) {
      ctx.addIssue({
        code: 'custom',
        message: 'Vyplňte, nebo odstraňte kvantifikátor',
        path: ['base'],
      });
    }
    if (currentQuantifiers.includes('relbase') && !relbase) {
      ctx.addIssue({
        code: 'custom',
        message: 'Vyplňte, nebo odstraňte kvantifikátor',
        path: ['relbase'],
      });
    }
    if (currentQuantifiers.includes('aad') && !aad) {
      ctx.addIssue({
        code: 'custom',
        message: 'Vyplňte, nebo odstraňte kvantifikátor',
        path: ['aad'],
      });
    }
    if (currentQuantifiers.includes('confidence') && !confidence) {
      ctx.addIssue({
        code: 'custom',
        message: 'Vyplňte, nebo odstraňte kvantifikátor',
        path: ['confidence'],
      });
    }
  });

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
  };

  const processFourFtRequestMutation = useCreateFourFt();

  const datasetsQueryResponse = useGetDatasets();

  const datasets = datasetsQueryResponse.data ?? [];
  const datasetsLoading = datasetsQueryResponse.isLoading;

  return (
    <div className={'flex flex-col w-full h-full'}>
      <FourFtHeading />
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
              clearErrors={form.clearErrors}
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
      <FourFtResults
        rules={processFourFtRequestMutation.data}
        isLoading={processFourFtRequestMutation.isPending}
      />
    </div>
  );
}
