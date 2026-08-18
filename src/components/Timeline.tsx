import React from 'react';
import { View, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { Typography } from './Typography';
import { MilestoneCard } from './MilestoneCard';
import { Milestone } from '../api';
import { colors, spacing } from '../theme';

interface TimelineProps {
  milestones: Milestone[];
  onPressMilestone?: (milestone: Milestone) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ milestones, onPressMilestone }) => {
  if (milestones.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {/* Using standard icons or illustrations later. For MVP, text is fine */}
        <Typography variant="h2" color={colors.primary} style={styles.emptyTitle}>
          No memories yet
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.emptySubtitle}>
          Start your journey by adding your little one's first milestone!
        </Typography>
      </View>
    );
  }

  return (
    <FlatList
      data={milestones}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MilestoneCard 
          milestone={item} 
          onPress={() => onPressMilestone?.(item)} 
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: 80,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  }
});
