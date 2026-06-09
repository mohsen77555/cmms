import * as React from 'react';
import { Fragment, useContext, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Card, IconButton, Searchbar, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../store';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { FilterField, SearchCriteria } from '../../models/page';
import PreventiveMaintenance from '../../models/preventiveMaintenance';
import {
  getPreventiveMaintenances,
  getMorePreventiveMaintenances
} from '../../slices/preventiveMaintenance';
import { RootStackScreenProps } from '../../types';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import {
  getPriorityColor,
  isCloseToBottom,
  onSearchQueryChange
} from '../../utils/overall';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import Tag from '../../components/Tag';
import { IconWithLabel } from '../../components/IconWithLabel';
import { useAppTheme } from '../../custom-theme';

const getNextDueDate = (pm: PreventiveMaintenance): Date | null => {
  if (!pm.schedule?.startsOn || !pm.schedule?.frequency) {
    return null;
  }

  const nextDueDate = new Date(pm.schedule.startsOn);
  const today = new Date();
  while (nextDueDate < today) {
    nextDueDate.setDate(nextDueDate.getDate() + pm.schedule.frequency);
  }
  return nextDueDate;
};

const PreventiveMaintenanceCard = ({
  preventiveMaintenance,
  navigation
}: {
  preventiveMaintenance: PreventiveMaintenance;
  navigation: RootStackScreenProps<'PreventiveMaintenances'>['navigation'];
}) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const nextDueDate = getNextDueDate(preventiveMaintenance);

  const generatedOrdersFilter: FilterField[] = [
    {
      field: 'parentPreventiveMaintenance',
      operation: 'eq',
      value: preventiveMaintenance.id
    }
  ];

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('PreventiveMaintenanceDetails', {
          id: preventiveMaintenance.id,
          preventiveMaintenanceProp: preventiveMaintenance
        })
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                {preventiveMaintenance.name || preventiveMaintenance.title}
              </Text>
              {!!preventiveMaintenance.title &&
                preventiveMaintenance.title !== preventiveMaintenance.name && (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.grey }}
                  >
                    {preventiveMaintenance.title}
                  </Text>
                )}
            </View>
            <Tag
              text={
                preventiveMaintenance.schedule?.disabled
                  ? t('disabled')
                  : t('active')
              }
              backgroundColor={
                preventiveMaintenance.schedule?.disabled
                  ? theme.colors.tertiary
                  : theme.colors.success
              }
              color="white"
            />
          </View>
          <View style={styles.meta}>
            <Tag
              text={t(
                `${(
                  preventiveMaintenance.priority ?? 'NONE'
                ).toLowerCase()}_priority`
              )}
              backgroundColor={getPriorityColor(
                preventiveMaintenance.priority ?? 'NONE',
                theme
              )}
              color="white"
            />
            {!!preventiveMaintenance.schedule?.frequency && (
              <Text variant="bodySmall" style={{ color: theme.colors.grey }}>
                {t('every_frequency_days', {
                  frequency: preventiveMaintenance.schedule.frequency
                })}
              </Text>
            )}
          </View>
          <View style={styles.cardBody}>
            {nextDueDate && (
              <IconWithLabel
                icon="calendar-clock"
                label={`${t('next_due_date')}: ${getFormattedDate(
                  nextDueDate,
                  true
                )}`}
                color={theme.colors.grey}
              />
            )}
            {preventiveMaintenance.asset && (
              <IconWithLabel
                icon="package-variant-closed"
                label={preventiveMaintenance.asset.name}
                color={theme.colors.grey}
              />
            )}
            {preventiveMaintenance.location && (
              <IconWithLabel
                icon="map-marker-outline"
                label={preventiveMaintenance.location.name}
                color={theme.colors.grey}
              />
            )}
          </View>
          <Button
            compact
            mode="text"
            onPress={() =>
              navigation.navigate('Root', {
                screen: 'WorkOrders',
                params: {
                  filterFields: generatedOrdersFilter
                }
              })
            }
          >
            {t('view_generated_orders')}
          </Button>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

export default function PreventiveMaintenancesScreen({
  navigation
}: RootStackScreenProps<'PreventiveMaintenances'>) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const dispatch = useDispatch();
  const { hasViewPermission } = useAuth();
  const [startedSearch, setStartedSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { preventiveMaintenances, loadingGet, currentPageNum, lastPage } =
    useSelector((state) => state.preventiveMaintenances);
  const defaultFilterFields: FilterField[] = [];
  const getCriteriaFromFilterFields = (filterFields: FilterField[]) => ({
    filterFields,
    pageSize: 10,
    pageNum: 0,
    direction: 'DESC' as const
  });
  const [criteria, setCriteria] = useState<SearchCriteria>(
    getCriteriaFromFilterFields(defaultFilterFields)
  );

  useEffect(() => {
    if (hasViewPermission(PermissionEntity.PREVENTIVE_MAINTENANCES)) {
      dispatch(getPreventiveMaintenances(criteria));
    }
  }, [criteria]);

  const onRefresh = () => {
    setCriteria(getCriteriaFromFilterFields(defaultFilterFields));
  };

  const onQueryChange = (query) => {
    onSearchQueryChange<PreventiveMaintenance>(
      query,
      criteria,
      setCriteria,
      setSearchQuery,
      ['name', 'title', 'description']
    );
  };

  useDebouncedEffect(
    () => {
      if (startedSearch) onQueryChange(searchQuery);
    },
    [searchQuery],
    1000
  );

  if (!hasViewPermission(PermissionEntity.PREVENTIVE_MAINTENANCES)) {
    return (
      <View
        style={{ ...styles.centered, backgroundColor: theme.colors.background }}
      >
        <Text>{t('no_access_pm')}</Text>
      </View>
    );
  }

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <Fragment>
        <Searchbar
          placeholder={t('search')}
          onFocus={() => setStartedSearch(true)}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ backgroundColor: theme.colors.background }}
        />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          style={styles.scrollView}
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              if (!loadingGet && !lastPage) {
                dispatch(
                  getMorePreventiveMaintenances(criteria, currentPageNum + 1)
                );
              }
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={loadingGet}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          scrollEventThrottle={400}
        >
          <View style={styles.introCard}>
            <IconButton icon="calendar-sync" iconColor={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall">{t('maintenance_plan_overview')}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.grey }}>
                {t('maintenance_plan_overview_description')}
              </Text>
            </View>
          </View>
          {preventiveMaintenances.content.length ? (
            preventiveMaintenances.content.map((preventiveMaintenance) => (
              <PreventiveMaintenanceCard
                key={preventiveMaintenance.id}
                preventiveMaintenance={preventiveMaintenance}
                navigation={navigation}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text>{t('no_maintenance_plans')}</Text>
            </View>
          )}
        </ScrollView>
      </Fragment>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    paddingHorizontal: 10
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  introCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: 'white'
  },
  card: {
    marginVertical: 6,
    borderRadius: 10
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  cardTitle: {
    fontWeight: 'bold'
  },
  meta: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  cardBody: {
    gap: 8,
    marginTop: 10
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40
  }
});
