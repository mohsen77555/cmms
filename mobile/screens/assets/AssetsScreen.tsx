import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet
} from 'react-native';
import { useDispatch, useSelector } from '../../store';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { getAssetChildren, getAssets, getMoreAssets } from '../../slices/asset';
import { FilterField, SearchCriteria } from '../../models/page';
import {
  Avatar,
  Button,
  Card,
  IconButton,
  Searchbar,
  Text,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import {
  AssetDTO,
  AssetRow,
  assetStatuses,
  getAssetStatusConfig
} from '../../models/asset';
import { isCloseToBottom, onSearchQueryChange } from '../../utils/overall';
import { RootStackScreenProps } from '../../types';
import Tag from '../../components/Tag';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { IconWithLabel } from '../../components/IconWithLabel';
import { useAppTheme } from '../../custom-theme';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { parseAssetImportWorkbook } from '../../utils/assetImport';
import useAssetImport from '../../hooks/useAssetImport';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { PlanFeature } from '../../models/subscriptionPlan';

const AssetCard = ({
  asset,
  navigation,
  showChildrenButton = false,
  onViewChildren
}: {
  asset: AssetDTO;
  navigation: RootStackScreenProps<'Assets'>['navigation'];
  showChildrenButton?: boolean;
  onViewChildren?: () => void;
}) => {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.push('AssetDetails', {
          id: asset.id,
          assetProp: asset
        })
      }
      key={asset.id}
    >
      <View style={styles.card}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 6
          }}
        >
          {asset.image ? (
            <Avatar.Image size={50} source={{ uri: asset.image.url }} />
          ) : (
            <Avatar.Icon
              style={{
                backgroundColor: theme.colors.background
              }}
              color={'white'}
              icon={'package-variant-closed'}
              size={50}
            />
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {asset.name}
                </Text>
                <Text
                  variant={'bodySmall'}
                  style={{ color: 'grey' }}
                >{`#${asset.customId}`}</Text>
              </View>
              <Tag
                text={t(asset?.status)}
                backgroundColor={getAssetStatusConfig(asset?.status).color(
                  theme
                )}
                color="white"
              />
            </View>
            <View style={styles.cardBody}>
              {asset.location && (
                <IconWithLabel
                  label={asset.location.name}
                  icon="map-marker-outline"
                  color={theme.colors.grey}
                />
              )}
            </View>
            {showChildrenButton && asset.hasChildren && (
              <View style={styles.cardFooter}>
                <View style={{ flex: 1 }} />
                <Button compact onPress={onViewChildren}>
                  {t('view_children')}
                </Button>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AssetsScreen({
  navigation,
  route
}: RootStackScreenProps<'Assets'>) {
  const { t } = useTranslation();
  const [startedSearch, setStartedSearch] = useState<boolean>(false);
  const { assets, assetsHierarchy, loadingGet, currentPageNum, lastPage } =
    useSelector((state) => state.assets);
  const theme = useTheme();
  const [view, setView] = useState<'hierarchy' | 'list'>('hierarchy');
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const { hasViewPermission, hasCreatePermission, hasFeature } = useAuth();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { importAssets, loadingImport } = useAssetImport();
  const defaultFilterFields: FilterField[] = [];
  const getCriteriaFromFilterFields = (filterFields: FilterField[]) => {
    const initialCriteria: SearchCriteria = {
      filterFields: defaultFilterFields,
      pageSize: 10,
      pageNum: 0,
      direction: 'DESC'
    };
    let newFilterFields = [...initialCriteria.filterFields];
    filterFields.forEach(
      (filterField) =>
        (newFilterFields = newFilterFields.filter(
          (ff) => ff.field != filterField.field
        ))
    );
    return {
      ...initialCriteria,
      filterFields: [...newFilterFields, ...filterFields]
    };
  };
  const [criteria, setCriteria] = useState<SearchCriteria>(
    getCriteriaFromFilterFields([])
  );
  useEffect(() => {
    if (hasViewPermission(PermissionEntity.ASSETS) && view === 'list') {
      dispatch(
        getAssets({ ...criteria, pageSize: 10, pageNum: 0, direction: 'DESC' })
      );
    }
  }, [criteria]);
  const [currentAssets, setCurrentAssets] = useState<AssetRow[]>([]);
  useEffect(() => {
    if (
      route.params?.id &&
      assetsHierarchy.some(
        (asset) =>
          asset.hierarchy.includes(route.params.id) &&
          asset.id !== route.params.id
      )
    ) {
      return;
    }
    dispatch(
      getAssetChildren(route.params?.id ?? 0, route.params?.hierarchy ?? [])
    );
  }, [route]);

  const onRefresh = () => {
    setCriteria(getCriteriaFromFilterFields([]));
  };

  const refreshAssets = () => {
    dispatch(
      getAssets({ ...criteria, pageSize: 10, pageNum: 0, direction: 'DESC' })
    );
    dispatch(
      getAssetChildren(route.params?.id ?? 0, route.params?.hierarchy ?? [])
    );
    setView('list');
  };

  const importAssetsFromExcel = async () => {
    if (!hasFeature(PlanFeature.IMPORT_CSV)) {
      showSnackBar(t('no_import_access'), 'error');
      return;
    }

    if (!hasCreatePermission(PermissionEntity.ASSETS)) {
      showSnackBar(t('no_access_assets'), 'error');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'text/comma-separated-values'
        ],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      const assetsToImport = parseAssetImportWorkbook(base64, file.name);

      if (!assetsToImport.length) {
        showSnackBar(t('asset_import_no_rows'), 'error');
        return;
      }

      const response = await importAssets(assetsToImport);
      showSnackBar(
        t('import_asset_success', {
          created: response.created,
          updated: response.updated
        }),
        'success'
      );
      refreshAssets();
    } catch (err) {
      showSnackBar(t('import_error'), 'error');
    }
  };

  const onQueryChange = (query) => {
    onSearchQueryChange<AssetDTO>(
      query,
      criteria,
      setCriteria,
      setSearchQuery,
      [
        'name',
        'description',
        'model',
        'additionalInfos',
        'barCode',
        'area',
        'serialNumber',
        'manufacturer',
        'power',
        'customId'
      ]
    );
    setView('list');
  };
  useDebouncedEffect(
    () => {
      if (startedSearch) onQueryChange(searchQuery);
    },
    [searchQuery],
    1000
  );

  useEffect(() => {
    let result = [];
    if (route.params?.id) {
      result = assetsHierarchy.filter((asset, index) => {
        return (
          asset.hierarchy[asset.hierarchy.length - 2] === route.params.id &&
          asset.id !== route.params.id
        );
      });
    } else
      result = assetsHierarchy.filter((asset) => asset.hierarchy.length === 1);
    setCurrentAssets(result);
  }, [assetsHierarchy]);

  const handleViewChildren = (asset) => {
    navigation.push('Assets', {
      id: asset.id,
      hierarchy: asset.hierarchy
    });
  };

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <View style={styles.searchRow}>
        <Searchbar
          placeholder={t('search')}
          onFocus={() => setStartedSearch(true)}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ flex: 1, backgroundColor: theme.colors.background }}
        />
        {hasCreatePermission(PermissionEntity.ASSETS) && (
          <IconButton
            icon="file-excel"
            mode="contained"
            loading={loadingImport}
            disabled={loadingImport}
            onPress={importAssetsFromExcel}
            accessibilityLabel={t('import_assets_from_excel')}
          />
        )}
      </View>
      {view === 'list' ? (
        <ScrollView
          style={styles.scrollView}
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              if (!loadingGet && !lastPage)
                dispatch(getMoreAssets(criteria, currentPageNum + 1));
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
          {!!assets.content.length ? (
            assets.content.map((asset) => (
              <AssetCard key={asset.id} asset={asset} navigation={navigation} />
            ))
          ) : loadingGet ? null : (
            <View
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 10
              }}
            >
              <Text variant={'titleLarge'}>
                {t('no_element_match_criteria')}
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={loadingGet}
              colors={[theme.colors.primary]}
            />
          }
        >
          {!!currentAssets.length &&
            currentAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                navigation={navigation}
                showChildrenButton={true}
                onViewChildren={() => handleViewChildren(asset)}
              />
            ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  scrollView: {
    width: '100%',
    height: '100%'
  },
  searchRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  card: {
    backgroundColor: 'white',
    marginBottom: 1,
    padding: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    flexShrink: 1
  },
  cardBody: {
    gap: 10
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  }
});
