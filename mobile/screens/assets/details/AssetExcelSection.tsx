import * as React from 'react';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../../../components/Themed';
import {
  Card,
  IconButton,
  Searchbar,
  Text,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ExcelImportSection } from '../../../utils/excelImportInfo';

const normalize = (value: string) => value.toLowerCase().trim();

const rowMatches = (row: string[], query: string) =>
  row.some((cell) => normalize(cell).includes(query));

export default function AssetExcelSection({
  section
}: {
  section: ExcelImportSection;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const normalizedSearch = normalize(search);
  const rows = useMemo(
    () =>
      normalizedSearch
        ? section.rows.filter((row) => rowMatches(row, normalizedSearch))
        : section.rows,
    [section, normalizedSearch]
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {section.sheetName}
          </Text>
          <Text variant="bodySmall">
            {section.rows.length} {t('excel_rows')} / {section.headers.length}{' '}
            {t('excel_fields')}
          </Text>
        </Card.Content>
      </Card>

      <Searchbar
        placeholder={t('search_excel_fields')}
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {rows.map((row, rowIndex) => {
        const originalIndex = section.rows.indexOf(row);
        const expanded = expandedRows[originalIndex] ?? true;
        const rowTitle =
          row[0] && section.headers.length > 2
            ? row[0]
            : `${t('excel_row')} ${originalIndex + 1}`;
        const cells = section.headers
          .map((header, index) => {
            const value = row[index];
            if (!value) return null;
            const label =
              section.headers.length === 2 && index === 1 && row[0]
                ? row[0]
                : header;
            if (section.headers.length === 2 && index === 0 && row[1]) {
              return null;
            }
            return { label, value };
          })
          .filter(Boolean) as { label: string; value: string }[];

        return (
          <Card
            key={`${section.sheetName}-${originalIndex}`}
            style={styles.rowCard}
          >
            <TouchableOpacity
              style={styles.rowHeader}
              onPress={() =>
                setExpandedRows((current) => ({
                  ...current,
                  [originalIndex]: !expanded
                }))
              }
            >
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text variant="titleMedium" style={styles.rowTitle}>
                  {rowTitle}
                </Text>
                <Text variant="bodySmall">
                  {cells.length} {t('excel_fields')}
                </Text>
              </View>
              <IconButton icon={expanded ? 'chevron-up' : 'chevron-down'} />
            </TouchableOpacity>
            {expanded &&
              cells.map((cell, cellIndex) => (
                <View key={`${cell.label}-${cellIndex}`} style={styles.field}>
                  <Text variant="bodySmall" style={styles.fieldLabel}>
                    {cell.label}
                  </Text>
                  <Text variant="bodyMedium" style={styles.fieldValue}>
                    {cell.value}
                  </Text>
                </View>
              ))}
          </Card>
        );
      })}

      {!rows.length && (
        <Text style={styles.empty}>{t('no_results_found')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 10,
    paddingBottom: 100
  },
  summaryCard: {
    marginBottom: 8
  },
  title: {
    fontWeight: 'bold'
  },
  search: {
    marginBottom: 8
  },
  rowCard: {
    marginVertical: 6
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12
  },
  rowTitle: {
    fontWeight: 'bold'
  },
  field: {
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#f8f8fb',
    borderRadius: 8,
    padding: 10
  },
  fieldLabel: {
    color: '#676b6b'
  },
  fieldValue: {
    fontWeight: 'bold',
    marginTop: 2
  },
  empty: {
    textAlign: 'center',
    marginVertical: 16
  }
});
