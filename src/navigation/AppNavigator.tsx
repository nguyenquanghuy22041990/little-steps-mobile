import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AddMilestoneScreen } from '../screens/AddMilestoneScreen';
import { MilestoneDetailScreen } from '../screens/MilestoneDetailScreen';
import { EditMilestoneScreen } from '../screens/EditMilestoneScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const journeyId = await AsyncStorage.getItem('journey_id');
        if (journeyId) {
          setInitialRoute('Home');
        } else {
          // Fallback: Check backend if profile already exists (useful if app data was cleared or testing)
          try {
            const { apiClient } = require('../api/client');
            const response = await apiClient.get('/journeys');
            if (response.data && response.data.length > 0) {
              await AsyncStorage.setItem('journey_id', response.data[0].id);
              setInitialRoute('Home');
            } else {
              setInitialRoute('Onboarding');
            }
          } catch (apiError) {
            setInitialRoute('Onboarding');
          }
        }
      } catch (e) {
        setInitialRoute('Onboarding');
      }
    };
    checkUser();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute as any}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'LittleSteps' }}
        />
        <Stack.Screen 
          name="AddMilestone" 
          component={AddMilestoneScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MilestoneDetail" 
          component={MilestoneDetailScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EditMilestone" 
          component={EditMilestoneScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
