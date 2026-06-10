import * as React from 'react';
import { useContext, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { View } from '../../../components/Themed';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../../store';
import { getMetersByAsset } from '../../../slices/meter';
import { AssetDTO } from '../../../models/asset';
import Meter from '../../../models/meter';
import { RootStackScreenProps } from '../../../types';
import { IconWithLabel } from '../../../components/IconWithLabel';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { useAppTheme } from '../../../custom-theme';

const MeterCard = ({
  meter,
  navigation
}: {
  meter: Meter;
  navigation: RootStackScreenProps<'AssetDetails'>['navigation'];
}) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { getFormattedDate } = useContext(CompanySettingsContext);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.push('MeterDetails', {
          id: meter.id,
          meterProp: meter
        })
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            {meter.image ? (
              <Avatar.Image size={48} source={{ uri: meter.image.url }} />
            ) : (
              <Avatar.Icon
                size={48}
                icon="gauge"
                color="white"
                style={{ backgroundColor: theme.colors.background }}
              />
            )}
            <View style={styles.content}>
              <Text variant="titleMedium" style={styles.title}>
                {meter.name}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.grey }}>
                {meter.unit}
              </Text>
              <View style={styles.meta}>
                {!!meter.lastReading && (
                  <IconWithLabel
                    icon="history"
                    label={`${t('last_reading')}: ${meter.lastReading} ${
                      meter.unit
                    }`}
                    color={theme.colors.grey}
                  />
                )}
                {!!meter.nextReading && (
                  <IconWithLabel
                    icon="calendar-clock"
                    label={`${t('next_reading_due')}: ${getFormattedDate(
                      meter.nextReading,
                      true
                    )}`}
                    color={theme.colors.grey}
                  />
                )}
                <IconWithLabel
                  icon="repeat"
                  label={t('every_frequency_days', {
                    frequency: meter.updateFrequency
                  })}
                  color={theme.colors.grey}
                />
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

export default function AssetMeters({
  asset,
  navigation
}: {
  asset: AssetDTO;
  navigation: RootStackScreenProps<'AssetDetails'>['navigation'];
}) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const dispatch = useDispatch();
  const { metersByAsset, loadingGet } = useSelector((state) => state.meters);
  const meters = metersByAsset[asset.id] ?? [];

  const loadMeters = () => {
    dispatch(getMetersByAsset(asset.id));
  };

  useEffect(() => {
    loadMeters();
  }, [asset.id]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={loadingGet}
          onRefresh={loadMeters}
          colors={[theme.colors.primary]}
        />
      }
    >
      <View style={styles.summary}>
        <Text variant="titleLarge" style={styles.summaryTitle}>
          {t('asset_meters')}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.grey }}>
          {t('asset_meters_description')}
        </Text>
      </View>
      {meters.length ? (
        meters.map((meter) => (
          <MeterCard key={meter.id} meter={meter} navigation={navigation} />
        ))
      ) : (
        <View style={styles.empty}>
          <Text>{t('no_meters_linked_asset')}</Text>
          <Button compact mode="text" onPress={loadMeters}>
            {t('refresh')}
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 100
  },
  summary: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'white',
    marginBottom: 8
  },
  summaryTitle: {
    fontWeight: 'bold'
  },
  card: {
    marginVertical: 6
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'transparent'
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  title: {
    fontWeight: 'bold'
  },
  meta: {
    gap: 8,
    marginTop: 8,
    backgroundColor: 'transparent'
  },
  empty: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center'
  }
});
