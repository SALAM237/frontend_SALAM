type CsvRow = Record<string, unknown>;

function repairMojibake(value: string) {
  return value
    .replace(/\u00e2\u20ac\u201d/g, '\u2014')
    .replace(/\u00e2\u20ac\u201c/g, '\u2013')
    .replace(/\u00e2\u20ac\u00a6/g, '\u2026')
    .replace(/\u00e2\u20ac\u02dc/g, '\u2018')
    .replace(/\u00e2\u20ac\u2122/g, '\u2019')
    .replace(/\u00e2\u20ac\u0153/g, '\u201c')
    .replace(/\u00e2\u20ac\ufffd/g, '\u201d')
    .replace(/\u00c2\u00b7/g, '\u00b7')
    .replace(/\u00c2\u00b0/g, '\u00b0')
    .replace(/\u00c2 /g, ' ')
    .replace(/\u00c3\u20ac/g, '\u00c0')
    .replace(/\u00c3\u201a/g, '\u00c2')
    .replace(/\u00c3\u2030/g, '\u00c9')
    .replace(/\u00c3\u02c6/g, '\u00c8')
    .replace(/\u00c3\u0160/g, '\u00ca')
    .replace(/\u00c3\u2021/g, '\u00c7')
    .replace(/\u00c3 /g, '\u00e0')
    .replace(/\u00c3\u00a2/g, '\u00e2')
    .replace(/\u00c3\u00a4/g, '\u00e4')
    .replace(/\u00c3\u00a7/g, '\u00e7')
    .replace(/\u00c3\u00a9/g, '\u00e9')
    .replace(/\u00c3\u00a8/g, '\u00e8')
    .replace(/\u00c3\u00aa/g, '\u00ea')
    .replace(/\u00c3\u00ab/g, '\u00eb')
    .replace(/\u00c3\u00ae/g, '\u00ee')
    .replace(/\u00c3\u00af/g, '\u00ef')
    .replace(/\u00c3\u00b4/g, '\u00f4')
    .replace(/\u00c3\u00b6/g, '\u00f6')
    .replace(/\u00c3\u00b9/g, '\u00f9')
    .replace(/\u00c3\u00bb/g, '\u00fb')
    .replace(/\u00c3\u00bc/g, '\u00fc');
}
function csvCell(value: unknown) {
  const text = repairMojibake(String(value ?? '')).replace(/\r?\n/g, ' ').trim();
  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, rows: CsvRow[]) {
  const fallback: CsvRow = { export: 'Aucune donnee' };
  const headers = Object.keys(rows[0] ?? fallback);
  const dataRows: CsvRow[] = rows.length > 0 ? rows : [fallback];
  const csv = [
    headers.map(csvCell).join(';'),
    ...dataRows.map(row => headers.map(key => csvCell(row[key])).join(';')),
  ].join('\r\n');

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
