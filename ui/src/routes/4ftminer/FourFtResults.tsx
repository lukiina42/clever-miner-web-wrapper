import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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
  ruletext: string;
}

interface Props {
  rules: Rule[] | undefined;
  isLoading: boolean;
}

const numberToDecimalPlaces = (num: number, decimalPlaces: number) => {
  return (Math.round(num * 100) / 100).toFixed(decimalPlaces);
};

export default function FourFtResults({ rules, isLoading }: Props) {
  const [openRows, setOpenRows] = useState<number[]>([]);

  const toggleRow = (rule: number) => {
    setOpenRows((prevOpenRows) =>
      prevOpenRows.includes(rule)
        ? prevOpenRows.filter((row) => row !== rule)
        : [...prevOpenRows, rule]
    );
  };
  return (
    <div className={'grow flex flex-wrap p-8'}>
      {isLoading && <h1>Loading...</h1>}
      {!isLoading && rules === undefined && null}
      {!isLoading && rules?.length === 0 && <div className={'text-2xl'}>No rules found!</div>}
      {rules !== undefined && (
        <Table className="w-full">
          <TableCaption className="caption-top text-left mb-2 text-lg text-black">
            A list of results
          </TableCaption>
          <TableHeader>
            <TableRow className="grid grid-cols-5 gap-4">
              <TableHead className="col-span-1 pl-8">Rule ID</TableHead>
              <TableHead className="col-span-1">Base</TableHead>
              <TableHead className="col-span-1">Confidence</TableHead>
              <TableHead className="col-span-1">AAD</TableHead>
              <TableHead className="col-span-1">Rule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <Collapsible
                key={rule.rule_id}
                open={openRows.includes(rule.rule_id)}
                onOpenChange={() => toggleRow(rule.rule_id)}
              >
                <CollapsibleTrigger asChild>
                  <TableRow className="grid grid-cols-5 gap-4 cursor-pointer hover:bg-muted/50">
                    <TableCell className="col-span-1 font-medium">
                      {openRows.includes(rule.rule_id) ? (
                        <ChevronDown className="inline mr-2" />
                      ) : (
                        <ChevronRight className="inline mr-2" />
                      )}
                      {rule.rule_id}
                    </TableCell>
                    <TableCell className="col-span-1">
                      {numberToDecimalPlaces(rule.params.base, 3)}
                    </TableCell>
                    <TableCell className="col-span-1">
                      {numberToDecimalPlaces(rule.params.conf, 3)}
                    </TableCell>
                    <TableCell className="col-span-1">
                      {numberToDecimalPlaces(rule.params.aad, 3)}
                    </TableCell>
                    <TableCell className="col-span-1">{rule.ruletext}</TableCell>
                  </TableRow>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <TableRow>
                    <TableCell colSpan={4} className="bg-muted/30 p-4">
                      <div className="text-sm">
                        <strong>Additional Details: {rule.rule_id}</strong>
                      </div>
                    </TableCell>
                  </TableRow>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
