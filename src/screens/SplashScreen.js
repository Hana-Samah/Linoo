import { View, Text, StyleSheet, Animated, Easing, Image } from "react-native";
import { useEffect, useRef } from "react";
import { getChildInfo } from "../storage/childStorage";

// 🎨 ألوان Linoo الترابية
const COLORS = {
  background: '#FAF8F5',
  cream: '#F5EFE7',
  primary: '#7FA896',
  secondary: '#D9956C',
  accent: '#E8C68E',
  sage: '#B5C9B4',
};

export default function SplashScreen({ navigation }) {
  // ✨ Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  
  const titleSlide = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  
  // ⭐ Stars animations
  const star1 = useRef(new Animated.Value(0)).current;
  const star2 = useRef(new Animated.Value(0)).current;
  const star3 = useRef(new Animated.Value(0)).current;
  
  // 🎈 Floating animation
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1️⃣ Logo entrance with bounce & rotation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1.5),
          useNativeDriver: true,
        }),
      ]),
      
      // 2️⃣ Title entrance
      Animated.parallel([
        Animated.spring(titleSlide, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // 3️⃣ Subtitle fade in
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // ⭐ Stars twinkling animation
    Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(star1, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(star1, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(star2, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(star2, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(star3, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(star3, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 🎈 Floating animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 📊 Progress bar animation
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 2800,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    // 🔄 Navigation logic
    const checkChild = async () => {
      const child = await getChildInfo();
      setTimeout(() => {
        if (child) navigation.replace("Home");
        else navigation.replace("Welcome");
      }, 3000);
    };

    checkChild();
  }, []);

  // 🎨 Interpolations
  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatingTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* 🎨 Decorative circles في الخلفية */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* ⭐ Animated twinkling stars */}
      <Animated.Text style={[styles.star, styles.star1, { opacity: star1 }]}>
        ⭐
      </Animated.Text>
      <Animated.Text style={[styles.star, styles.star2, { opacity: star2 }]}>
        ⭐
      </Animated.Text>
      <Animated.Text style={[styles.star, styles.star3, { opacity: star3 }]}>
        ⭐
      </Animated.Text>

      {/* 🦁 Logo مع floating animation */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { rotate: logoRotation },
              { translateY: floatingTranslateY },
            ],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Image 
            source={require("../../assets/lion/lion_8.png")} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        {/* تأثير الإضاءة */}
        <View style={styles.glowEffect} />
      </Animated.View>

      {/* 📝 اسم التطبيق */}
      <Animated.View
        style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleSlide }],
        }}
      >
        <Text style={styles.appName}>Linoo</Text>
      </Animated.View>

      {/* 💬 العنوان الفرعي */}
      <Animated.View style={{ opacity: subtitleFade }}>
        <Text style={styles.subtitle}>رحلة التواصل والتعلم</Text>
        <Text style={styles.subtitle2}>مع أصدقائنا الصغار</Text>
      </Animated.View>

      {/* 📊 شريط التحميل المحسّن */}
      <View style={styles.loadingSection}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: progressBarWidth },
            ]}
          >
            <View style={styles.progressShine} />
          </Animated.View>
        </View>
        
        <View style={styles.loadingTextContainer}>
          <Text style={styles.loadingText}>جاري التحضير</Text>
          <Text style={styles.loadingDots}>...</Text>
        </View>
      </View>

      {/* 🎈 زخارف الأسفل */}
      <View style={styles.bottomDecor}>
        <Text style={styles.decorEmoji}>🎈</Text>
        <Text style={styles.decorEmoji}>🌟</Text>
        <Text style={styles.decorEmoji}>🎨</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  /* 🎨 دوائر زخرفية */
  circle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.accent,
    opacity: 0.06,
    top: -150,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
    bottom: -120,
    left: -80,
  },
  circle3: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.sage,
    opacity: 0.08,
    top: '50%',
    left: -50,
  },
logoImage: {
    width: 200,
    height: 200,
  },
  /* ⭐ النجوم المتلألئة */
  star: {
    position: 'absolute',
    fontSize: 24,
  },
  star1: {
    top: '20%',
    right: '15%',
  },
  star2: {
    top: '25%',
    left: '20%',
  },
  star3: {
    bottom: '30%',
    right: '25%',
  },

  /* 🦁 الشعار */
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 90,
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accent,
    opacity: 0.15,
  },

  /* 📝 النصوص */
  appName: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.secondary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle2: {
    fontSize: 18,
    color: '#7A7A7A',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 50,
  },

  /* 📊 قسم التحميل */
  loadingSection: {
    width: '70%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 24,
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#7A7A7A',
    fontWeight: '600',
  },
  loadingDots: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  /* 🎈 الزخارف السفلية */
  bottomDecor: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 20,
  },
  decorEmoji: {
    fontSize: 28,
    opacity: 0.3,
  },
});