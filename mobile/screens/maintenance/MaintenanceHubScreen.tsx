import * as React from 'react';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';
import { View } from '../../components/Themed';
import { Card, Chip, IconButton, Text, useTheme } from 'react-native-paper';
import { TabBar, TabView } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, RootStackScreenProps } from '../../types';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';

type HubAction = {
  title: string;
  description: string;
  icon: string;
  route?: keyof RootStackParamList;
  params?: any;
  enabled: boolean;
};

type HubTab = {
  key: string;
  title: string;
  chapter: string;
  summary: string;
  actions: HubAction[];
};

const ActionCard = ({
  action,
  navigation
}: {
  action: HubAction;
  navigation: RootStackScreenProps<'MaintenanceHub'>['navigation'];
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const disabled = !action.enabled || !action.route;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() =>
        action.route && navigation.navigate(action.route as any, action.params)
      }
    >
      <Card style={[styles.actionCard, disabled ? styles.disabledCard : null]}>
        <Card.Content style={styles.actionContent}>
          <IconButton
            icon={action.icon}
            iconColor={disabled ? theme.colors.outline : theme.colors.primary}
          />
          <View style={styles.actionText}>
            <Text variant="titleMedium" style={styles.actionTitle}>
              {action.title}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {action.description}
            </Text>
          </View>
          <Chip compact>{disabled ? t('planned') : t('available')}</Chip>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const HubTabContent = ({
  tab,
  navigation
}: {
  tab: HubTab;
  navigation: RootStackScreenProps<'MaintenanceHub'>['navigation'];
}) => {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.chapter}>
            {tab.chapter}
          </Text>
          <Text variant="bodyMedium">{tab.summary}</Text>
        </Card.Content>
      </Card>
      {tab.actions.map((action) => (
        <ActionCard
          key={action.title}
          action={action}
          navigation={navigation}
        />
      ))}
    </ScrollView>
  );
};

