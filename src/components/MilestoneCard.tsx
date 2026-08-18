import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { Card } from './Card';
import { colors, spacing, radius } from '../theme';
import { Milestone } from '../api';

interface MilestoneCardProps {
  milestone: Milestone;
  onPress?: () => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onPress }) => {
  // Format the date to something like "Oct 15, 2024"
  const dateObj = new Date(milestone.occurred_at);
  const dateString = dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <View style={styles.container}>
      {/* Connector Line and Marker */}
      <View style={styles.timelineColumn}>
        <View style={styles.connector} />
        <View style={styles.marker} />
      </View>

      {/* Content */}
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.contentColumn}>
        <Typography variant="label" color={colors.primary} style={styles.date}>
          {dateString}
        </Typography>
        
        <Card style={styles.card}>
          <Typography variant="h3" style={styles.title}>{milestone.title}</Typography>
          {milestone.description ? (
            <Typography variant="body" color={colors.textSecondary} style={styles.description}>
              {milestone.description}
            </Typography>
          ) : null}
          
          {/* Photos indicators could go here */}
          {milestone.memories && milestone.memories.length > 0 && (
            <Typography variant="caption" color={colors.primary} style={styles.memoryCount}>
              {milestone.memories.length} Memories
            </Typography>
          )}
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  timelineColumn: {
    width: 40,
    alignItems: 'center',
  },
  connector: {
    position: 'absolute',
    top: 24, // Start slightly below the top so it doesn't poke out above the first item
    bottom: -spacing.xl, // Extend to the next item
    width: 2,
    backgroundColor: colors.border,
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginTop: 4, // Align with the date text visually
    borderWidth: 3,
    borderColor: colors.background,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  date: {
    marginBottom: spacing.xs,
  },
  card: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginTop: spacing.xs,
  },
  memoryCount: {
    marginTop: spacing.md,
    fontWeight: '600',
  }
});
