import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RegisterScreen } from '../screens/RegisterScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { BottomTabNavigator } from './BottomTabNavigator';

const Stack = createStackNavigator();

export const StackNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Iniciar Sesión' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Registrarse' }}
      />
      <Stack.Screen 
        name="MainApp" 
        component={BottomTabNavigator} 
        options={{ 
          headerShown: false // Ocultar header para el Bottom Tab Navigator
        }}
      />
    </Stack.Navigator>
  );
};
