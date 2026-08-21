import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Typography } from '../components/Typography';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { colors, spacing } from '../theme';
import { createJourney, createChild } from '../api';

export const OnboardingScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (text: string) => {
    // Only allow letters (including accented characters) and spaces
    const formatted = text.replace(/[^a-zA-ZÀ-ỹ\s]/g, '');
    setName(formatted);
  };

  const handleBirthdayChange = (text: string) => {
    // Strip non-digits
    let cleaned = text.replace(/\D/g, '');
    
    // Auto-format to YYYY-MM-DD
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = cleaned.substring(0, 4) + '-' + cleaned.substring(4);
    }
    if (cleaned.length > 6) {
      formatted = formatted.substring(0, 7) + '-' + cleaned.substring(6, 8);
    }
    
    setBirthday(formatted);
  };

  const handleStart = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter your child\'s name.');
      return;
    }
    
    // Simple basic validation for YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthday)) {
      Alert.alert('Invalid Format', 'Please enter birthday in YYYY-MM-DD format.');
      return;
    }

    try {
      setLoading(true);
      // 1. Create a Journey
      const journey = await createJourney(`${name}'s Journey`);
      // 2. Create the Child profile
      await createChild(journey.id, name, birthday);
      
      // Save journey_id locally
      await AsyncStorage.setItem('journey_id', journey.id);
      
      // Navigate to Home timeline
      navigation.replace('Home');
    } catch (error: any) {
      let errorMessage = 'Could not save profile. Please ensure the backend is running.';
      console.log("ERROR: ", error);
      if (error.response?.data?.message) {
        errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ') 
          : error.response.data.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Typography variant="display" color={colors.primary} style={styles.title}>
          LittleSteps
        </Typography>
        <Typography variant="h2" style={styles.subtitle}>
          Start preserving your little one's best memories.
        </Typography>

        <View style={styles.form}>
          <TextField
            label="Child's Name"
            placeholder="E.g., Leo"
            value={name}
            onChangeText={handleNameChange}
            autoCapitalize="words"
          />
          
          <TextField
            label="Birthday (YYYY-MM-DD)"
            placeholder="E.g., 2024-10-15"
            value={birthday}
            onChangeText={handleBirthdayChange}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Start Journey" 
          onPress={handleStart} 
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xxxl,
  },
  form: {
    gap: spacing.md,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
  }
});
