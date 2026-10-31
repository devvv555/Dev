import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Platform,
  Vibration,
} from 'react-native';
import { ProtocolGate, ProtocolMode } from '../engines/starkProtocol/protocolGate';

interface StarkVideoModalProps {
  visible: boolean;
  onClose: () => void;
  onSuitUnlocked?: () => void;
  videoUrl?: string;
  studentName?: string;
}

// Local video asset
const LOCAL_STARK_VIDEO = '/stark_unlock.mp4';

export const StarkVideoModal: React.FC<StarkVideoModalProps> = ({
  visible,
  onClose,
  onSuitUnlocked,
  videoUrl = LOCAL_STARK_VIDEO,
}) => {
  const videoRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      try {
        Vibration.vibrate([0, 80, 100, 80]);
      } catch {}

      if (Platform.OS === 'web') {
        // Try locking screen to landscape if supported
        try {
          if (screen?.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock('landscape').catch(() => {});
          }
        } catch {}

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.play().catch(() => {});
              }
            });
          }
        }, 100);
      }
    } else {
      if (Platform.OS === 'web') {
        try {
          if (screen?.orientation && (screen.orientation as any).unlock) {
            (screen.orientation as any).unlock();
          }
        } catch {}
      }
    }
  }, [visible]);

  /**
   * Automatically unlocks Enhanced Suit and transitions into the Red & Gold app
   */
  const handleAutoUnlockSuit = async () => {
    try {
      Vibration.vibrate([0, 150, 100, 200]);
    } catch {}

    const res = await ProtocolGate.unlockSuit('STARK576');
    if (res.success) {
      if (onSuitUnlocked) {
        onSuitUnlocked();
      }
      setTimeout(() => {
        onClose();
      }, 250);
    }
  };

  /**
   * Video finishes -> automatically unlock and enter enhanced suit
   */
  const handleVideoEnded = () => {
    handleAutoUnlockSuit();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <View style={styles.fullscreenBlackout}>
        {Platform.OS === 'web' ? (
          <div
            onClick={handleAutoUnlockSuit}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <style>
              {`
                @media (orientation: portrait) {
                  .stark-landscape-video {
                    width: 100vh !important;
                    height: 100vw !important;
                    transform: rotate(90deg) !important;
                    transform-origin: center center !important;
                    object-fit: contain !important;
                  }
                }
                @media (orientation: landscape) {
                  .stark-landscape-video {
                    width: 100vw !important;
                    height: 100vh !important;
                    transform: none !important;
                    object-fit: contain !important;
                  }
                }
              `}
            </style>
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              playsInline
              controls={false}
              className="stark-landscape-video"
              onEnded={handleVideoEnded}
              style={{
                backgroundColor: '#000000',
              }}
            />
          </div>
        ) : (
          <View style={styles.fullscreenBlackout} />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullscreenBlackout: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
