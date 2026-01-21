import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { useEffect, useRef } from "react";

// 🎨 ألوان Linoo الترابية
const COLORS = {
  background: '#FFF9EE',
  card: '#FFFFFF',
  primary: '#7FA896',
  primarySoft: '#E8F5F2',
  secondary: '#D9956C',
  accent: '#E8C68E',
  sage: '#B5C9B4',
  textMain: '#2D3436',
  textSub: '#636E72',
};

export default function WelcomeScreen({ navigation }) {
  // ✨ Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1️⃣ Logo entrance
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      
      // 2️⃣ Content fade & slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // 3️⃣ Button entrance
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: "💬",
      title: "التواصل السهل",
      desc: "لوحة AAC بسيطة وواضحة مع أصوات طبيعية",
      color: COLORS.primary,
    },
    {
      icon: "📚",
      title: "قصص تفاعلية",
      desc: "تعلم ممتع مع الصوت والصور المتحركة",
      color: COLORS.secondary,
    },
    {
      icon: "⭐",
      title: "نظام المكافآت",
      desc: "نجوم وإنجازات لتحفيز طفلك",
      color: COLORS.accent,
    },
    {
      icon: "🎯",
      title: "تخصيص كامل",
      desc: "كلمات وصور خاصة بطفلك",
      color: COLORS.sage,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🦁 Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={styles.logoCircle}>
            <Text style={styles.welcomeTitle}>أهلاً بك في </Text>

              <Image 
                source={require("../../assets/Welcome.png")} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
        
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.welcomeSubtitle}>
              رفيق طفلك في رحلة التواصل والتعلم 🌟
            </Text>
          </Animated.View>
        </View>

        {/* ✨ Features Grid */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.sectionTitle}>✨ ماذا يقدم التطبيق؟</Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 50 + index * 10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: feature.color + '20' },
                  ]}
                >
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* 🎈 Age Info Card */}
        <Animated.View
          style={[
            styles.ageCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.ageEmoji}>👶👧</Text>
          <Text style={styles.ageText}>مناسب للأطفال من عمر 2 إلى 8 سنوات</Text>
        </Animated.View>

        {/* 🚀 Start Button */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale }],
          }}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.replace("ChildInfo")}
            activeOpacity={0.9}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.startIcon}>🚀</Text>
              <Text style={styles.startText}>لنبدأ الرحلة</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>←</Text>
            </View>
          </TouchableOpacity>

          {/* Footer text */}
          <Text style={styles.footerText}>
            رحلة التواصل والتعلم تبدأ الآن ✨
          </Text>
        </Animated.View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    paddingBottom: 40,
  },

  /* 🦁 Hero Section */
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    position: 'relative',
  },
  logoImage: {
    width: 250,
    height: 250,
    marginBottom: -52,
    marginTop: -60,

  },
  logoEmoji: {
    fontSize: 70,
  },
  starDecor: {
    position: 'absolute',
    top: -10,
    right: -10,
    flexDirection: 'row',
    gap: 4,
  },
  miniStar: {
    fontSize: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 24,
  },

  /* 💡 About Card */
  aboutCard: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSub,
  },

  /* ✨ Features Section */
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 170,
    justifyContent: 'space-between',
  },
  featureIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 38,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 13,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* 🎈 Age Card */
  ageCard: {
    backgroundColor: COLORS.accent + '30',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  ageEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  ageText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMain,
    flex: 1,
  },

  /* 🚀 Start Button */
  startButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  startText: {
    color: COLORS.card,
    fontSize: 22,
    fontWeight: '800',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: COLORS.card,
    fontSize: 24,
    fontWeight: 'bold',
  },

  /* 📝 Footer */
  footerText: {
    fontSize: 15,
    color: COLORS.textSub,
    textAlign: 'center',
    marginBottom: 8,
  },

  /* Spacing */
  bottomSpacer: {
    height: 20,
  },
});