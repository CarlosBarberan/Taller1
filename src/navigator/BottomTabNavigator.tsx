import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GameScreen } from '../screens/GameScreen';
import { ScoreScreen } from '../screens/ScoreScreen';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        headerShown: false, // Ocultar headers ya que cada pantalla tiene el suyo
      }}
    >
      <Tab.Screen
        name="GameTab"
        component={GameScreen}
        options={{
          tabBarLabel: 'Jugar',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ fontSize: size, color }}>
              🎮
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="ScoresTab"
        component={ScoreScreen}
        options={{
          tabBarLabel: 'Puntuaciones',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ fontSize: size, color }}>
              🏆
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 