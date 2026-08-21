import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '../components/Typography';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { colors, spacing, radius } from '../theme';
import { apiClient, fixLocalhostUrl } from '../api/client';

const MAX_DATE = new Date();

export const AddMilestoneScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setSelectedImages([...selectedImages, ...result.assets].slice(0, 5)); // Cap at 5 images for MVP
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(selectedImages.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Info', 'Please enter a title for this milestone.');
      return;
    }

    try {
      setLoading(true);
      const journeyId = await AsyncStorage.getItem('journey_id');
      if (!journeyId) throw new Error('Journey not found');

      // 1. Create Milestone
      const msResponse = await apiClient.post('/milestones', {
        journey_id: journeyId,
        title: title,
        occurred_at: date.toISOString(),
      });
      const milestoneId = msResponse.data.id;

      // 2. Create Memory (if description or images exist)
      if (description.trim() || selectedImages.length > 0) {
        const memResponse = await apiClient.post('/memories', {
          milestone_id: milestoneId,
          title: 'Memory', // Default title for MVP unified form
          description: description,
          occurred_at: date.toISOString(),
        });
        const memoryId = memResponse.data.id;

        // 3. Upload Media to MinIO & Save to Database
        for (const asset of selectedImages) {
          const uri = asset.uri;
          // Extract extension and set mimeType
          const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = asset.mimeType || (extension === 'png' ? 'image/png' : 'image/jpeg');
          const fileName = asset.fileName || `photo_${Date.now()}.${extension}`;
          
          // Get Presigned URL from Backend
          const presignedRes = await apiClient.post('/storage/presigned-url', {
            mimeType,
            extension,
          });
          const { uploadUrl, storageKey } = presignedRes.data;

          // Fetch the local file as a Blob
          const fileResp = await fetch(uri);
          const blob = await fileResp.blob();

          // Fix localhost for Android emulator
          const finalUploadUrl = fixLocalhostUrl(uploadUrl);

          // Upload directly to MinIO using the presigned URL
          await fetch(finalUploadUrl, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': mimeType,
            },
          });

          // Save the storageKey to the database with required metadata
          await apiClient.post('/media', {
            memory_id: memoryId,
            type: 'IMAGE',
            storage_key: storageKey,
            mime_type: mimeType,
            file_name: fileName,
            file_size: asset.fileSize || blob.size || 0,
            width: asset.width,
            height: asset.height,
          });
        }
      }

      navigation.goBack();
    } catch (error: any) {
      let errorMessage = 'Failed to save milestone';
      if (error.response?.data?.message) {
        errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ') 
          : error.response.data.message;
      }
      Alert.alert('Error', errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Typography variant="h3">New Milestone</Typography>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <TextField
            label="What happened?"
            placeholder="e.g. First Steps, First Word"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="sentences"
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
            label="The Story (Optional)"
            placeholder="Write about this moment..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* Photo Picker */}
          <Typography variant="label" style={styles.photoLabel}>Photos</Typography>
          <View style={styles.photoGrid}>
            {selectedImages.map((asset, index) => (
              <View key={index} style={styles.thumbnailContainer}>
                <Image source={{ uri: asset.uri }} style={styles.thumbnail} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <X color={colors.white} size={14} />
                </TouchableOpacity>
              </View>
            ))}
            
            {selectedImages.length < 5 && (
              <TouchableOpacity style={styles.addButton} onPress={handlePickImage}>
                <ImageIcon color={colors.primary} size={24} />
                <Typography variant="caption" color={colors.primary} style={{ marginTop: 4 }}>Add</Typography>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Button 
          title="Save Milestone" 
          onPress={handleSave} 
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  form: {
    padding: spacing.lg,
  },
  datePickerContainer: {
    marginBottom: spacing.md,
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.full,
    padding: 4,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }
});
