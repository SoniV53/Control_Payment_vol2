export function parseCsv(text: string): string[][] {
  if (!text) return [];

  // Remove BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  const result: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of cell
      currentRow.push(currentCell);
      currentCell = '';
    } else if (char === '\n' && !insideQuotes) {
      // End of row (UNIX)
      currentRow.push(currentCell);
      result.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else if (char === '\r' && nextChar === '\n' && !insideQuotes) {
      // End of row (Windows)
      currentRow.push(currentCell);
      result.push(currentRow);
      currentRow = [];
      currentCell = '';
      i++; // skip \n
    } else {
      currentCell += char;
    }
  }

  // Handle last cell/row
  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell);
    result.push(currentRow);
  }

  // Filter out trailing empty rows
  while (
    result.length > 0 && 
    result[result.length - 1].length === 1 && 
    result[result.length - 1][0].trim() === ''
  ) {
    result.pop();
  }

  return result;
}
