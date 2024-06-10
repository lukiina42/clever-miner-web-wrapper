import { type ClassValue } from 'clsx';
import { forwardRef, type ReactNode } from 'react';

import clsxm from '../../utils/clsxm.ts';

import FormErrorMessage from './FormErrorMessage.tsx';
import {Input} from "@/components/ui/input.tsx";

type Props = Omit<JSX.IntrinsicElements['input'], 'className'> & {
  name: string;
  required?: boolean;
  errorMessage?: string;
  leftComponent?: ReactNode;
  className?: ClassValue;
};

const TextInputField = forwardRef<HTMLInputElement, Props>(
  ({ name, required, errorMessage, leftComponent, className, ...rest }: Props, ref) => {
    return (
      <div className="relative flex rounded-md focus-within:z-10">
        {leftComponent !== undefined && (
          <div className="absolute inset-y-0 left-0 flex items-center">{leftComponent}</div>
        )}
        <Input
          type="text"
          name={name}
          required={required}
          id={name}
          className={clsxm(className)}
          ref={ref}
          {...rest}
        />
        {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
      </div>
    );
  }
);

export default TextInputField;
