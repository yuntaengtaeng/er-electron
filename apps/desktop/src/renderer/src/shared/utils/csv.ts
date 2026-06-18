const escapeCsvCell = (value: string): string => {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const formatCsvCell = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'object') return escapeCsvCell(JSON.stringify(value));
  return escapeCsvCell(String(value));
};

export const rowsToCsv = (rows: Record<string, unknown>[]): string => {
  if (rows.length === 0) return '';

  const columns = Object.keys(rows[0]!);
  const header = columns.map(escapeCsvCell).join(',');
  const body = rows.map((row) =>
    columns.map((col) => formatCsvCell(row[col])).join(','),
  );

  return [header, ...body].join('\r\n');
};

export const downloadCsv = (filename: string, csv: string): void => {
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
