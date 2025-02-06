export const CedentType = {
  Subset: 'subset',
  Sequence: 'seq',
  LeftCut: 'lcut',
  RightCut: 'rcut',
  One: 'one',
  Null: null as unknown as string,
};

export const anteSucceDefault = {
  name: '',
  id: '',
  minLen: '1',
  maxLen: '1',
  type: CedentType.Subset,
  isValid: false,
};

const getCedentTypeLabel = (value: string | null) => {
  let result;
  switch (value) {
    case CedentType.LeftCut:
      result = 'Left cut';
      break;
    case CedentType.One:
      result = 'One';
      break;
    case CedentType.RightCut:
      result = 'Right cut';
      break;
    case CedentType.Sequence:
      result = 'Sequence';
      break;
    case CedentType.Null:
      result = '-';
      break;
    case CedentType.Subset:
      result = 'Subset';
      break;
  }
  if (!result) result = '-';
  return result;
};

export const cedentTypes = Object.values(CedentType)
  .filter((v) => v !== null)
  .map((v) => ({ value: v, label: getCedentTypeLabel(v) }));

////////////////////////////////////////////////////////////////

export const CedentConDisType = {
  Conjunction: 'con',
  Disjunction: 'dis',
  Null: null as unknown as string,
};

const getCedentConDisTypeLabel = (value: string | null) => {
  let result;
  switch (value) {
    case CedentConDisType.Conjunction:
      result = 'Conjunction';
      break;
    case CedentConDisType.Disjunction:
      result = 'Disjunction';
      break;
    case CedentConDisType.Null:
      result = '-';
      break;
  }
  if (!result) result = '-';
  return result;
};

export const cedentConDisTypes = Object.values(CedentConDisType)
  .filter((v) => v !== null)
  .map((v) => ({ value: v, label: getCedentConDisTypeLabel(v) }));
