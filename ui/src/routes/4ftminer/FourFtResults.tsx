import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';

interface CedentsStr {
  cond: string;
  ante: string;
  succ: string;
}

interface CedentsStruct {
  cond: Record<string, any>;
  ante: Record<string, string[]>;
  succ: Record<string, string[]>;
}

interface Traces {
  cond: any[];
  ante: number[][];
  succ: number[][];
}

interface TraceCedentTaskOrder {
  cond: any[];
  ante: number[];
  succ: number[];
}

interface TraceCedentDataOrder {
  cond: any[];
  ante: number[];
  succ: number[];
}

interface Params {
  base: number;
  rel_base: number;
  conf: number;
  aad: number;
  bad: number;
  fourfold: number[];
}

export interface Rule {
  rule_id: number;
  cedents_str: CedentsStr;
  cedents_struct: CedentsStruct;
  traces: Traces;
  trace_cedent_taskorder: TraceCedentTaskOrder;
  trace_cedent_dataorder: TraceCedentDataOrder;
  params: Params;
}

interface Props {
  rules: Rule[] | undefined;
  isLoading: boolean;
}

const numberToDecimalPlaces = (num: number, decimalPlaces: number) => {
  return (Math.round(num * 100) / 100).toFixed(decimalPlaces);
};

export default function FourFtResults({ rules, isLoading }: Props) {
  return (
    <div className={'grow flex flex-wrap p-8'}>
      {isLoading && <h1>Loading...</h1>}
      {!isLoading && rules === undefined && null}
      {!isLoading && rules?.length === 0 && <div className={'text-2xl'}>No rules found!</div>}
      {rules !== undefined &&
        rules.map((rule) => (
          <div
            key={rule.rule_id}
            className={'pb-4 h-fit border-2 border-gray-200 w-[45%] pt-4 px-8'}
          >
            <Table className={'w-fit'}>
              <TableHeader>
                <TableRow>
                  <TableHead>Base</TableHead>
                  <TableHead>Relative base</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>AAD</TableHead>
                  <TableHead>BAD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow key="firstCaptionRow">
                  <TableCell>{rule.params.base}</TableCell>
                  <TableCell>{numberToDecimalPlaces(rule.params.rel_base, 2)}</TableCell>
                  <TableCell>{numberToDecimalPlaces(rule.params.conf, 2)}</TableCell>
                  <TableCell>{numberToDecimalPlaces(rule.params.aad, 2)}</TableCell>
                  <TableCell>{numberToDecimalPlaces(rule.params.bad, 2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Table className={'w-fit'}>
              <TableCaption className={'font-bold'}> Rule #{rule.rule_id}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>{rule.cedents_str.ante}</TableHead>
                  <TableHead>{`¬${rule.cedents_str.ante}`}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow key="firstRow">
                  <TableCell>{rule.cedents_str.succ}</TableCell>
                  <TableCell>{rule.params.fourfold[0]}</TableCell>
                  <TableCell>{rule.params.fourfold[1]}</TableCell>
                </TableRow>
                <TableRow key="secondRow">
                  <TableCell>{`¬${rule.cedents_str.succ}`}</TableCell>
                  <TableCell>{rule.params.fourfold[2]}</TableCell>
                  <TableCell>{rule.params.fourfold[3]}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ))}
    </div>
  );
}
