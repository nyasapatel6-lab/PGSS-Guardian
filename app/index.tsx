import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('pgss_u').then((saved) => {
      if (saved) {
        router.replace('/(tabs)/connect');
      } else {
        router.replace('/onboarding');
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={COLORS.accent2} size="large" />
    </View>
  );
}
