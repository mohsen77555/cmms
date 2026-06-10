import { useTranslation } from 'react-i18next';
import { AssetDTO as Asset } from '../../../models/asset';
import * as React from 'react';
import { useContext, useState } from 'react';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../../../components/Themed';
import { Card, Divider, IconButton, Text, useTheme } from 'react-native-paper';
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
      {visibleRows.map((row, rowIndex) => (
        <View key={`${section.sheetName}-${rowIndex}`} style={styles.excelRow}>
          {section.headers.map((header, index) => {
            const value = row[index];
            if (!value) return null;
            return (
              <View key={`${header}-${index}`} style={styles.excelCell}>
                <Text variant="bodySmall" style={styles.excelHeader}>
                  {header}
                </Text>
                <Text variant="bodyMedium" style={styles.excelValue}>
                  {value}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
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
  const excelImportInfo = parseExcelImportInfo(asset?.additionalInfos);
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
          {excelImportInfo.sections.map((section) => (
            <ExcelSection key={section.sheetName} section={section} />
          ))}
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
  excelRow: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: 'transparent'
  },
  excelCell: {
    marginBottom: 8,
    backgroundColor: 'transparent'
  },
  excelHeader: {
    color: '#676b6b'
  },
  excelValue: {
    fontWeight: 'bold'
  }
});
