import { z } from 'zod';
import {
  ComboboxStringMandatory,
  FloatOptional,
  IntMandatory,
  IntOptional,
  StringOptional,
} from '@/components/form/formValidationTypes.ts';
import { anteSucceDefault, CedentConDisType, CedentType } from '@/data/cedent.ts';

export const cedentZodObject = z.object({
  name: ComboboxStringMandatory(),
  id: StringOptional(128),
  minLen: IntMandatory(1, 64),
  maxLen: IntMandatory(1, 64),
  type: z.nativeEnum(CedentType, {
    invalid_type_error: 'Please choose an option',
  }),
  isValid: z.boolean(),
});

export const fourftSchema = z
  .object({
    base: IntOptional(1, 1000000),
    relBase: FloatOptional(0.001, 1),
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
  })
  .superRefine(({ antecedent, succedent }, ctx) => {
    const validAntecedensCount = antecedent.filter((a) => a.isValid).length;
    if (validAntecedensCount === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one antecedent is required',
        path: ['antecedent'],
      });
    }

    const validSuccedentsCount = succedent.filter((s) => s.isValid).length;
    if (validSuccedentsCount === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one succedent is required',
        path: ['succedent'],
      });
    }
  });

export const fourftDefaultValues = {
  base: '',
  relBase: '',
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
