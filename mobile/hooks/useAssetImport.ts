import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import api from '../utils/api';
import { getApiUrl } from '../config';
import { AssetImportDTO, ImportResponse } from '../models/imports';

const createUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

export default function useAssetImport() {
  const [loadingImport, setLoadingImport] = useState(false);

  const importAssets = async (
    payload: AssetImportDTO[]
  ): Promise<ImportResponse> => {
    setLoadingImport(true);
    const uuid = createUuid();
    const currentApiUrl = await getApiUrl();
    const accessToken = await AsyncStorage.getItem('accessToken');

    return new Promise((resolve, reject) => {
      const socket = new SockJS(`${currentApiUrl}ws`);
      const client = Stomp.over(socket);
      client.debug = () => {};

      const timeout = setTimeout(() => {
        client.disconnect();
        setLoadingImport(false);
        reject(new Error('Import timed out'));
      }, 90000);

      const cleanup = () => {
        clearTimeout(timeout);
        setLoadingImport(false);
        try {
          client.disconnect();
        } catch (err) {
          // Ignore disconnect errors after the import result is received.
        }
      };

      client.connect(
        { token: accessToken },
        () => {
          const subscription = client.subscribe(
            `/imports/${uuid}`,
            (message) => {
              try {
                if (message.body?.includes('error:')) {
                  reject(new Error(message.body.replace('error: ', '')));
                  return;
                }
                resolve(JSON.parse(message.body) as ImportResponse);
              } catch (err) {
                reject(err);
              } finally {
                subscription.unsubscribe();
                cleanup();
              }
            }
          );

          api
            .post(`import/assets?uuid=${uuid}`, payload, {}, true)
            .catch((err) => {
              subscription.unsubscribe();
              cleanup();
              reject(err);
            });
        },
        (error) => {
          cleanup();
          reject(error);
        }
      );
    });
  };

  return { importAssets, loadingImport };
}
