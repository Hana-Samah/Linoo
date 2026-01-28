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
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef } from "react";
import { COLORS } from "../styles/colors";

const icons = {
  communication: require("../../assets/words-icon.webp"),
  stories: require("../../assets/stories.webp"),
  rewards: require("../../assets/lion/lion_8.webp"),
  customize: require("../../assets/profile-icon.webp"),
};

export default function WelcomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const isSmallScreen = width < 375;

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
      iconKey: "communication",
      title: "التواصل السهل",
      desc: "لوحة AAC بسيطة وواضحة مع أصوات طبيعية",
      color: COLORS.primary.green,
    },
    {
      iconKey: "stories",
      title: "قصص تفاعلية",
      desc: "تعلم ممتع مع الصوت والصور المتحركة",
      color: COLORS.secondary.orange,
    },
    {
      iconKey: "rewards",
      title: "نظام المكافآت",
      desc: "نجوم وإنجازات لتحفيز طفلك",
      color: COLORS.secondary.yellow,
    },
    {
      iconKey: "customize",
      title: "تخصيص كامل",
      desc: "كلمات وصور خاصة بطفلك",
      color: COLORS.primary.teal,
    },
  ];

  // حساب عرض المربعات بشكل ديناميكي
  const getCardWidth = () => {
    const horizontalPadding = isPortrait ? 32 : 48;
    const gap = isPortrait ? 12 : 16;
    const availableWidth = width - horizontalPadding;
    
    if (isPortrait) {
      return (availableWidth - gap) / 2;
    } else {
      return (availableWidth - (gap * 3)) / 4;
    }
  };

  const cardWidth = getCardWidth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: isPortrait ? 16 : 24,
            paddingTop: isPortrait ? 16 : 12,
            paddingBottom: isPortrait ? 32 : 24,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 🎨 خلفية ترابية */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.floatingShape, styles.shape1]} />
          <View style={[styles.floatingShape, styles.shape2]} />
          <View style={[styles.floatingShape, styles.shape3]} />
          <View style={[styles.floatingShape, styles.shape4]} />
        </View>

        {/* 🦁 Hero Section */}
        <View style={[styles.heroSection, { marginBottom: isPortrait ? 24 : 16 }]}>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={styles.logoCircle}>
              <Text style={[
                styles.welcomeTitle,
                {
                  fontSize: isSmallScreen ? 24 : (isPortrait ? 28 : 24),
                  marginBottom: isPortrait ? 4 : 2,
                }
              ]}>
                أهلاً بك في
              </Text>
              <Image 
                source={require("../../assets/Welcome.webp")} 
                style={{
                  width: isSmallScreen ? 180 : (isPortrait ? 220 : 180),
                  height: isSmallScreen ? 180 : (isPortrait ? 220 : 180),
                  marginBottom: isPortrait ? -45 : -35,
                  marginTop: isPortrait ? -60 : -45,
                }}
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
            <Text style={[
              styles.welcomeSubtitle,
              {
                fontSize: isSmallScreen ? 14 : (isPortrait ? 16 : 14),
                paddingHorizontal: isPortrait ? 16 : 40,
              }
            ]}>
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
          <Text style={[
            styles.sectionTitle,
            {
              fontSize: isSmallScreen ? 20 : (isPortrait ? 22 : 20),
              marginBottom: isPortrait ? 16 : 12,
            }
          ]}>
            ✨ ماذا يقدم التطبيق؟
          </Text>
          
          <View style={[
            styles.featuresGrid,
            {
              gap: isPortrait ? 12 : 16,
              marginBottom: isPortrait ? 24 : 16,
            }
          ]}>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureCard,
                  {
                    width: cardWidth,
                    padding: isSmallScreen ? 12 : (isPortrait ? 16 : 14),
                    borderRadius: isPortrait ? 20 : 18,
                    minHeight: isPortrait ? (isSmallScreen ? 160 : 170) : 140,
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
                    {
                      width: isPortrait ? 60 : 50,
                      height: isPortrait ? 60 : 50,
                      marginBottom: isPortrait ? 10 : 8,
                      backgroundColor: feature.color,
                    }
                  ]}
                >
                  <Image 
                    source={icons[feature.iconKey]} 
                    style={{
                      width: isPortrait ? 58 : 48,
                      height: isPortrait ? 58 : 48,
                      tintColor: COLORS.neutral.white,
                    }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.featureTitle,
                  { fontSize: isSmallScreen ? 14 : (isPortrait ? 16 : 14) }
                ]}>
                  {feature.title}
                </Text>
                <Text style={[
                  styles.featureDesc,
                  {
                    fontSize: isSmallScreen ? 11 : (isPortrait ? 12 : 11),
                    lineHeight: isPortrait ? 16 : 14,
                  }
                ]}>
                  {feature.desc}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* 🎈 Age Info Card */}
        <Animated.View
          style={[
            styles.ageCard,
            {
              marginBottom: isPortrait ? 24 : 16,
              padding: isPortrait ? 16 : 14,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[
            styles.ageText,
            { fontSize: isSmallScreen ? 14 : (isPortrait ? 16 : 15) }
          ]}>
            مناسب للأطفال من عمر 1 إلى 5 سنوات
          </Text>
        </Animated.View>

        {/* 🚀 Start Button */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale }],
          }}
        >
          <TouchableOpacity
            style={[
              styles.startButton,
              {
                paddingVertical: isPortrait ? 18 : 16,
                paddingHorizontal: isPortrait ? 24 : 32,
                marginBottom: isPortrait ? 12 : 8,
              }
            ]}
            onPress={() => navigation.replace("ChildInfo")}
            activeOpacity={0.85}
          >
            <View style={styles.buttonContent}>
              <Text style={[
                styles.startText,
                { fontSize: isSmallScreen ? 20 : (isPortrait ? 22 : 20) }
              ]}>
                لنبدأ الرحلة
              </Text>
            </View>
          </TouchableOpacity>

          {/* Footer text */}
          <Text style={[
            styles.footerText,
            { fontSize: isSmallScreen ? 13 : (isPortrait ? 15 : 14) }
          ]}>
            رحلة التواصل والتعلم تبدأ الآن ✨
          </Text>
        </Animated.View>
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
    flexGrow: 1,
  },

  /* 🎨 خلفية ترابية */
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  floatingShape: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.08,
  },
  shape1: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.primary.green,
    top: -50,
    right: -60,
  },
  shape2: {
    width: 150,
    height: 150,
    backgroundColor: COLORS.secondary.orange,
    bottom: -40,
    left: -50,
  },
  shape3: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.primary.teal,
    top: "30%",
    left: -30,
  },
  shape4: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.secondary.peach,
    bottom: "25%",
    right: -20,
  },

  /* 🦁 Hero Section */
  heroSection: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    position: 'relative',
  },
  logoCircle: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontWeight: '900',
    color: COLORS.primary.green,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontWeight: '600',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  /* ✨ Features Section */
  sectionTitle: {
    fontWeight: '900',
    color: COLORS.secondary.orange,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: COLORS.neutral.white,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'space-between',
    borderWidth: 3,
    borderColor: COLORS.neutral.cream,
  },
  featureIconContainer: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  featureTitle: {
    fontWeight: '900',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDesc: {
    fontWeight: '600',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  /* 🎈 Age Card */
  ageCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.secondary.yellow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  ageText: {
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
  },

  /* 🚀 Start Button */
  startButton: {
    backgroundColor: COLORS.primary.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    shadowColor: COLORS.primary.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: COLORS.neutral.white,
    fontWeight: '900',
  },

  /* 📝 Footer */
  footerText: {
    fontWeight: '600',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});