import { LocalDate, YearMonth } from '@js-joda/core';
import { coerce, string, z } from 'zod';

//translate this file to english
export const IntMandatory = (min: number, max: number) =>
  z
    .string({
      invalid_type_error: 'This field is required',
      required_error: 'This field is required',
    })
    .min(1, {
      message: 'This field is required',
    })
    .pipe(
      coerce
        .number({
          invalid_type_error: 'The value must be an integer',
          required_error: 'This field is required',
        })
        .int({ message: 'The value must be an integer' })
        .max(max, { message: `Max value is ${max}` })
        .min(min, { message: `Min value is ${min}` })
    )
    .pipe(z.coerce.string());

//TODO for optionals, try union
export const IntOptional = (min: number, max: number) =>
  z
    .string()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .refine((value) => value === null || !isNaN(Number(value)), {
      message: 'The value must be an integer',
    })
    .transform((value) => (value === null ? null : Number(value)))
    .pipe(
      coerce
        .number({
          invalid_type_error: 'The value must be an integer',
          required_error: 'This field is required',
        })
        .int({ message: 'The value must be an integer' })
        .max(max, { message: `Min value is ${max}` })
        .refine(
          (value) => {
            return value === 0 || value > min;
          },
          { message: `The value must be greater than or equal to ${min}` }
        )
        .nullable()
    )
    .transform((value) => (value === null ? null : value.toString()))
    .default(null);

export const FloatMandatory = (decimal: number, max: number, min = 0) =>
  z
    .string({
      invalid_type_error: 'This field is required',
      required_error: 'This field is required',
    })
    .min(1, {
      message: 'This field is required',
    })
    .pipe(
      coerce
        .number({
          invalid_type_error: 'The value must be an integer or decimal number',
          required_error: 'This field is required',
        })
        .multipleOf(decimal, {
          message: `Max amount of decimal places must be in format ${decimal}`,
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
      message: 'The value must be an integer or decimal number',
    })
    .transform((value) => (value === null ? null : Number(value)))
    .pipe(
      z
        .number()
        .multipleOf(decimal, {
          message: `Max amount of decimal places must be in format ${decimal}`,
        })
        .nonnegative({ message: 'The value must be ≥ 0' })
        .max(max, { message: `The value msut be ≤ ${max}` })
        .refine((value) => value === null || value >= min, {
          message: `The value must be greater than or equal to ${min}`,
        })
        .nullable()
    )
    .transform((value) => (value === null ? null : value.toString()))
    .default(null);

export const StringOptional = (max: number) =>
  string()
    .max(max, { message: `Max amount of characters is ${max}` })
    .trim()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .default(null);

export const StringMandatory = (max: number, min = 1) =>
  string({
    invalid_type_error: 'This field is required',
    required_error: 'This field is required',
  })
    .min(min, { message: `Enter min ${min} character` })
    .max(max, { message: `Max amount of characters is ${max}` })
    .trim();

export const SelectBoxT = z
  .string({
    invalid_type_error: 'This field is required',
    required_error: 'This field is required',
  })
  .min(1, {
    message: 'Required',
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

const localDateErrorMessage = 'Enter valid date in format YYYY-MM-DD';

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
