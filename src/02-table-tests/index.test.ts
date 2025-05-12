import { simpleCalculator, Action } from './index';

describe('simpleCalculator - valid inputs', () => {
  const testCases = [
    { a: 1, b: 2, action: Action.Add, expected: 3 },
    { a: 5, b: 3, action: Action.Subtract, expected: 2 },
    { a: 4, b: 6, action: Action.Multiply, expected: 24 },
    { a: 8, b: 2, action: Action.Divide, expected: 4 },
    { a: 2, b: 3, action: Action.Exponentiate, expected: 8 },
    { a: 10, b: 0, action: Action.Divide, expected: Infinity },
    { a: 0, b: 0, action: Action.Exponentiate, expected: 1 },
  ];

  test.each(testCases)(
    'returns $expected when a=$a, b=$b, action=$action',
    ({ a, b, action, expected }) => {
      expect(simpleCalculator({ a, b, action })).toBe(expected);
    },
  );
});

describe('simpleCalculator - invalid inputs', () => {
  const invalidCases = [
    { a: '1', b: 2, action: Action.Add },
    { a: 1, b: '2', action: Action.Multiply },
    { a: 1, b: 2, action: 'invalid' },
    { a: null, b: 2, action: Action.Subtract },
    { a: 1, b: undefined, action: Action.Divide },
    { a: 1, b: 2, action: null },
  ];

  test.each(invalidCases)(
    'returns null for invalid input a=$a, b=$b, action=$action',
    (input) => {
      expect(simpleCalculator(input)).toBeNull();
    },
  );
});
