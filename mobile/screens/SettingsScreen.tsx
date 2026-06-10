import { StyleSheet } from 'react-native';
import { View } from '../components/Themed';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Dialog,
  IconButton,
  List,
  Portal,
  Text,
  useTheme
} from 'react-native-paper';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { getUserInitials } from '../utils/displayers';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { RootStackScreenProps } from '../types';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREFERRED_LANGUAGE_KEY } from '../contexts/AuthContext';

const supportedLanguages = [
  { code: 'en', label: 'English', serverCode: 'EN' },
  { code: 'ar', label: 'العربية', serverCode: 'AR' }
];

const normalizeLanguage = (language?: string) =>
  language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';

export default function SettingsScreen({
  navigation
}: RootStackScreenProps<'Settings'>) {
  const theme = useTheme();
  const {
    user,
    switchAccount,
    logout,
    companySettings,
    patchGeneralPreferences
  } = useAuth();
  const [switchingAccount, setSwitchingAccount] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const [versionPressCount, setVersionPressCount] = useState<number>(0);
  const [openLogout, setOpenLogout] = useState<boolean>(false);
  const [openDevInfo, setOpenDevInfo] = useState<boolean>(false);
  const [openLanguage, setOpenLanguage] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    normalizeLanguage(i18n.language)
  );
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [devMode, setDevMode] = useState<boolean>(false);
  useEffect(() => {
    setSelectedLanguage(normalizeLanguage(i18n.language));
  }, [i18n.language]);
  useEffect(() => {
    if (versionPressCount > 2 && versionPressCount < 6) {
      showSnackBar(`Dev mode in ${6 - versionPressCount}`, 'info');
    } else if (versionPressCount === 6) {
      setOpenDevInfo(true);
      setDevMode(true);
      setVersionPressCount(0);
    }
  }, [versionPressCount]);
  const changeLanguage = async (languageCode: string) => {
    const language = supportedLanguages.find(
      (item) => item.code === languageCode
    );
    if (!language) return;

    setOpenLanguage(false);
    setSelectedLanguage(language.code);
    await AsyncStorage.setItem(PREFERRED_LANGUAGE_KEY, language.code);
    await i18n.changeLanguage(language.code);

    if (!companySettings?.generalPreferences) {
      showSnackBar(t('language_saved'), 'success');
      return;
    }

    try {
      await patchGeneralPreferences({
        language: language.serverCode
      });
      showSnackBar(t('language_saved'), 'success');
    } catch (err) {
      showSnackBar(t('language_saved_offline'), 'info');
    }
  };
  const renderConfirmLogout = () => {
    return (
      <Portal theme={theme}>
        <Dialog visible={openLogout} onDismiss={() => setOpenLogout(false)}>
          <Dialog.Title>{t('confirmation')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('confirm_logout')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpenLogout(false)}>{t('cancel')}</Button>
            <Button onPress={logout}>{t('Sign out')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };
  const renderDevInfo = () => {
    return (
      <Portal theme={theme}>
        <Dialog visible={openDevInfo} onDismiss={() => setOpenDevInfo(false)}>
          <Dialog.Title>{t('Dev Info')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="titleMedium">{t('Build ID')}</Text>
            <Text variant="bodyMedium">{Updates.updateId}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpenDevInfo(false)}>{t('cancel')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };
  const renderLanguageDialog = () => {
    return (
      <Portal theme={theme}>
        <Dialog visible={openLanguage} onDismiss={() => setOpenLanguage(false)}>
          <Dialog.Title>{t('language')}</Dialog.Title>
          <Dialog.Content>
            {supportedLanguages.map((language) => (
              <List.Item
                key={language.code}
                title={language.label}
                onPress={() => changeLanguage(language.code)}
                right={() =>
                  selectedLanguage === language.code ? (
                    <IconButton icon={'check'} />
                  ) : null
                }
              />
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpenLanguage(false)}>
              {t('cancel')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {renderConfirmLogout()}
      {renderDevInfo()}
      {renderLanguageDialog()}
      <View>
        <List.Item
          style={{ paddingHorizontal: 20 }}
          left={(props) =>
            user.image ? (
              <Avatar.Image source={{ uri: user.image.url }} />
            ) : (
              <Avatar.Text size={50} label={getUserInitials(user)} />
            )
          }
          title={user.email}
          description={t('update_profile')}
          onPress={() => navigation.navigate('UserProfile')}
        />
        {user.parentSuperAccount && (
          <List.Item
            style={{ paddingHorizontal: 20 }}
            left={(props) => <IconButton icon={'swap-horizontal'} />}
            title={t('switch_to_super_user')}
            right={(props) => switchingAccount && <ActivityIndicator />}
            onPress={() => {
              setSwitchingAccount(true);
              switchAccount(user.parentSuperAccount.superUserId).finally(() =>
                setSwitchingAccount(false)
              );
            }}
          />
        )}
        <List.Item
          style={{ paddingHorizontal: 20 }}
          left={(props) => <IconButton icon={'translate'} />}
          title={t('language')}
          description={
            supportedLanguages.find((item) => item.code === selectedLanguage)
              ?.label
          }
          onPress={() => setOpenLanguage(true)}
        />
        <List.Item
          style={{ paddingHorizontal: 20 }}
          left={(props) => (
            <IconButton iconColor={theme.colors.error} icon={'logout'} />
          )}
          title={t('Sign out')}
          titleStyle={{ color: theme.colors.error }}
          onPress={() => setOpenLogout(true)}
        />
        <List.Item
          onPress={() => {
            if (devMode) {
              setOpenDevInfo(true);
            } else {
              setVersionPressCount((state) => state + 1);
            }
          }}
          style={{ paddingHorizontal: 20 }}
          left={(props) => <IconButton icon={'information-outline'} />}
          title={t('Version')}
          description={Constants.expoConfig.version}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
