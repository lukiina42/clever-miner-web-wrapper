import type { ReactNode } from 'react';

type Props = Omit<JSX.IntrinsicElements['option'], 'className'> & {
  children: ReactNode;
};

export default function SelectOption({ children, ...rest }: Props) {
  return (
    <option className="relative cursor-default select-none py-2 pl-8 pr-4 text-gray-900" {...rest}>
      {children}
    </option>
  );
}
