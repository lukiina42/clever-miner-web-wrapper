import { z } from 'zod';
import {
  ComboboxStringMandatory,
  FloatOptional,
  IntMandatory,
  IntOptional,
  StringOptional,
} from '@/components/form/formValidationTypes.ts';
import { anteSucceDefault, CedentConDisType, CedentType } from '@/data/cedent.ts';
import { FourFtResultDetail } from '@/api/fourft.ts';

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

export const getValuesFromApi = (data: FourFtResultDetail): FourFtSchemaT => {
  return {
    base: data.base !== null ? data.base.toString() : '',
    relBase: data.rel_base !== null ? data.rel_base.toString() : '',
    confidence: data.confidence !== null ? data.confidence.toString() : '',
    aad: data.aad !== null ? data.aad.toString() : '',
    anteMinLen: data.ante_min_len.toString(),
    anteMaxLen: data.ante_max_len.toString(),
    succeMinLen: data.succe_min_len.toString(),
    succeMaxLen: data.succe_max_len.toString(),
    conDisAntecedentType: data.con_dis_antecedent_type,
    conDisSuccedentType: data.con_dis_succedent_type,
    //move to function... or not
    antecedent: data.antecedent.map((cedent) => {
      return {
        name: cedent.name,
        id: cedent.id.toString(),
        minLen: cedent.min_len.toString(),
        maxLen: cedent.max_len.toString(),
        type: cedent.type,
        isValid: true,
      };
    }),
    succedent: data.succedent.map((cedent) => {
      return {
        name: cedent.name,
        id: cedent.id.toString(),
        minLen: cedent.min_len.toString(),
        maxLen: cedent.max_len.toString(),
        type: cedent.type,
        isValid: true,
      };
    }),
  } satisfies FourFtSchemaT;
};
