import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Platform } from 'react-native';
import { ArrowLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { colors, spacing, radius } from '../theme';
import { updateChild, Child } from '../api';
import { apiClient, getStorageUrl } from '../api/client';

export const ProfileScreen = ({ route, navigation }: any) => {
  const { child } = route.params as { child: Child };
  
  const [name, setName] = useState(child.name);
  const [date, setDate] = useState(new Date(child.birthday));
  const [avatarUri, setAvatarUri] = useState<string | null>(child.avatar_storage_key ? getStorageUrl(child.avatar_storage_key) : null);
  const [newAvatarAsset, setNewAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select an image smaller than 10MB.');
        return;
      }
      setNewAvatarAsset(asset);
      setAvatarUri(asset.uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', "Please enter your child's name.");
      return;
    }

    try {
      setLoading(true);
      let storageKey = child.avatar_storage_key;

      if (newAvatarAsset) {
        const response = await fetch(newAvatarAsset.uri);
        const blob = await response.blob();
        
        const mimeType = newAvatarAsset.mimeType || blob.type || 'image/jpeg';
        const fileName = newAvatarAsset.fileName || `avatar_${Date.now()}.jpg`;

        const presignedRes = await apiClient.post('/storage/presigned-url', {
          extension: fileName.split('.').pop() || 'jpg',
          mimeType: mimeType,
          fileSize: newAvatarAsset.fileSize || blob.size || 0,
        });
        
        const { uploadUrl, storageKey: newStorageKey } = presignedRes.data;

        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': mimeType },
          body: blob,
        });

        storageKey = newStorageKey;
      }

      const updatedChild = await updateChild(child.id, {
        name,
        birthday: date.toISOString(),
        avatar_storage_key: storageKey,
      });

      // Navigate back and pass the updated child back to Home screen?
      // Home screen uses useFocusEffect to reload, so it will fetch the updated child automatically!
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Could not update profile. Please try again.');
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
        <Typography variant="h3" style={styles.headerTitle}>Profile Settings</Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Typography variant="h1" color={colors.primary}>
                  {name.charAt(0).toUpperCase()}
                </Typography>
              </View>
            )}
            <View style={styles.cameraIconBadge}>
              <Camera color={colors.white} size={16} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <TextField
            label="Child's Name"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.datePickerContainer}>
            <Typography variant="label" style={styles.dateLabel}>Birthday</Typography>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 140, 116, 0.1)',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
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
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }
});
