import AsyncStorage from "@react-native-async-storage/async-storage";

const CHILD_KEY = "child_info";

export const saveChildInfo = async (data) => {
  await AsyncStorage.setItem(CHILD_KEY, JSON.stringify(data));
};

export const getChildInfo = async () => {
  const data = await AsyncStorage.getItem(CHILD_KEY);
  return data ? JSON.parse(data) : null;
};
