import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { X, Play, Pause, FastForward, Rewind } from 'lucide-react-native';
import { colors } from '../theme';

export const VideoPlayerScreen = ({ route, navigation }: any) => {
  const { url } = route.params;
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const player = useVideoPlayer(url, p => {
    p.loop = true;
    p.play();
  });

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => player.seekBy(10);
  const skipBackward = () => player.seekBy(-10);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" hidden={Platform.OS === 'ios'} />
      <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
        <View style={styles.videoContainer}>
          <VideoView 
            player={player} 
            style={styles.video} 
            nativeControls={false}
            fullscreenOptions={{ enable: false }}
          />

          {showControls && (
            <View style={styles.controlsOverlay}>
              <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
                <Rewind color={colors.white} size={36} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButtonMain} onPress={togglePlay}>
                {isPlaying ? (
                  <Pause color={colors.white} size={48} fill={colors.white} />
                ) : (
                  <Play color={colors.white} size={48} fill={colors.white} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
                <FastForward color={colors.white} size={36} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {showControls && (
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
        >
          <X color={colors.white} size={28} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  controlButton: {
    padding: 10,
  },
  controlButtonMain: {
    padding: 10,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
