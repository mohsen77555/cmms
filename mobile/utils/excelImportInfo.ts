export const EXCEL_IMPORT_INFO_PREFIX = 'ATLAS_EXCEL_KIT_JSON:';

export interface ExcelImportSection {
  sheetName: string;
  headers: string[];
  rows: string[][];
}

export interface ExcelImportInfo {
  source?: string;
  sections: ExcelImportSection[];
}

const stringifyCell = (value: unknown) =>
  value === undefined || value === null ? '' : String(value).trim();

export const buildExcelImportInfo = (
  workbook,
  getSheetRows: (workbook, sheetName: string) => unknown[][],
  source?: string
): ExcelImportInfo => ({
  source,
  sections: workbook.SheetNames.map((sheetName: string) => {
    const rows = getSheetRows(workbook, sheetName);
    const maxColumns = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const headers = rows[0]?.some((cell) => stringifyCell(cell))
      ? rows[0].map(stringifyCell)
      : [];
    const normalizedHeaders =
      headers.length > 0
        ? headers
        : Array.from(
            { length: maxColumns },
            (_, index) => `Column ${index + 1}`
          );

    return {
      sheetName,
      headers: normalizedHeaders,
      rows: rows
        .slice(headers.length > 0 ? 1 : 0)
        .filter((row) => row.some((cell) => stringifyCell(cell)))
        .map((row) =>
          Array.from({ length: normalizedHeaders.length }, (_, index) =>
            stringifyCell(row[index])
          )
        )
    };
  }).filter((section) => section.headers.length || section.rows.length)
});

export const serializeExcelImportInfo = (info: ExcelImportInfo) =>
  `${EXCEL_IMPORT_INFO_PREFIX}${JSON.stringify(info)}`;

export const parseExcelImportInfo = (
  value?: string | null
): ExcelImportInfo | null => {
  if (!value?.startsWith(EXCEL_IMPORT_INFO_PREFIX)) return null;
  try {
    return JSON.parse(value.slice(EXCEL_IMPORT_INFO_PREFIX.length));
  } catch (err) {
    return null;
  }
};
