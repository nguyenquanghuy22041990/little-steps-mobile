import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus } from 'lucide-react-native';
import { Typography } from '../components/Typography';
import { Timeline } from '../components/Timeline';
import { colors, spacing, radius, elevation } from '../theme';
import { 
  getJourneys, 
  getChildren, 
  getMilestones, 
  Journey, 
  Child, 
  Milestone 
} from '../api';

export const HomeScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [journeyTitle, setJourneyTitle] = useState<string>('Our Journey');
  const [child, setChild] = useState<Child | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Read local journey_id
      const journeyId = await AsyncStorage.getItem('journey_id');
      
      if (!journeyId) {
        navigation.replace('Onboarding');
        return;
      }

      // Fetch Child info
      const children = await getChildren(journeyId);
      if (children.length > 0) {
        setChild(children[0]);
        setJourneyTitle(`${children[0].name}'s Journey`);
      }

      // Fetch Milestones
      const fetchedMilestones = await getMilestones(journeyId);
      setMilestones(fetchedMilestones);
      
    } catch (error) {
      console.error('Error fetching timeline data', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const calculateAge = (birthdayString: string) => {
    const birthDate = new Date(birthdayString);
    const today = new Date();
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += today.getMonth();
    
    if (months < 1) return 'Newborn';
    if (months < 12) return `${months} months old`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} years old`;
    return `${years} yrs ${remainingMonths} mos`;
  };

  if (loading && !child) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Pattern Overlay Background */}
      <View style={styles.patternBackground} />
      
      {/* Header Area */}
      <View style={styles.header}>
        <Typography variant="h1" color={colors.primary}>
          {journeyTitle}
        </Typography>
        {child && (
          <Typography variant="label" color={colors.textSecondary} style={styles.age}>
            {calculateAge(child.birthday)}
          </Typography>
        )}
      </View>

      {/* Timeline List */}
      <View style={styles.timelineWrapper}>
        <Timeline 
          milestones={milestones}
          onPressMilestone={(m) => navigation.navigate('MilestoneDetail', { milestone: m })}
        />
      </View>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddMilestone')}
      >
        <Plus color={colors.white} size={28} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  patternBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    opacity: 0.05,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(250, 250, 249, 0.9)', // Translucent background to blend
    zIndex: 10,
  },
  age: {
    marginTop: spacing.xs,
  },
  timelineWrapper: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.lg,
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.md,
  }
});
