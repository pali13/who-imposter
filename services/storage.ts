import AsyncStorage from "@react-native-async-storage/async-storage";

// Guardar un valor persistente
export const storageSet = async (key: string, value: any) => {
  const json = JSON.stringify(value);

    await AsyncStorage.setItem(key, json);
};

// Recuperar un valor persistente
export const storageGet = async (key: string) => {
  const val = await AsyncStorage.getItem(key);
  return val ? JSON.parse(val) : null;
};

// Eliminar un valor persistente
export const storageRemove = async (key: string) => {
await AsyncStorage.removeItem(key);
};

// Guardar la configuración de la sala
export const saveRoomConfig = async (roomConfig: any) => {
  await storageSet("currentRoom", roomConfig);
};

// Cargar la configuración de la sala
export const loadRoomConfig = async () => {
  return await storageGet("currentRoom");
};
