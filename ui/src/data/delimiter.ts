export const DelimiterType = {
  Tab: 'tab',
  Space: 'space',
  Comma: 'comma',
  Semicolon: 'semicolon',
  Pipe: 'pipe',
  Slash: 'slash',
  Other: 'other',
  Null: null as unknown as string,
};

const getDelimiterLabel = (value: string | null) => {
  let result;
  switch (value) {
    case DelimiterType.Tab:
      result = 'Tab';
      break;
    case DelimiterType.Space:
      result = 'Space';
      break;
    case DelimiterType.Comma:
      result = 'Comma (,)';
      break;
    case DelimiterType.Semicolon:
      result = 'Semicolon (;)';
      break;
    case DelimiterType.Pipe:
      result = 'Pipe (|)';
      break;
    case DelimiterType.Slash:
      result = 'Slash (/)';
      break;
    case DelimiterType.Other:
      result = 'Other';
      break;
    case DelimiterType.Null:
      result = '-';
  }
  if (!result) result = '-';
  return result;
};

export const delimiters = Object.values(DelimiterType)
  .filter((v) => v !== null)
  .map((v) => ({ value: v, label: getDelimiterLabel(v) }));
