import * as React from 'react';
import { useContext, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Text
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../store';
import { RootStackScreenProps } from '../../types';
import PreventiveMaintenance from '../../models/preventiveMaintenance';
import {
  clearSinglePM,
  getSinglePreventiveMaintenance
} from '../../slices/preventiveMaintenance';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import { getPriorityColor } from '../../utils/overall';
import Tag from '../../components/Tag';
import { IconWithLabel } from '../../components/IconWithLabel';
import { useAppTheme } from '../../custom-theme';
import { FilterField } from '../../models/page';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

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

const DetailRow = ({
  icon,
  label,
  value
}: {
  icon: IconSource;
  label: string;
  value?: string | number | null;
}) => {
  const theme = useAppTheme();
  if (value === undefined || value === null || value === '') return null;

  return (
    <View style={styles.detailRow}>
      <IconWithLabel icon={icon} label={label} color={theme.colors.grey} />
      <Text variant="bodyMedium" style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
};

export default function PreventiveMaintenanceDetailsScreen({
  navigation,
  route
}: RootStackScreenProps<'PreventiveMaintenanceDetails'>) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const dispatch = useDispatch();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const { singlePreventiveMaintenance, loadingGet } = useSelector(
    (state) => state.preventiveMaintenances
  );
  const preventiveMaintenance =
    route.params.preventiveMaintenanceProp ?? singlePreventiveMaintenance;

  const loadPreventiveMaintenance = () => {
    dispatch(getSinglePreventiveMaintenance(route.params.id));
  };

  useEffect(() => {
    if (!route.params.preventiveMaintenanceProp) {
      loadPreventiveMaintenance();
    }

    return () => {
      dispatch(clearSinglePM());
    };
  }, [route.params.id]);

  if (!preventiveMaintenance) {
    return (
      <View
        style={{ ...styles.centered, backgroundColor: theme.colors.background }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  const nextDueDate = getNextDueDate(preventiveMaintenance);
  const generatedOrdersFilter: FilterField[] = [
    {
      field: 'parentPreventiveMaintenance',
      operation: 'eq',
      value: preventiveMaintenance.id
    }
  ];

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={loadingGet}
          onRefresh={loadPreventiveMaintenance}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={styles.title}>
                {preventiveMaintenance.name || preventiveMaintenance.title}
              </Text>
              {!!preventiveMaintenance.title &&
                preventiveMaintenance.title !== preventiveMaintenance.name && (
                  <Text
                    variant="bodyMedium"
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
          {!!preventiveMaintenance.description && (
            <Text variant="bodyMedium" style={styles.description}>
              {preventiveMaintenance.description}
            </Text>
          )}
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
            {!!nextDueDate && (
              <Tag
                text={`${t('next_due_date')}: ${getFormattedDate(
                  nextDueDate,
                  true
                )}`}
                backgroundColor={theme.colors.primary}
                color="white"
              />
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={t('scheduling_overview')}
          left={(props) => <IconButton {...props} icon="calendar-sync" />}
        />
        <Card.Content>
          <DetailRow
            icon="calendar-start"
            label={t('starts_on')}
            value={
              preventiveMaintenance.schedule?.startsOn
                ? getFormattedDate(
                    preventiveMaintenance.schedule.startsOn,
                    true
                  )
                : null
            }
          />
          <DetailRow
            icon="calendar-end"
            label={t('ends_on')}
            value={
              preventiveMaintenance.schedule?.endsOn
                ? getFormattedDate(preventiveMaintenance.schedule.endsOn, true)
                : null
            }
          />
          <DetailRow
            icon="repeat"
            label={t('frequency')}
            value={
              preventiveMaintenance.schedule?.frequency
                ? t('every_frequency_days', {
                    frequency: preventiveMaintenance.schedule.frequency
                  })
                : null
            }
          />
          <DetailRow
            icon="clock-alert-outline"
            label={t('due_date_delay')}
            value={
              preventiveMaintenance.schedule?.dueDateDelay !== undefined
                ? t('days_count', {
                    days: preventiveMaintenance.schedule.dueDateDelay
                  })
                : null
            }
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title={t('technical_object')}
          left={(props) => <IconButton {...props} icon="sitemap-outline" />}
        />
        <Card.Content>
          {preventiveMaintenance.asset ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AssetDetails', {
                  id: preventiveMaintenance.asset.id
                })
              }
            >
              <DetailRow
                icon="package-variant-closed"
                label={t('asset')}
                value={preventiveMaintenance.asset.name}
              />
            </TouchableOpacity>
          ) : null}
          {preventiveMaintenance.location ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('LocationDetails', {
                  id: preventiveMaintenance.location.id
                })
              }
            >
              <DetailRow
                icon="map-marker-outline"
                label={t('functional_location')}
                value={preventiveMaintenance.location.name}
              />
            </TouchableOpacity>
          ) : null}
          <DetailRow
            icon="account-hard-hat"
            label={t('primary_worker')}
            value={
              preventiveMaintenance.primaryUser
                ? `${preventiveMaintenance.primaryUser.firstName} ${preventiveMaintenance.primaryUser.lastName}`
                : null
            }
          />
          <DetailRow
            icon="account-group-outline"
            label={t('team')}
            value={preventiveMaintenance.team?.name}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={styles.button}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    marginTop: 10,
    borderRadius: 10
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start'
  },
  title: {
    fontWeight: 'bold'
  },
  description: {
    marginTop: 10
  },
  meta: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8
  },
  detailValue: {
    flex: 1,
    textAlign: 'right'
  },
  button: {
    marginTop: 12
  }
});
