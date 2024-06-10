import { LocalDate, YearMonth } from '@js-joda/core';
import { coerce, string, z } from 'zod';

export const IntMandatory = (min: number, max: number) =>
  z
    .string({
      invalid_type_error: 'Toto pole je povinné',
      required_error: 'Toto pole je povinné',
    })
    .min(1, {
      message: 'Toto pole je povinné',
    })
    .pipe(
      coerce
        .number({
          invalid_type_error: 'Hodnota musí být celé číslo',
          required_error: 'Toto pole je povinné',
        })
        .int({ message: 'Hodnota musí být celé číslo' })
        .max(max, { message: `Maximální hodnota je ${max}` })
        .min(min, { message: `Minimální hodnota je ${min}` })
    )
    .pipe(z.coerce.string());

//TODO for optionals, try union
export const IntOptional = (min: number, max: number) =>
  z
    .string()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .refine((value) => value === null || !isNaN(Number(value)), {
      message: 'Hodnota musí být celé číslo',
    })
    .transform((value) => (value === null ? null : Number(value)))
    .pipe(
      coerce
        .number({
          invalid_type_error: 'Hodnota musí být celé číslo',
          required_error: 'Toto pole je povinné',
        })
        .int({ message: 'Hodnota musí být celé číslo' })
        .max(max, { message: `Maximální hodnota je ${max}` })
        .refine(
          (value) => {
            return value === 0 || value > min;
          },
          { message: `Hodnota musí být vyšší nebo rovna ${min}` }
        )
        .nullable()
    )
    .transform((value) => (value === null ? null : value.toString()))
    .default(null);

export const FloatMandatory = (decimal: number, max: number, min = 0) =>
  z
    .string({
      invalid_type_error: 'Toto pole je povinné',
      required_error: 'Toto pole je povinné',
    })
    .min(1, {
      message: 'Toto pole je povinné',
    })
    .pipe(
      coerce
        .number({
          invalid_type_error: 'Hodnota musí být celé nebo desetinné číslo',
          required_error: 'Toto pole je povinné',
        })
        .multipleOf(decimal, {
          message: `Maximální počet desetinných míst musí být ve tvaru ${decimal}`,
        })
        .max(max, { message: `Maximální hodnota je ${max}` })
        .min(min, { message: `Minimální hodnota je ${min}` })
    )
    .pipe(z.coerce.string());

// coerce transforms empty string to 0 so using transform instead
export const FloatOptional = (decimal: number, max: number, min = 0) =>
  z
    .string()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .refine((value) => value === null || !isNaN(Number(value)), {
      message: 'Hodnota musí být celé, nebo desetinné číslo',
    })
    .transform((value) => (value === null ? null : Number(value)))
    .pipe(
      z
        .number()
        .multipleOf(decimal, {
          message: `Maximální počet desetinných míst musí být ve tvaru ${decimal}`,
        })
        .nonnegative({ message: 'Hodnota musí být ≥ 0' })
        .max(max, { message: `Hodnota musí být ≤ ${max}` })
        .refine((value) => value === null || value >= min, {
          message: `Hodnota musí být vyšší nebo rovna ${min}`,
        })
        .nullable()
    )
    .transform((value) => (value === null ? null : value.toString()))
    .default(null);

export const StringOptional = (max: number) =>
  string()
    .max(max, { message: `Maximální počet znaků je ${max}` })
    .trim()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .default(null);

export const StringMandatory = (max: number, min = 1) =>
  string({
    invalid_type_error: 'Toto pole je povinné',
    required_error: 'Toto pole je povinné',
  })
    .min(min, { message: `Zadejte minimálně ${min} znaků` })
    .max(max, { message: `Maximální počet znaků je ${max}` })
    .trim();

export const SelectBoxT = z
  .string({
    invalid_type_error: 'Toto pole je povinné',
    required_error: 'Toto pole je povinné',
  })
  .min(1, {
    message: 'Povinné',
  });

export function yearMonth() {
  return z.custom<string>((value) => {
    const val = value as string;

    if (!val) {
      return false;
    }

    try {
      YearMonth.parse(val);
    } catch (e) {
      return false;
    }

    return true;
  });
}

const localDateErrorMessage = 'Zadejte platný datum zadejte ve formátu YYYY-MM-DD';

export function LocalDateMandatory() {
  return z.custom<string>(
    (value) => {
      const val = value as string;

      if (!val) {
        return false;
      }

      try {
        LocalDate.parse(val);
      } catch (e) {
        return false;
      }

      return true;
    },
    { message: localDateErrorMessage }
  );
}

export const LocalDateOptional = () =>
  z
    .union([z.string().length(0, localDateErrorMessage), LocalDateMandatory()])
    .transform((value) => (value === '' ? null : value));
