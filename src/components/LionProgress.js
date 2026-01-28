/* =============================================
   🦁 مكون شعر الأسد - نسخة الصور الجاهزة
   9 صور PNG لمراحل نمو الشعر (0-8)
   ============================================= */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';

export default function LionProgress({ 
  progress = 0, 
  maxProgress = 8, 
  onPress,
  showLabel = true 
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // صور الأسد (9 مراحل: من 0 إلى 8)
  const lionImages = {
    0: require('../../assets/lion/lion_0.webp'),
    1: require('../../assets/lion/lion_1.webp'),
    2: require('../../assets/lion/lion_2.webp'),
    3: require('../../assets/lion/lion_3.webp'),
    4: require('../../assets/lion/lion_4.webp'),
    5: require('../../assets/lion/lion_5.webp'),
    6: require('../../assets/lion/lion_6.webp'),
    7: require('../../assets/lion/lion_7.webp'),
    8: require('../../assets/lion/lion_8.webp'),
  };

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (progress === maxProgress) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
        ])
      ).start();
    } else {
      shakeAnim.setValue(0);
    }
  }, [progress]);

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.lionContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                rotate: shakeAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ['-5deg', '0deg', '5deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Image
          source={lionImages[progress]}
          style={styles.lionImage}
          resizeMode="contain"
        />

        <View style={[
          styles.badge,
          progress === maxProgress && styles.badgeComplete
        ]}>
          <Text style={styles.badgeText}>{progress}/{maxProgress}</Text>
          {progress === maxProgress && (
            <Text style={styles.completeIcon}> 🎉</Text>
          )}
        </View>

        {progress === maxProgress && (
          <View style={styles.sparklesContainer}>
            <Text style={styles.sparkle}>✨</Text>
            <Text style={styles.sparkle}>⭐</Text>
            <Text style={styles.sparkle}>✨</Text>
          </View>
        )}
      </Animated.View>

      {showLabel && (
        <View style={styles.messageContainer}>
          <Text style={[
            styles.message,
            progress === maxProgress && styles.messageComplete
          ]}>
            {getMotivationalMessage(progress, maxProgress)}
          </Text>
        </View>
      )}

      {progress > 0 && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${(progress / maxProgress) * 100}%` }
              ]} 
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const getMotivationalMessage = (progress, max) => {
  if (progress === 0) {
    return "ابدأ يومك! 🌅";
  } else if (progress === 1) {
    return "بداية رائعة! 🌱";
  } else if (progress === 2) {
    return "ممتاز! استمر! 💪";
  } else if (progress === 3) {
    return "رائع! ربع الطريق! ⭐";
  } else if (progress === 4) {
    return "واو! نصف الطريق! 🎯";
  } else if (progress === 5) {
    return "مذهل! أكثر من النصف! 🚀";
  } else if (progress === 6) {
    return "خارق! قاربت على الانتهاء! 🔥";
  } else if (progress === 7) {
    return "لا يصدق! خصلة واحدة فقط! 🌟";
  } else if (progress === max) {
    return "🎉 مذهل! أكملت اليوم! 🎉";
  }
  return "رائع! استمر! 💪";
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  
  lionContainer: {
    width: 130,
    height: 130,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  lionImage: {
    width: 130,
    height: 130,
  },

  badge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 20,
  },
  badgeComplete: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  completeIcon: {
    fontSize: 14,
  },

  sparklesContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 5,
  },
  sparkle: {
    fontSize: 20,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  messageContainer: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  message: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A6B6F',
    textAlign: 'center',
  },
  messageComplete: {
    color: '#4CAF50',
    fontSize: 17,
  },

  progressBarContainer: {
    marginTop: 10,
    width: 120,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7FA896',
    borderRadius: 4,
  },
});