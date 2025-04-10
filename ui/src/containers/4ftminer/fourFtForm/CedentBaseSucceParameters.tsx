import { FieldErrors, UseFormRegister } from 'react-hook-form';
import TextInputField from '@/components/form/TextInputField.tsx';
import { Label } from '@/components/ui/label.tsx';
import { InfoIcon } from '@/components/ui/InfoIcon.tsx';
import Selectbox from '@/components/form/Selectbox.tsx';
import SelectOption from '@/components/form/SelectOption.tsx';
import { cedentConDisTypes } from '@/data/cedent.ts';
import { FourFtSchemaT } from '@/schema/fourFtForm';

type Props = {
  register: UseFormRegister<FourFtSchemaT>;
  errors: FieldErrors<FourFtSchemaT>;
};

export default function CedentBaseSucceParameters({ register, errors }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className={'flex gap-1 items-center'}>
        <span className={'text-sm font-bold'}>Cedent basic parameters</span>
        <InfoIcon
          textContent={
            <a
              target="_blank"
              className="underline"
              href="https://www.cleverminer.org/doc/index.html#literals-and-cedents"
            >
              Cedent attribute specification
            </a>
          }
        />
      </div>
      <div className="w-[300px] flex justify-between">
        <div className={'w-[145px]'}>
          <div className="flex gap-1 items-center">
            <Label htmlFor={`succeMinLen`}>Min. amount</Label>
            <InfoIcon textContent={'Minimal number of literals in the cedent in the rule'} />
          </div>
          <TextInputField
            {...register('succeMinLen')}
            errorMessage={errors?.succeMinLen?.message as string | undefined}
          />
        </div>
        <div className={'w-[145px]'}>
          <div className="flex gap-1 items-center">
            <Label htmlFor={`succeMaxLen`}>Max. amount</Label>
            <InfoIcon textContent={'Maximal number of literals in the cedent in the rule'} />
          </div>
          <TextInputField
            {...register('succeMaxLen')}
            errorMessage={errors?.succeMaxLen?.message as string | undefined}
          />
        </div>
      </div>
      <div className={'w-[300px]'}>
        <div className="flex gap-1 items-center">
          <Label htmlFor={`conDisSuccedentType`}>Cedent type</Label>
          <InfoIcon
            textContent={
              'How literals (attributes and values) are combined'
            }
          />
        </div>
        <Selectbox {...register(`conDisSuccedentType`)} error={errors?.conDisSuccedentType}>
          {cedentConDisTypes.map((option, i) => {
            return (
              <SelectOption key={i} value={option.value}>
                {option.label}
              </SelectOption>
            );
          })}
        </Selectbox>
      </div>
    </div>
  );
}
