import { View, StyleSheet, Image, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { getChildInfo } from "../storage/childStorage";

export default function SplashScreen({ navigation }) {
  // أنيميشن الصورة
  const imageScale = useRef(new Animated.Value(0.7)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  // أنيميشن الخلفية المتنفسة
  const bgAnim = useRef(new Animated.Value(0)).current;

  // شريط التحميل
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ✅ حركة الصورة: تكبر + تظهر (أبطأ وأنعم)
    Animated.parallel([
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 1500, // أبطأ شوي
        easing: Easing.out(Easing.back(1.2)), // حركة مرتدة لطيفة
        useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }),
    ]).start();

    // ✅ خلفية تتنفس (تتغير تدريجياً) - ألوان ترابية
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 3000, // أبطأ للهدوء
          useNativeDriver: false,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // ✅ شريط التحميل
    Animated.timing(progress, {
      toValue: 1,
      duration: 2600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const checkChild = async () => {
      const child = await getChildInfo();

      setTimeout(() => {
        if (child) navigation.replace("Home");
        else navigation.replace("Welcome");
      }, 2800); // زيادة الوقت قليلاً
    };

    checkChild();
  }, []);

  // ✅ لون الخلفية يتحول بين الألوان الترابية من شعارك
  const animatedBackground = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FAF8F5", "#F5EFE7"], // من ألوانك الترابية
  });

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: animatedBackground }]}>
      
      {/* ✅ دوائر زخرفية خلفية هادئة */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* ✅ صورة الأسد مع انيميشن */}
      <Animated.Image
        source={require("../../assets/lion.png")}
        style={[
          styles.lionImage,
          {
            transform: [{ scale: imageScale }],
            opacity: imageOpacity,
          },
        ]}
      />

      {/* ✅ شريط التحميل - بألوان ترابية */}
      <View style={styles.progressBackground}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ✅ دوائر زخرفية بألوان ترابية هادئة
  bgCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#E8C68E", // اللون الترابي الأصفر
    opacity: 0.08,
    top: -100,
    right: -80,
  },

  bgCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#B5C9B4", // اللون الترابي الأخضر
    opacity: 0.08,
    bottom: -70,
    left: -60,
  },

  lionImage: {
    width: 280, // أكبر شوي
    height: 280,
    resizeMode: "contain",
    marginBottom: 50,
  },

  progressBackground: {
    width: 250, // أعرض شوي
    height: 20, // أعلى شوي
    backgroundColor: "#E8C68E", // لون ترابي فاتح
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#D9956C", // لون ترابي برتقالي
    borderRadius: 25,
  },
});