import { useTranslation } from 'react-i18next';
import { AssetDTO as Asset } from '../../../models/asset';
import * as React from 'react';
import { useContext, useMemo, useState } from 'react';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../../../components/Themed';
import {
  Card,
  Divider,
  IconButton,
  Searchbar,
  Text,
  useTheme
} from 'react-native-paper';
import { UserMiniDTO } from '../../../models/user';
import { Customer } from '../../../models/customer';
import { Vendor } from '../../../models/vendor';
import Team from '../../../models/team';
import {
  getCustomerUrl,
  getTeamUrl,
  getUserUrl,
  getVendorUrl
} from '../../../utils/urlPaths';
import ListField from '../../../components/ListField';
import BasicField from '../../../components/BasicField';
import { getCustomFieldValuesForDetails } from '../../../models/form';
import {
  ExcelImportSection,
  ExcelImportInfo,
  parseExcelImportInfo
} from '../../../utils/excelImportInfo';

const ExcelSection = ({ section }: { section: ExcelImportSection }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? section.rows : section.rows.slice(0, 3);

  return (
    <Card style={styles.excelSection}>
      <TouchableOpacity
        onPress={() => setExpanded((value) => !value)}
        style={styles.excelSectionHeader}
      >
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <Text variant="titleMedium" style={styles.excelSectionTitle}>
            {section.sheetName}
          </Text>
          <Text variant="bodySmall">
            {section.rows.length} rows / {section.headers.length} columns
          </Text>
        </View>
        <IconButton icon={expanded ? 'chevron-up' : 'chevron-down'} />
      </TouchableOpacity>
      {visibleRows.map((row, rowIndex) => {
        const rowLabel = row[0] && section.headers.length > 2 ? row[0] : '';
        return (
          <View
            key={`${section.sheetName}-${rowIndex}`}
            style={styles.excelRow}
          >
            {!!rowLabel && (
              <Text variant="titleSmall" style={styles.excelRowTitle}>
                {rowLabel}
              </Text>
            )}
            {section.headers.map((header, index) => {
              const value = row[index];
              if (!value) return null;
              const label =
                section.headers.length === 2 && index === 1 && row[0]
                  ? row[0]
                  : header;
              if (section.headers.length === 2 && index === 0 && row[1]) {
                return null;
              }
              return (
                <View key={`${header}-${index}`} style={styles.excelCell}>
                  <Text variant="bodySmall" style={styles.excelHeader}>
                    {label}
                  </Text>
                  <Text variant="bodyMedium" style={styles.excelValue}>
                    {value}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </Card>
  );
};

const normalize = (value: string) => value.toLowerCase().trim();

const filterExcelInfo = (
  info: ExcelImportInfo,
  query: string
): ExcelImportInfo => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return info;

  return {
    ...info,
    sections: info.sections
      .map((section) => {
        const sectionMatches = normalize(section.sheetName).includes(
          normalizedQuery
        );
        const headerMatches = section.headers.some((header) =>
          normalize(header).includes(normalizedQuery)
        );
        const rows = section.rows.filter((row) =>
          row.some((cell) => normalize(cell).includes(normalizedQuery))
        );
        return {
          ...section,
          rows: sectionMatches || headerMatches ? section.rows : rows
        };
      })
      .filter((section) => section.rows.length)
  };
};

const getGovernanceStats = (info: ExcelImportInfo) => {
  const cells = info.sections.flatMap((section) =>
    section.rows.flatMap((row) => row)
  );
  const filledCells = cells.filter((cell) => !!cell).length;
  const completeness = cells.length
    ? Math.round((filledCells / cells.length) * 100)
    : 0;
  const sheetNames = info.sections.map((section) => section.sheetName);
  const hasSheet = (name: string) =>
    sheetNames.some((sheetName) => sheetName.includes(name));

  return {
    sections: info.sections.length,
    rows: info.sections.reduce(
      (total, section) => total + section.rows.length,
      0
    ),
    fields: filledCells,
    completeness,
    hasTechnicalData: hasSheet('البيانات الفنية'),
    hasSpareParts: hasSheet('قطع الغيار'),
    hasMaintenancePlan: hasSheet('خطة الصيانة'),
    hasTroubleshooting: hasSheet('الأعطال'),
    hasSafety: hasSheet('السلامة')
  };
};

const GovernanceBadge = ({
  label,
  value,
  positive
}: {
  label: string;
  value: string | number;
  positive?: boolean;
}) => (
  <View style={styles.governanceBadge}>
    <Text variant="bodySmall" style={styles.governanceLabel}>
      {label}
    </Text>
    <Text
      variant="titleSmall"
      style={[
        styles.governanceValue,
        positive === false ? styles.governanceWarning : undefined
      ]}
    >
      {value}
    </Text>
  </View>
);

const ExcelGovernancePanel = ({ info }: { info: ExcelImportInfo }) => {
  const { t } = useTranslation();
  const stats = getGovernanceStats(info);

  return (
    <Card style={styles.governanceCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.governanceTitle}>
          {t('smart_governance')}
        </Text>
        <Text variant="bodySmall" style={styles.governanceDescription}>
          {t('smart_governance_description')}
        </Text>
        <View style={styles.governanceGrid}>
          <GovernanceBadge label={t('excel_sheets')} value={stats.sections} />
          <GovernanceBadge label={t('excel_rows')} value={stats.rows} />
          <GovernanceBadge label={t('excel_fields')} value={stats.fields} />
          <GovernanceBadge
            label={t('data_completeness')}
            value={`${stats.completeness}%`}
            positive={stats.completeness >= 60}
          />
        </View>
        <View style={styles.governanceChecklist}>
          <GovernanceBadge
            label={t('technical_data')}
            value={stats.hasTechnicalData ? t('available') : t('missing')}
            positive={stats.hasTechnicalData}
          />
          <GovernanceBadge
            label={t('spare_parts')}
            value={stats.hasSpareParts ? t('available') : t('missing')}
            positive={stats.hasSpareParts}
          />
          <GovernanceBadge
            label={t('maintenance_plans')}
            value={stats.hasMaintenancePlan ? t('available') : t('missing')}
            positive={stats.hasMaintenancePlan}
          />
          <GovernanceBadge
            label={t('troubleshooting')}
            value={stats.hasTroubleshooting ? t('available') : t('missing')}
            positive={stats.hasTroubleshooting}
          />
          <GovernanceBadge
            label={t('safety')}
            value={stats.hasSafety ? t('available') : t('missing')}
            positive={stats.hasSafety}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

export default function AssetDetails({
  asset,
  navigation
}: {
  asset: Asset;
  navigation: any;
}) {
  const { getFormattedDate, getFormattedCurrency } = useContext(
    CompanySettingsContext
  );
  const { t } = useTranslation();
  const theme = useTheme();
  const [excelSearch, setExcelSearch] = useState('');
  const excelImportInfo = parseExcelImportInfo(asset?.additionalInfos);
  const filteredExcelInfo = useMemo(
    () =>
      excelImportInfo ? filterExcelInfo(excelImportInfo, excelSearch) : null,
    [excelImportInfo, excelSearch]
  );
  const fieldsToRender: {
    label: string;
    value: string | number;
    isLink?: boolean;
  }[] = [
    { label: t('name'), value: asset?.name },
    { label: t('description'), value: asset?.description },
    { label: t('category'), value: asset?.category?.name },
    { label: t('model'), value: asset?.model },
    { label: t('manufacturer'), value: asset?.manufacturer },
    { label: t('power'), value: asset?.power },
    { label: t('serial_number'), value: asset?.serialNumber },
    {
      label: t('status'),
      value: t(asset?.status)
    },
    {
      label: t('acquisition_cost'),
      value: asset?.acquisitionCost
        ? getFormattedCurrency(asset?.acquisitionCost)
        : null
    },
    { label: t('area'), value: asset?.area },
    { label: t('barcode'), value: asset?.barCode },
    { label: t('nfc_tag'), value: asset?.nfcId },
    ...(excelImportInfo
      ? []
      : [
          {
            label: t('additional_information'),
            value: asset?.additionalInfos
          }
        ]),
    {
      label: t('placed_in_service'),
      value: getFormattedDate(asset?.inServiceDate)
    },
    {
      label: t('warranty_expiration'),
      value: getFormattedDate(asset?.warrantyExpirationDate)
    },
    ...getCustomFieldValuesForDetails(
      asset?.customFieldValues,
      getFormattedDate
    )
  ];
  return (
    <ScrollView
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      {asset.image && (
        <Image style={{ height: 200 }} source={{ uri: asset.image.url }} />
      )}
      {fieldsToRender.map((field) => (
        <BasicField
          key={field.label}
          label={field.label}
          value={field.value}
          isLink={field.isLink}
        />
      ))}
      {excelImportInfo && (
        <View style={styles.excelContainer}>
          <Text variant="titleLarge" style={styles.excelTitle}>
            {t('excel_imported_sections')}
          </Text>
          {!!excelImportInfo.source && (
            <Text variant="bodySmall" style={styles.excelSource}>
              {excelImportInfo.source}
            </Text>
          )}
          <ExcelGovernancePanel info={excelImportInfo} />
          <Searchbar
            placeholder={t('search_excel_fields')}
            value={excelSearch}
            onChangeText={setExcelSearch}
            style={styles.excelSearch}
          />
          {filteredExcelInfo.sections.map((section) => (
            <ExcelSection key={section.sheetName} section={section} />
          ))}
          {!filteredExcelInfo.sections.length && (
            <Text style={styles.noExcelResults}>{t('no_results_found')}</Text>
          )}
        </View>
      )}
      {asset.primaryUser && (
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20
            }}
          >
            <Text>{t('primary_worker')}</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.push('UserDetails', { id: asset.primaryUser.id })
              }
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  color: theme.colors.primary
                }}
              >{`${asset.primaryUser.firstName} ${asset.primaryUser.lastName}`}</Text>
            </TouchableOpacity>
          </View>
          <Divider />
        </View>
      )}
      {asset.location && (
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20
            }}
          >
            <Text>{t('location')}</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.push('LocationDetails', { id: asset.location.id })
              }
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  color: theme.colors.primary
                }}
              >
                {asset.location.name}
              </Text>
            </TouchableOpacity>
          </View>
          <Divider />
        </View>
      )}
      <ListField
        values={asset?.assignedTo}
        label={t('assigned_to')}
        getHref={(user: UserMiniDTO) => getUserUrl(user.id)}
        getValueLabel={(user: UserMiniDTO) =>
          `${user.firstName} ${user.lastName}`
        }
      />
      <ListField
        values={asset?.customers}
        label={t('customers')}
        getHref={(customer: Customer) => getCustomerUrl(customer.id)}
        getValueLabel={(customer: Customer) => customer.name}
      />
      <ListField
        values={asset?.vendors}
        label={t('vendors')}
        getHref={(vendor: Vendor) => getVendorUrl(vendor.id)}
        getValueLabel={(vendor: Vendor) => vendor.companyName}
      />
      <ListField
        values={asset?.teams}
        label={t('teams')}
        getHref={(team: Team) => getTeamUrl(team.id)}
        getValueLabel={(team: Team) => team.name}
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  excelContainer: {
    padding: 10,
    backgroundColor: 'transparent'
  },
  excelTitle: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  excelSource: {
    marginBottom: 8
  },
  excelSection: {
    marginVertical: 6
  },
  excelSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12
  },
  excelSectionTitle: {
    fontWeight: 'bold'
  },
  excelSearch: {
    marginVertical: 8
  },
  excelRow: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: 'transparent'
  },
  excelRowTitle: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  excelCell: {
    marginBottom: 8,
    backgroundColor: '#f8f8fb',
    borderRadius: 8,
    padding: 8
  },
  excelHeader: {
    color: '#676b6b'
  },
  excelValue: {
    fontWeight: 'bold'
  },
  noExcelResults: {
    textAlign: 'center',
    marginVertical: 16
  },
  governanceCard: {
    marginVertical: 8
  },
  governanceTitle: {
    fontWeight: 'bold'
  },
  governanceDescription: {
    marginTop: 4,
    marginBottom: 8
  },
  governanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  governanceChecklist: {
    marginTop: 8,
    gap: 6
  },
  governanceBadge: {
    backgroundColor: '#f8f8fb',
    borderRadius: 8,
    padding: 8,
    minWidth: '47%',
    flex: 1
  },
  governanceLabel: {
    color: '#676b6b'
  },
  governanceValue: {
    fontWeight: 'bold'
  },
  governanceWarning: {
    color: '#FF1943'
  }
});
