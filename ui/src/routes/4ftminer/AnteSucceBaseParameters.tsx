import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FourFtSchemaT } from './FourFtMiner';
import TextInputField from '@/components/form/TextInputField';
import { Label } from '@/components/ui/label';
import { InfoIcon } from '@/components/ui/InfoIcon';
import Selectbox from '@/components/form/Selectbox';
import SelectOption from '@/components/form/SelectOption';
import { cedentConDisTypes } from '@/data/cedent';

type Props = {
  fieldName: 'antecedent' | 'succedent';
  register: UseFormRegister<FourFtSchemaT>;
  errors: FieldErrors<FourFtSchemaT>;
};

export default function AnteSucceBaseParameters({ fieldName, register, errors }: Props) {
  return fieldName === 'antecedent' ? (
    <div className="flex gap-4">
      <div className={'w-[300px]'}>
        <Label htmlFor="anteMinLen">Min. amount of antecedents</Label>
        <TextInputField
          {...register('anteMinLen')}
          errorMessage={errors?.anteMinLen?.message as string | undefined}
        />
      </div>
      <div className={'w-[300px]'}>
        <Label htmlFor="anteMaxLen">Max. amount of antecedents</Label>
        <TextInputField
          {...register('anteMaxLen')}
          errorMessage={errors?.anteMaxLen?.message as string | undefined}
        />
      </div>
      <div className={'w-[300px]'}>
        <div className="flex gap-1 items-center">
          <Label htmlFor={`conDisAntecedentType`}>Cedent type</Label>
          <InfoIcon
            textContent={
              <a
                target="_blank"
                className="underline"
                href="https://www.cleverminer.org/doc/index.html#literals-and-cedents"
              >
                Cedent type specification
              </a>
            }
          />
        </div>
        <Selectbox {...register(`conDisAntecedentType`)} error={errors?.conDisAntecedentType}>
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
  ) : (
    <div className="flex gap-4">
      <div className={'w-[300px]'}>
        <Label htmlFor="succeMinLen">Min. amount of succedents</Label>
        <TextInputField
          {...register('succeMinLen')}
          errorMessage={errors?.succeMinLen?.message as string | undefined}
        />
      </div>
      <div className={'w-[300px]'}>
        <Label htmlFor="succeMaxLen">Max. amount of succedents</Label>
        <TextInputField
          {...register('succeMaxLen')}
          errorMessage={errors?.succeMaxLen?.message as string | undefined}
        />
      </div>
      <div className={'w-[300px]'}>
        <div className="flex gap-1 items-center">
          <Label htmlFor={`conDisSuccedentType`}>Cedent type</Label>
          <InfoIcon
            textContent={
              <a
                target="_blank"
                className="underline"
                href="https://www.cleverminer.org/doc/index.html#literals-and-cedents"
              >
                Cedent type specification
              </a>
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
