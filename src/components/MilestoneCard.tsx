import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { PlayCircle } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Typography } from './Typography';
import { Card } from './Card';
import { colors, spacing, radius } from '../theme';
import { Milestone } from '../api';
import { getStorageUrl } from '../api/client';
import { useNavigation } from '@react-navigation/native';

interface MilestoneCardProps {
  milestone: Milestone;
  onPress?: () => void;
}

const MilestoneMediaItem = ({ mediaItem, onPress, isSingle }: { mediaItem: any, onPress?: () => void, isSingle: boolean }) => {
  const source = getStorageUrl(mediaItem.storage_key);
  const isVideo = mediaItem.type === 'VIDEO';
  const navigation = useNavigation<any>();
  
  let player = null;
  if (isVideo) {
    player = useVideoPlayer(source, p => {
      p.loop = true;
    });
  }

  const handlePress = () => {
    if (isVideo) {
      navigation.navigate('VideoPlayer', { url: source });
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.photoWrapper}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {isVideo && player ? (
        <View style={[styles.photo, isSingle ? styles.photoSingle : styles.photoMultiple]}>
          <VideoView 
            player={player} 
            style={StyleSheet.absoluteFill} 
            nativeControls={false}
          />
          <View style={styles.playIconOverlay}>
            <PlayCircle color={colors.white} size={48} />
          </View>
        </View>
      ) : (
        <Image 
          source={{ uri: source }} 
          style={[styles.photo, isSingle ? styles.photoSingle : styles.photoMultiple]} 
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
};

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
                <MilestoneMediaItem 
                  key={mediaItem.id} 
                  mediaItem={mediaItem} 
                  onPress={onPress}
                  isSingle={milestone.memories![0].media!.length === 1}
                />
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
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  }
});
