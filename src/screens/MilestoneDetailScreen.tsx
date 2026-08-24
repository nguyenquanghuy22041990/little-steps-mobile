import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { ArrowLeft, Pencil, Trash2, PlayCircle } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Typography } from '../components/Typography';
import { colors, spacing, radius } from '../theme';
import { getStorageUrl } from '../api/client';
import { Milestone, deleteMilestone } from '../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MediaItem = ({ media }: { media: any }) => {
  const source = getStorageUrl(media.storage_key);
  
  if (media.type === 'VIDEO') {
    const player = useVideoPlayer(source, player => {
      player.loop = true;
      player.play();
    });

    return (
      <VideoView 
        player={player} 
        style={styles.photo} 
        nativeControls={true}
        allowsPictureInPicture
      />
    );
  }

  return (
    <Image source={{ uri: source }} style={styles.photo} resizeMode="cover" />
  );
};

export const MilestoneDetailScreen = ({ route, navigation }: any) => {
  const { milestone } = route.params as { milestone: Milestone };
  const insets = useSafeAreaInsets();

  const dateObj = new Date(milestone.occurred_at);
  const dateString = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const description = milestone.description 
    || (milestone.memories && milestone.memories.length > 0 ? milestone.memories[0].description : null);

  const mediaList = milestone.memories && milestone.memories.length > 0 && milestone.memories[0].media
    ? milestone.memories[0].media
    : [];

  const handleEdit = () => {
    navigation.navigate('EditMilestone', { milestone });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this memory? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMilestone(milestone.id);
              navigation.goBack(); // Return to Timeline, which will auto-refresh via useFocusEffect
            } catch (error) {
              Alert.alert('Error', 'Failed to delete milestone. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.lg) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>Detail</Typography>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Pencil color={colors.textPrimary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Trash2 color={colors.error} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <Typography variant="h1" color={colors.primary} style={styles.title}>
          {milestone.title}
        </Typography>
        
        <Typography variant="label" color={colors.textSecondary} style={styles.date}>
          {dateString}
        </Typography>

        {description ? (
          <Typography variant="body" style={styles.description}>
            {description}
          </Typography>
        ) : null}

        {/* Media */}
        {mediaList.length > 0 && (
          <View style={styles.photoContainer}>
            {mediaList.map((media: any) => (
              <MediaItem key={media.id} media={media} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  date: {
    marginBottom: spacing.xl,
  },
  description: {
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  photoContainer: {
    gap: spacing.lg,
  },
  photo: {
    width: width - spacing.lg * 2,
    height: (width - spacing.lg * 2) * 1.2, // Taller aspect ratio for nice display
    borderRadius: radius.md,
  }
});
