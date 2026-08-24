import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { X, ArrowLeft, ImagePlus } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '../components/Typography';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { colors, spacing, radius } from '../theme';
import { updateMilestone, updateMemory, deleteMedia, Milestone } from '../api';
import { apiClient, getStorageUrl } from '../api/client';

const FormVideoThumbnail = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(uri, p => { p.muted = true; });
  return <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls={false} />;
};

export const EditMilestoneScreen = ({ route, navigation }: any) => {
  const { milestone } = route.params as { milestone: Milestone };
  const memory = milestone.memories && milestone.memories.length > 0 ? milestone.memories[0] : null;

  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(memory?.description || '');
  const [date, setDate] = useState(new Date(milestone.occurred_at));
  
  const [existingMedia, setExistingMedia] = useState<any[]>(memory?.media || []);
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 10 - existingMedia.length - newImages.length, // Max 10 total
      quality: 0.8,
    });

    if (!result.canceled) {
      const validAssets: ImagePicker.ImagePickerAsset[] = [];
      for (const asset of result.assets) {
        const isVideo = asset.type === 'video';
        const sizeLimit = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        
        if (asset.fileSize && asset.fileSize > sizeLimit) {
          Alert.alert(
            'File too large',
            `${asset.fileName || 'A file'} exceeds the ${isVideo ? '50MB' : '10MB'} limit and was not added.`
          );
        } else {
          validAssets.push(asset);
        }
      }
      setNewImages(prev => [...prev, ...validAssets]);
    }
  };

  const handleRemoveExistingMedia = (id: string) => {
    setExistingMedia(prev => prev.filter(m => m.id !== id));
    setDeletedMediaIds(prev => [...prev, id]);
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for this milestone.');
      return;
    }

    try {
      setLoading(true);

      // 1. Update Milestone (Title & Date)
      await updateMilestone(milestone.id, {
        title,
        occurred_at: date.toISOString(),
      });

      // 2. Update Memory (Description)
      if (memory) {
        await updateMemory(memory.id, { description });
      }

      // 3. Delete removed existing media
      for (const id of deletedMediaIds) {
        await deleteMedia(id);
      }

      // 4. Upload and create new media
      if (memory && newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          const asset = newImages[i];
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          const mimeType = asset.mimeType || blob.type || 'image/jpeg';
          const fileName = asset.fileName || `upload_${Date.now()}.jpg`;

          // Get presigned URL
          const presignedRes = await apiClient.post('/storage/presigned-url', {
            extension: fileName.split('.').pop() || 'jpg',
            mimeType: mimeType,
            fileSize: asset.fileSize || blob.size || 0,
          });
          
          const { uploadUrl, storageKey } = presignedRes.data;

          // Upload to MinIO
          await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': mimeType,
            },
            body: blob,
          });

          // Save to database
          await apiClient.post('/media', {
            memory_id: memory.id,
            type: asset.type === 'video' ? 'VIDEO' : 'IMAGE',
            storage_key: storageKey,
            mime_type: mimeType,
            file_name: fileName,
            file_size: asset.fileSize || blob.size || 0,
            width: asset.width,
            height: asset.height,
          });
        }
      }

      navigation.popToTop(); // Go back to the very first screen (Timeline) directly
    } catch (error) {
      console.error('Error updating milestone:', error);
      Alert.alert('Error', 'Could not update milestone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const MAX_DATE = new Date();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.lg) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>Edit Milestone</Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>
          <TextField
            label="What happened?"
            placeholder="e.g. First steps!"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />

          <View style={styles.datePickerContainer}>
            <Typography variant="label" style={styles.dateLabel}>Date Occurred</Typography>
            {Platform.OS === 'android' ? (
              <>
                <TouchableOpacity 
                  style={styles.dateButton} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Typography>{date.toISOString().split('T')[0]}</Typography>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    maximumDate={MAX_DATE}
                    onChange={(event: any, selectedDate?: Date) => {
                      setShowDatePicker(false);
                      if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
                        setDate(selectedDate);
                      }
                    }}
                  />
                )}
              </>
            ) : (
              <View style={styles.iosDatePickerWrapper}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  maximumDate={MAX_DATE}
                  onChange={(event: any, selectedDate?: Date) => {
                    let finalDate = selectedDate;
                    if (!finalDate && event?.nativeEvent?.timestamp) {
                      finalDate = new Date(event.nativeEvent.timestamp);
                    }
                    if (finalDate instanceof Date && !isNaN(finalDate.getTime())) {
                      setDate(finalDate);
                    }
                  }}
                />
              </View>
            )}
          </View>

          <TextField
            label="The Story"
            placeholder="Write down the details you want to remember..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ height: 100 }}
          />

          <Typography variant="label" style={styles.photoLabel}>Photos</Typography>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
            <TouchableOpacity style={styles.addPhotoButton} onPress={handlePickImage}>
              <ImagePlus color={colors.primary} size={24} />
              <Typography variant="caption" color={colors.primary} style={{ marginTop: 4 }}>Add</Typography>
            </TouchableOpacity>

            {/* Existing Media */}
            {existingMedia.map((media) => (
              <View key={`existing-${media.id}`} style={[styles.imageWrapper, styles.previewImage]}>
                {media.type === 'VIDEO' ? (
                  <FormVideoThumbnail uri={getStorageUrl(media.storage_key)} />
                ) : (
                  <Image source={{ uri: getStorageUrl(media.storage_key) }} style={StyleSheet.absoluteFill} />
                )}
                <TouchableOpacity 
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveExistingMedia(media.id)}
                >
                  <X color={colors.white} size={14} />
                </TouchableOpacity>
              </View>
            ))}

            {/* New Images */}
            {newImages.map((asset, index) => (
              <View key={`new-${index}`} style={[styles.imageWrapper, styles.previewImage]}>
                {asset.type === 'video' ? (
                  <FormVideoThumbnail uri={asset.uri} />
                ) : (
                  <Image source={{ uri: asset.uri }} style={StyleSheet.absoluteFill} />
                )}
                <TouchableOpacity 
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveNewImage(index)}
                >
                  <X color={colors.white} size={14} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Button 
          title="Save Changes" 
          onPress={handleSave} 
          loading={loading}
        />
      </View>
    </View>
  );
};

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
  content: {
    flex: 1,
  },
  formSection: {
    padding: spacing.lg,
  },
  datePickerContainer: {
    marginBottom: spacing.lg,
  },
  dateLabel: {
    marginBottom: spacing.xs,
  },
  dateButton: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iosDatePickerWrapper: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  photoLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  imageList: {
    flexDirection: 'row',
    paddingBottom: spacing.md,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    backgroundColor: 'rgba(251, 140, 116, 0.05)',
  },
  imageWrapper: {
    marginRight: spacing.md,
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }
});
