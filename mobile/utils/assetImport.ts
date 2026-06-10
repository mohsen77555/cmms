import { read, utils } from 'xlsx';
import { AssetImportDTO } from '../models/imports';

type HeaderMap = Partial<Record<keyof AssetImportDTO, string>>;

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[ـ_:./\\-]/g, ' ');

const splitList = (value: unknown): string[] => {
  if (value === undefined || value === null || value === '') return [];
  return String(value)
    .split(/[,،;]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

const headerAliases: Record<keyof AssetImportDTO, string[]> = {
  id: ['id', 'asset id', 'معرف', 'المعرف', 'رقم'],
  archived: ['archived', 'مؤرشف', 'مؤرشفة'],
  description: ['description', 'الوصف', 'وصف'],
  locationName: [
    'location',
    'location name',
    'functional location',
    'الموقع',
    'اسم الموقع',
    'الموقع الفني'
  ],
  parentAssetName: [
    'parent asset',
    'parent asset name',
    'الأصل الأب',
    'الاصل الاب',
    'الأصل الرئيسي'
  ],
  area: ['area', 'zone', 'المنطقة', 'منطقة'],
  barCode: ['barcode', 'bar code', 'الباركود', 'رمز شريطي', 'الرمز الشريطي'],
  category: ['category', 'الفئة', 'التصنيف', 'تصنيف'],
  name: ['name', 'asset name', 'equipment', 'اسم الأصل', 'اسم الاصل', 'المعدة'],
  primaryUserEmail: [
    'primary user',
    'primary user email',
    'primary worker',
    'email',
    'الفني الرئيسي',
    'البريد الإلكتروني للفني'
  ],
  warrantyExpirationDate: [
    'warranty expiration date',
    'warranty',
    'تاريخ انتهاء الضمان',
    'الضمان'
  ],
  additionalInfos: [
    'additional information',
    'additional infos',
    'معلومات إضافية',
    'معلومات اضافية',
    'ملاحظات'
  ],
  serialNumber: ['serial number', 'serial', 'الرقم التسلسلي', 'سيريال'],
  assignedToEmails: ['assigned to', 'assigned users', 'المكلفون', 'الفنيون'],
  teamsNames: ['teams', 'team', 'الفرق', 'الفريق'],
  status: ['status', 'الحالة', 'حالة الأصل'],
  acquisitionCost: ['acquisition cost', 'cost', 'التكلفة', 'تكلفة الشراء'],
  customersNames: ['customers', 'contractors', 'العملاء', 'المقاولون'],
  vendorsNames: ['vendors', 'suppliers', 'الموردون', 'البائعون'],
  partsNames: ['parts', 'spare parts', 'قطع الغيار', 'القطع'],
  model: ['model', 'الموديل', 'النموذج'],
  manufacturer: ['manufacturer', 'الصانع', 'الشركة المصنعة', 'المصنع'],
  power: ['power', 'rating', 'القدرة', 'الطاقة']
};

const assetImportKeys = Object.keys(headerAliases) as (keyof AssetImportDTO)[];

const buildHeaderMap = (headers: unknown[]): HeaderMap => {
  const normalizedHeaders = headers.map(normalizeHeader);
  return assetImportKeys.reduce<HeaderMap>((acc, key) => {
    const aliases = headerAliases[key].map(normalizeHeader);
    const index = normalizedHeaders.findIndex((header) =>
      aliases.some((alias) => header === alias || header.includes(alias))
    );
    if (index !== -1) {
      acc[key] = String(headers[index]);
    }
    return acc;
  }, {});
};

const formatGenericRows = (
  rows: Record<string, unknown>[],
  headerMap: HeaderMap
): AssetImportDTO[] =>
  rows
    .map((row) => {
      const get = (key: keyof AssetImportDTO) =>
        headerMap[key] ? row[headerMap[key]] : undefined;
      const name = get('name');
      if (!name) return null;

      return {
        id: parseNumber(get('id')) ?? null,
        archived: String(get('archived') ?? ''),
        description: String(get('description') ?? ''),
        locationName: String(get('locationName') ?? ''),
        parentAssetName: String(get('parentAssetName') ?? ''),
        area: String(get('area') ?? ''),
        barCode: String(get('barCode') ?? ''),
        category: String(get('category') ?? ''),
        name: String(name).trim(),
        primaryUserEmail: String(get('primaryUserEmail') ?? ''),
        warrantyExpirationDate: parseNumber(get('warrantyExpirationDate')),
        additionalInfos: String(get('additionalInfos') ?? ''),
        serialNumber: String(get('serialNumber') ?? ''),
        assignedToEmails: splitList(get('assignedToEmails')),
        teamsNames: splitList(get('teamsNames')),
        status: String(get('status') ?? 'OPERATIONAL'),
        acquisitionCost: parseNumber(get('acquisitionCost')),
        customersNames: splitList(get('customersNames')),
        vendorsNames: splitList(get('vendorsNames')),
        partsNames: splitList(get('partsNames')),
        model: String(get('model') ?? ''),
        manufacturer: String(get('manufacturer') ?? ''),
        power: String(get('power') ?? '')
      };
    })
    .filter(Boolean) as AssetImportDTO[];

const getSheetRows = (workbook, sheetName: string): unknown[][] => {
  const sheet = workbook.Sheets[sheetName];
  return sheet
    ? (utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][])
    : [];
};

const getKeyValueRows = (workbook, sheetName: string) =>
  getSheetRows(workbook, sheetName)
    .slice(1)
    .filter((row: unknown[]) => row[0] || row[1]);

const getValueByLabel = (rows: unknown[][], labels: string[]) => {
  const normalizedLabels = labels.map(normalizeHeader);
  const row = rows.find((item) => {
    const label = normalizeHeader(item[0]);
    return normalizedLabels.some(
      (candidate) => label === candidate || label.includes(candidate)
    );
  });
  return row?.[1] ? String(row[1]).trim() : '';
};

const formatFvvMaintenanceKit = (
  workbook,
  fileName?: string
): AssetImportDTO[] => {
  const technicalSheet = workbook.SheetNames.find((name: string) =>
    name.includes('البيانات الفنية')
  );
  if (!technicalSheet) return [];

  const technicalRows = getKeyValueRows(workbook, technicalSheet);
  const model = getValueByLabel(technicalRows, ['الموديل', 'model']);
  const speed = getValueByLabel(technicalRows, ['السرعة', 'rpm']);
  const capacity = getValueByLabel(technicalRows, ['السعة', 'capacity']);
  const motor = getValueByLabel(technicalRows, ['المحرك', 'motor']);
  const power = getValueByLabel(technicalRows, ['القدرة', 'power']);
  const serialNumber = getValueByLabel(technicalRows, [
    'serial',
    'الرقم التسلسلي'
  ]);

  const maintenancePlanSheet = workbook.SheetNames.find((name: string) =>
    name.includes('خطة الصيانة')
  );
  const maintenanceRows = maintenancePlanSheet
    ? getSheetRows(workbook, maintenancePlanSheet).slice(1)
    : [];
  const sparePartsSheet = workbook.SheetNames.find((name: string) =>
    name.includes('قطع الغيار')
  );
  const sparePartsRows = sparePartsSheet
    ? getSheetRows(workbook, sparePartsSheet).slice(1)
    : [];

  const additionalInfos = [
    `Imported from: ${fileName ?? 'FVV maintenance kit'}`,
    '',
    'Technical data:',
    ...technicalRows.map((row) => `${row[0]}: ${row[1]}`),
    '',
    'Maintenance plan:',
    ...maintenanceRows
      .filter((row: unknown[]) => row[0] || row[1])
      .map((row: unknown[]) => `${row[0]}: ${row[1]}`),
    '',
    'Spare parts:',
    ...sparePartsRows
      .filter((row: unknown[]) => row[1] || row[2])
      .map((row: unknown[]) => `${row[1] ?? ''} - ${row[2] ?? ''}`)
  ].join('\n');

  return [
    {
      name: model ? `FVV ${model}` : fileName?.replace(/\.[^.]+$/, '') || 'FVV',
      description: [model, capacity, speed].filter(Boolean).join(' | '),
      model,
      serialNumber,
      power: power || motor,
      status: 'OPERATIONAL',
      category: 'Production Equipment',
      additionalInfos,
      partsNames: sparePartsRows
        .map((row: unknown[]) => String(row[2] ?? '').trim())
        .filter(Boolean)
    }
  ];
};

export const parseAssetImportWorkbook = (
  base64: string,
  fileName?: string
): AssetImportDTO[] => {
  const workbook = read(base64, { type: 'base64' });
  const fvvAssets = formatFvvMaintenanceKit(workbook, fileName);
  if (fvvAssets.length) return fvvAssets;

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rows.length < 2) return [];

  const headers = rows[0] as unknown[];
  const headerMap = buildHeaderMap(headers);
  if (!headerMap.name) return [];

  const jsonRows = utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: ''
  });
  return formatGenericRows(jsonRows, headerMap);
};
