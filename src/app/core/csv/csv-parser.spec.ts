import { parseCsv } from './csv-parser';

describe('CSV Parser', () => {
  it('should parse basic csv', () => {
    const csv = `A,B,C\n1,2,3`;
    expect(parseCsv(csv)).toEqual([
      ['A', 'B', 'C'],
      ['1', '2', '3']
    ]);
  });

  it('should handle quotes', () => {
    const csv = `A,"B,C",D\n1,"2\n3",4`;
    expect(parseCsv(csv)).toEqual([
      ['A', 'B,C', 'D'],
      ['1', '2\n3', '4']
    ]);
  });

  it('should handle escaped quotes', () => {
    const csv = `A,"B""C",D`;
    expect(parseCsv(csv)).toEqual([
      ['A', 'B"C', 'D']
    ]);
  });

  it('should handle empty trailing lines', () => {
    const csv = `A,B\n1,2\n\n`;
    expect(parseCsv(csv)).toEqual([
      ['A', 'B'],
      ['1', '2']
    ]);
  });

  it('should handle CRLF (Windows)', () => {
    const csv = `A,B\r\n1,2\r\n`;
    expect(parseCsv(csv)).toEqual([
      ['A', 'B'],
      ['1', '2']
    ]);
  });
  
  it('should remove BOM', () => {
    const csv = '\uFEFFA,B\n1,2';
    expect(parseCsv(csv)).toEqual([
      ['A', 'B'],
      ['1', '2']
    ]);
  });
});
