import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg }, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="guardian" />
      <Stack.Screen name="health" />
    </Stack>
  );
}
