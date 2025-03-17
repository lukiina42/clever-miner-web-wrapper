import { numberToDecimalPlaces } from '@/utils/helperFunction.ts';
import { type RuleDetail } from '@/api/rule.ts';
import { Link, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button.tsx';

type Props = {
  data: RuleDetail;
};

export default function RuleDetail({ data }: Props) {
  const ruleParams = data.rule.params;
  const plot = data.plot;

  const { fourftId } = useParams({ from: '/_protected/_fourft/fourft/$fourftId/rules/$ruleId/' });

  return (
    <div className={'flex flex-col gap-2 p-4'}>
      <div className={'flex justify-between'}>
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
        <div className={'flex justify-end pr-4 pt-4'}>
          <Link to={`/fourft/${fourftId}`}>
            <Button type="button" className="cursor-pointer bg-black hover:bg-gray-800 w-44">
              Back to 4ft procedure
            </Button>
          </Link>
        </div>
      </div>
      <img src={plot} alt={'Rule plot'} className={'w-auto h-auto md:w-[640px] md:h-[480px]'} />
    </div>
  );
}
