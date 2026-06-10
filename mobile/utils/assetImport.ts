import { read, utils } from 'xlsx';
import {
  AssetImportDTO,
  MaintenanceKitImportPayload,
  PartImportDTO,
  PreventiveMaintenanceImportDTO
} from '../models/imports';
import {
  buildExcelImportInfo,
  serializeExcelImportInfo
} from './excelImportInfo';

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

const toExcelSerialDate = (date: Date) =>
  date.getTime() / (24 * 60 * 60 * 1000) + 25569;

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

const parseFvvFrequency = (
  value: unknown
): Pick<
  PreventiveMaintenanceImportDTO,
  'recurrenceType' | 'frequency' | 'dueDateDelay'
> => {
  const normalized = normalizeHeader(value);
  if (normalized.includes('يومي') || normalized.includes('daily')) {
    return { recurrenceType: 'daily', frequency: 1, dueDateDelay: 1 };
  }
  if (normalized.includes('اسبوع') || normalized.includes('weekly')) {
    return { recurrenceType: 'weekly', frequency: 1, dueDateDelay: 2 };
  }
  if (normalized.includes('ربع') || normalized.includes('quarter')) {
    return { recurrenceType: 'monthly', frequency: 3, dueDateDelay: 7 };
  }
  if (
    normalized.includes('نصف') ||
    normalized.includes('4000') ||
    normalized.includes('semi')
  ) {
    return { recurrenceType: 'monthly', frequency: 6, dueDateDelay: 14 };
  }
  if (normalized.includes('سنوي') || normalized.includes('annual')) {
    return { recurrenceType: 'yearly', frequency: 1, dueDateDelay: 30 };
  }
  return { recurrenceType: 'monthly', frequency: 1, dueDateDelay: 7 };
};

const formatFvvParts = (rows: unknown[][]): PartImportDTO[] => {
  const seenBarcodes = new Set<string>();
  return rows
    .filter((row) => row[1] || row[2])
    .map((row) => {
      const code = String(row[1] ?? '').trim();
      const description = String(row[2] ?? '').trim();
      const stock = parseNumber(row[3]);
      const name = description || code;
      const barcode = code && !seenBarcodes.has(code) ? code : '';
      if (barcode) {
        seenBarcodes.add(barcode);
      }
      return {
        id: null,
        name,
        barcode,
        description,
        quantity: stock ?? 0,
        minQuantity: 0,
        nonStock: stock === undefined ? 'Yes' : 'No',
        category: 'FVV Spare Parts',
        additionalInfos: [
          `Position: ${row[0] ?? ''}`.trim(),
          code && !barcode ? `Original duplicate code: ${code}` : ''
        ]
          .filter(Boolean)
          .join('\n')
      };
    })
    .filter((part) => !!part.name);
};

const formatFvvPreventiveMaintenances = (
  rows: unknown[][],
  assetName: string,
  fileName?: string
): PreventiveMaintenanceImportDTO[] => {
  const startsOn = toExcelSerialDate(new Date());
  const endsOn = toExcelSerialDate(
    new Date(new Date().setFullYear(new Date().getFullYear() + 10))
  );

  return rows
    .filter((row) => row[0] || row[1])
    .map((row) => {
      const frequencyLabel = String(row[0] ?? '').trim();
      const task = String(row[1] ?? '').trim();
      if (!task) return null;
      const recurrence = parseFvvFrequency(frequencyLabel);
      return {
        id: null,
        startsOn,
        endsOn,
        name: `${frequencyLabel} - ${task}`.slice(0, 180),
        title: task,
        description: [
          `Source: ${fileName ?? 'FVV maintenance kit'}`,
          `Original interval: ${frequencyLabel}`,
          task
        ].join('\n'),
        frequency: recurrence.frequency,
        dueDateDelay: recurrence.dueDateDelay,
        recurrenceType: recurrence.recurrenceType,
        recurrenceBasedOn: 'Scheduled Date',
        daysOfWeek:
          recurrence.recurrenceType === 'weekly' ? ['monday'] : undefined,
        priority: frequencyLabel.includes('يومي') ? 'High' : 'Medium',
        estimatedDuration: 1,
        requiredSignature: 'No',
        category: 'Preventive Maintenance',
        assetName,
        locationName: '',
        teamName: '',
        primaryUserEmail: '',
        assignedToEmails: [],
        customersNames: []
      };
    })
    .filter(Boolean) as PreventiveMaintenanceImportDTO[];
};

const formatFvvMaintenanceKit = (
  workbook,
  fileName?: string
): MaintenanceKitImportPayload => {
  const technicalSheet = workbook.SheetNames.find((name: string) =>
    name.includes('البيانات الفنية')
  );
  if (!technicalSheet) {
    return { assets: [], parts: [], preventiveMaintenances: [] };
  }

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

  const additionalInfos = serializeExcelImportInfo(
    buildExcelImportInfo(workbook, getSheetRows, fileName)
  );

  const assetName = model
    ? `FVV ${model}`
    : fileName?.replace(/\.[^.]+$/, '') || 'FVV';
  const parts = formatFvvParts(sparePartsRows);
  return {
    parts,
    preventiveMaintenances: formatFvvPreventiveMaintenances(
      maintenanceRows,
      assetName,
      fileName
    ),
    assets: [
      {
        name: assetName,
        description: [model, capacity, speed].filter(Boolean).join(' | '),
        model,
        serialNumber,
        power: power || motor,
        status: 'OPERATIONAL',
        category: 'Production Equipment',
        additionalInfos,
        partsNames: parts.map((part) => part.name)
      }
    ]
  };
};

export const parseMaintenanceKitImportWorkbook = (
  base64: string,
  fileName?: string
): MaintenanceKitImportPayload => {
  const workbook = read(base64, { type: 'base64' });
  const fvvPayload = formatFvvMaintenanceKit(workbook, fileName);
  if (
    fvvPayload.assets.length ||
    fvvPayload.parts.length ||
    fvvPayload.preventiveMaintenances.length
  ) {
    return fvvPayload;
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rows.length < 2) {
    return { assets: [], parts: [], preventiveMaintenances: [] };
  }

  const headers = rows[0] as unknown[];
  const headerMap = buildHeaderMap(headers);
  if (!headerMap.name) {
    return { assets: [], parts: [], preventiveMaintenances: [] };
  }

  const jsonRows = utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: ''
  });
  return {
    assets: formatGenericRows(jsonRows, headerMap),
    parts: [],
    preventiveMaintenances: []
  };
};

export const parseAssetImportWorkbook = (
  base64: string,
  fileName?: string
): AssetImportDTO[] => {
  return parseMaintenanceKitImportWorkbook(base64, fileName).assets;
};
