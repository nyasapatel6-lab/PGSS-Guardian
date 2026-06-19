import { Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bg2,
          borderTopColor: COLORS.border2,
          borderTopWidth: 0.5,
          height: 68,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: COLORS.accent2,
        tabBarInactiveTintColor: COLORS.text3,
        tabBarLabelStyle: { fontSize: 10, letterSpacing: 0.3 },
      }}
    >
      <Tabs.Screen
        name="connect"
        options={{ title: 'Connect', tabBarIcon: ({ color }) => <TabIcon emoji="📡" color={color} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Account', tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, opacity: color === COLORS.accent2 ? 1 : 0.5 }}>{emoji}</Text>;
}
