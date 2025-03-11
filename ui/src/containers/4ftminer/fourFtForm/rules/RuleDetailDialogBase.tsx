import { numberToDecimalPlaces } from '@/utils/helperFunction.ts';
import { RuleParams } from '@/api/fourft.ts';

type Props = {
  ruleParams: RuleParams;
  plot: string;
};

export default function RuleDetailDialogBase({ ruleParams, plot }: Props) {
  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'flex flex-col gap-1'}>
        <div className={'flex gap-2'}>
          <div className={'font-bold w-28'}>Base:</div>
          <div>{ruleParams.base}</div>
        </div>
        <div className={'flex gap-2'}>
          <div className={'font-bold w-28'}>Relative base:</div>
          <div>{numberToDecimalPlaces(ruleParams.rel_base, 6)}</div>
        </div>
        <div className={'flex gap-2'}>
          <div className={'font-bold w-28'}>Confidence:</div>
          <div>{numberToDecimalPlaces(ruleParams.conf, 6)}</div>
        </div>
        <div className={'flex gap-2'}>
          <div className={'font-bold w-28'}>AAD:</div>
          <div>{numberToDecimalPlaces(ruleParams.aad, 6)}</div>
        </div>
        <div className={'flex gap-2'}>
          <div className={'font-bold w-28'}>BAD:</div>
          <div>{numberToDecimalPlaces(ruleParams.bad, 6)}</div>
        </div>
      </div>
      <div>
        <img src={plot} alt={'Rule plot'} />
      </div>
    </div>
  );
}
