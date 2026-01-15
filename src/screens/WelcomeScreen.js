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

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: "💬",
      title: "التواصل السهل",
      desc: "لوحة AAC بسيطة وواضحة",
      color: "#7FA896",
    },
    {
      icon: "📚",
      title: "قصص تفاعلية",
      desc: "تعلم ممتع مع الصوت",
      color: "#D9956C",
    },
    {
      icon: "⭐",
      title: "تخصيص كامل",
      desc: "كلمات وصور خاصة بطفلك",
      color: "#E8C68E",
    },
    {
      icon: "🎯",
      title: "سهل الاستخدام",
      desc: "مصمم خصيصاً للأطفال",
      color: "#B5C9B4",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* الشعار والترحيب */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image source={require("../../assets/Welcome.png")} style={{ width: 300, height: 150 }} />
            </View>
          </View>

          {/* الترحيب */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>مرحباً بك!</Text>
            <Text style={styles.welcomeText}>
              تطبيق مصمم خصيصاً لمساعدة الأطفال على التواصل والتعلم بطريقة ممتعة
            </Text>
          </View>

          {/* المميزات */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>ماذا يقدم التطبيق؟</Text>
            
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
                      { backgroundColor: feature.color + "20" },
                    ]}
                  >
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* زر البدء */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.replace("ChildInfo")}
            activeOpacity={0.9}
          >
            <Text style={styles.startText}>ابدأ الآن</Text>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>←</Text>
            </View>
          </TouchableOpacity>

          {/* نص إضافي */}
          <Text style={styles.footerText}>
            رحلة التواصل والتعلم تبدأ هنا ✨
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff9eeff",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },

  /* ====== الشعار والترحيب ====== */
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 300,
    height: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    fontSize: 60,
  },
  appName: {
    fontSize: 42,
    fontWeight: "800",
    color: "#4A6B6F",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#7A7A7A",
    textAlign: "center",
  },

  /* ====== قسم الترحيب ====== */
  welcomeSection: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4A6B6F",
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#5A5A5A",
    textAlign: "center",
  },

  /* ====== قسم المميزات ====== */
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4A6B6F",
    marginBottom: 20,
    textAlign: "center",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 160,
    justifyContent: "space-between",
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 36,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A6B6F",
    textAlign: "center",
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 13,
    color: "#7A7A7A",
    textAlign: "center",
    lineHeight: 18,
  },

  /* ====== زر البدء ====== */
  startButton: {
    backgroundColor: "#7FA896",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#7FA896",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginRight: 12,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  /* ====== النص السفلي ====== */
  footerText: {
    fontSize: 15,
    color: "#9A9A9A",
    textAlign: "center",
    marginTop: 8,
  },
});