export default function MaintenanceHubScreen({
  navigation
}: RootStackScreenProps<'MaintenanceHub'>) {
  const { t } = useTranslation();
  const { hasViewPermission, hasCreatePermission } = useAuth();
  const theme = useTheme();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const tabs: HubTab[] = useMemo(
    () => [
      {
        key: 'overview',
        title: t('maintenance_overview_short'),
        chapter: t('maintenance_chapter_1'),
        summary: t('maintenance_chapter_1_summary'),
        actions: [
          {
            title: t('work_orders'),
            description: t('maintenance_action_work_orders'),
            icon: 'clipboard-list-outline',
            route: 'Root',
            params: { screen: 'WorkOrders', params: { filterFields: [] } },
            enabled: hasViewPermission(PermissionEntity.WORK_ORDERS)
          },
          {
            title: t('stats'),
            description: t('maintenance_action_stats'),
            icon: 'chart-bar',
            route: 'WorkOrderStats',
            enabled: hasViewPermission(PermissionEntity.ANALYTICS)
          },
          {
            title: t('requests'),
            description: t('maintenance_action_requests'),
            icon: 'inbox-outline',
            route: 'Root',
            params: { screen: 'Requests' },
            enabled: hasViewPermission(PermissionEntity.REQUESTS)
          }
        ]
      },
      {
        key: 'organization',
        title: t('maintenance_organization_short'),
        chapter: t('maintenance_chapter_2'),
        summary: t('maintenance_chapter_2_summary'),
        actions: [
          {
            title: t('people_teams'),
            description: t('maintenance_action_people_teams'),
            icon: 'account-group-outline',
            route: 'PeopleTeams',
            enabled: hasViewPermission(PermissionEntity.PEOPLE_AND_TEAMS)
          },
          {
            title: t('locations'),
            description: t('maintenance_action_work_areas'),
            icon: 'map-marker-outline',
            route: 'Locations',
            enabled: hasViewPermission(PermissionEntity.LOCATIONS)
          },
          {
            title: t('maintenance_resources'),
            description: t('maintenance_action_resources_planned'),
            icon: 'account-hard-hat',
            enabled: false
          }
        ]
      },
      {
        key: 'assets',
        title: t('assets'),
        chapter: t('maintenance_chapter_3'),
        summary: t('maintenance_chapter_3_summary'),
        actions: [
          {
            title: t('assets'),
            description: t('maintenance_action_assets'),
            icon: 'package-variant-closed',
            route: 'Assets',
            enabled: hasViewPermission(PermissionEntity.ASSETS)
          },
          {
            title: t('import_assets_from_excel'),
            description: t('maintenance_action_asset_import'),
            icon: 'file-excel',
            route: 'Assets',
            enabled: hasCreatePermission(PermissionEntity.ASSETS)
          },
          {
            title: t('asset_meters'),
            description: t('maintenance_action_asset_meters'),
            icon: 'gauge',
            route: 'Meters',
            enabled: hasViewPermission(PermissionEntity.METERS)
          }
        ]
      },
      {
        key: 'asset-groups',
        title: t('asset_groups'),
        chapter: t('maintenance_chapter_4'),
        summary: t('maintenance_chapter_4_summary'),
        actions: [
          {
            title: t('asset_group_rules'),
            description: t('maintenance_action_asset_group_rules'),
            icon: 'shape-outline',
            enabled: false
          },
          {
            title: t('asset_groups'),
            description: t('maintenance_action_asset_groups'),
            icon: 'select-group',
            enabled: false
          }
        ]
      },
      {
        key: 'meters',
        title: t('meters'),
        chapter: t('maintenance_chapter_5'),
        summary: t('maintenance_chapter_5_summary'),
        actions: [
          {
            title: t('meters'),
            description: t('maintenance_action_meters'),
            icon: 'gauge',
            route: 'Meters',
            enabled: hasViewPermission(PermissionEntity.METERS)
          },
          {
            title: t('meter_templates'),
            description: t('maintenance_action_meter_templates'),
            icon: 'file-cog-outline',
            enabled: false
          },
          {
            title: t('reading_history'),
            description: t('maintenance_action_reading_history'),
            icon: 'history',
            route: 'Meters',
            enabled: hasViewPermission(PermissionEntity.METERS)
          }
        ]
      },
      {
        key: 'warranty',
        title: t('supplier_warranty'),
        chapter: t('maintenance_chapter_6'),
        summary: t('maintenance_chapter_6_summary'),
        actions: [
          {
            title: t('warranty_contracts'),
            description: t('maintenance_action_warranty_contracts'),
            icon: 'shield-check-outline',
            enabled: false
          },
          {
            title: t('warranty_claims'),
            description: t('maintenance_action_warranty_claims'),
            icon: 'cash-refund',
            enabled: false
          }
        ]
      },
      {
        key: 'standard-operations',
        title: t('standard_operations'),
        chapter: t('maintenance_chapter_7'),
        summary: t('maintenance_chapter_7_summary'),
        actions: [
          {
            title: t('checklists'),
            description: t('maintenance_action_checklists'),
            icon: 'format-list-checks',
            enabled: false
          },
          {
            title: t('standard_operations'),
            description: t('maintenance_action_standard_operations'),
            icon: 'cog-sync-outline',
            enabled: false
          }
        ]
      }
    ],
    [t, hasViewPermission, hasCreatePermission]
  );

  return (
    <TabView
      navigationState={{ index, routes: tabs }}
      renderScene={({ route }) => (
        <HubTabContent tab={route as HubTab} navigation={navigation} />
      )}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          scrollEnabled
          indicatorStyle={{ backgroundColor: 'white' }}
          style={{ backgroundColor: theme.colors.primary }}
        />
      )}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
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
  chapter: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  actionCard: {
    marginVertical: 6
  },
  disabledCard: {
    opacity: 0.65
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionText: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  actionTitle: {
    fontWeight: 'bold'
  }
});
