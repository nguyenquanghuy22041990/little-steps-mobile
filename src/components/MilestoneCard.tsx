import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Typography } from './Typography';
import { Card } from './Card';
import { colors, spacing, radius } from '../theme';
import { Milestone } from '../api';
import { getStorageUrl } from '../api/client';

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
      <View style={styles.contentColumn}>
        <Typography variant="label" color={colors.primary} style={styles.date}>
          {dateString}
        </Typography>
        
        <Card style={styles.card}>
          <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            <Typography variant="h3" style={styles.title}>{milestone.title}</Typography>
            {milestone.description ? (
              <Typography variant="body" color={colors.textSecondary} style={styles.description}>
                {milestone.description}
              </Typography>
            ) : (milestone.memories && milestone.memories.length > 0 && milestone.memories[0].description) ? (
              <Typography variant="body" color={colors.textSecondary} style={styles.description}>
                {milestone.memories[0].description}
              </Typography>
            ) : null}
          </TouchableOpacity>
          
          {/* Photos Carousel */}
          {milestone.memories && milestone.memories.length > 0 && milestone.memories[0].media && milestone.memories[0].media.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.photoCarousel}
              contentContainerStyle={styles.photoCarouselContent}
              snapToInterval={260} // Width + gap
              decelerationRate="fast"
            >
              {milestone.memories[0].media.map((mediaItem) => (
                <TouchableOpacity 
                  key={mediaItem.id} 
                  style={styles.photoWrapper}
                  activeOpacity={0.9}
                  onPress={onPress}
                >
                  <Image 
                    source={{ uri: getStorageUrl(mediaItem.storage_key) }} 
                    style={[
                      styles.photo, 
                      milestone.memories![0].media!.length === 1 ? styles.photoSingle : styles.photoMultiple
                    ]} 
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Memories indicator fallback */}
          {milestone.memories && milestone.memories.length > 0 && (!milestone.memories[0].media || milestone.memories[0].media.length === 0) && (
            <Typography variant="caption" color={colors.primary} style={styles.memoryCount}>
              {milestone.memories.length} Memories
            </Typography>
          )}
        </Card>
      </View>
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
  },
  photoCarousel: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.md, // Bleed to edges of card
  },
  photoCarouselContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  photoWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  photo: {
    height: 180,
  },
  photoSingle: {
    width: 250, // Better aspect ratio for single image
  },
  photoMultiple: {
    width: 250, // Slightly cropped to hint at horizontal scrolling
  }
});
