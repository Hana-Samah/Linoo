import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { getChildInfo } from "../storage/childStorage";
import { speakWithFemaleVoice, stopSpeaking } from "../utils/ttsHelper";
import { getStars, getCurrentStreak } from "../storage/rewardsTracking";
import { getDailyProgress } from "../storage/dailyLionProgress";
import LionProgress from "../components/LionProgress";

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [childInfo, setChildInfo] = useState(null);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);
  
  const scaleButtons = useRef(new Animated.Value(0)).current;
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  const buttonScales = {
    aac: useRef(new Animated.Value(1)).current,
    stories: useRef(new Animated.Value(1)).current,
    stats: useRef(new Animated.Value(1)).current,
  };

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

      const loadChild = async () => {
        const child = await getChildInfo();
        setChildInfo(child);

        const userStars = await getStars();
        const userStreak = await getCurrentStreak();
        
        setStars(userStars);
        setStreak(userStreak);

        // 🦁 تحميل تقدم الأسد اليومي
        const lionProgress = await getDailyProgress();
        setDailyProgress(lionProgress);
        
        console.log(`🦁 التقدم اليومي: ${lionProgress}/8`);

        if (child && !hasPlayedWelcome) {
          setTimeout(() => {
            const greeting = `مرحباً ${child.name}`;
            speakWithFemaleVoice(greeting, {
              pitch: 1.3,
              rate: 0.7,
            });
            setHasPlayedWelcome(true);
          }, 800);
        }
      };

      loadChild();

      Animated.spring(scaleButtons, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      return () => {
        stopSpeaking();
        scaleButtons.setValue(0);
      };
    }, [])
  );

  const handlePressIn = (buttonName, soundText) => {
    Animated.spring(buttonScales[buttonName], {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();

    speakWithFemaleVoice(soundText, {
      pitch: 1.2,
      rate: 0.8,
    });
  };

  const handlePressOut = (buttonName) => {
    Animated.spring(buttonScales[buttonName], {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const navigateToAAC = () => {
    handlePressOut("aac");
    setTimeout(() => {
      navigation.navigate("Transition", {
        targetScreen: "AAC",
        targetParams: {},
        message: "سننتقل للتواصل",
        icon: "💬",
      });
    }, 100);
  };

  const navigateToLearning = () => {
    handlePressOut("stories");
    setTimeout(() => {
      navigation.navigate("Transition", {
        targetScreen: "Learning",
        targetParams: {},
        message: "سننتقل للقصص",
        icon: "📚",
      });
    }, 100);
  };

  const navigateToStats = () => {
    handlePressOut("stats");
    setTimeout(() => navigation.navigate("Statistics"), 100);
  };

  return (
    <View style={styles.container}>
      {/* الشريط العلوي */}
      <View style={styles.topBar}>
        <View style={styles.statsPreview}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{stars}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{streak}</Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScales.stats }] }}>
          <TouchableOpacity
            style={styles.statsButton}
            onPress={navigateToStats}
            onPressIn={() => handlePressIn("stats", "الإحصائيات")}
            onPressOut={() => handlePressOut("stats")}
            activeOpacity={1}
          >
            <Text style={styles.statsButtonIcon}>📊</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* زر البروفايل المخفي */}
      <TouchableOpacity
        onPress={() => navigation.navigate("ParentGate")}
        style={styles.secretButton}
        activeOpacity={1}
      >
        {childInfo?.imageUri ? (
          <Image
            source={{ uri: childInfo.imageUri }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profileIcon}>👤</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 🦁 شعر الأسد اليومي */}
      <View style={styles.lionSection}>
        <LionProgress 
          progress={dailyProgress}
          maxProgress={8}
          onPress={() => {
            speakWithFemaleVoice("إحصائياتك", { pitch: 1.2, rate: 0.8 });
            setTimeout(() => navigation.navigate("Statistics"), 500);
          }}
          showLabel={true}
        />
      </View>

      {/* الأزرار الرئيسية */}
      <View style={styles.mainContent}>
        <View style={styles.buttonsRow}>
          {/* زر التواصل */}
          <Animated.View
            style={[
              styles.buttonWrapper,
              {
                transform: [
                  { scale: scaleButtons },
                  { scale: buttonScales.aac },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.mainButton, styles.aacButton]}
              onPress={navigateToAAC}
              onPressIn={() => handlePressIn("aac", "التواصل")}
              onPressOut={() => handlePressOut("aac")}
              activeOpacity={1}
            >
              <View style={styles.iconDisplay}>
                <View style={styles.iconGrid}>
                  <View style={styles.wordCard}>
                    <Text style={styles.wordIcon}>🍎</Text>
                  </View>
                  <View style={styles.wordCard}>
                    <Text style={styles.wordIcon}>😊</Text>
                  </View>
                  <View style={styles.wordCard}>
                    <Text style={styles.wordIcon}>🏠</Text>
                  </View>
                  <View style={styles.wordCard}>
                    <Text style={styles.wordIcon}>❤️</Text>
                  </View>
                </View>
              </View>

              <View style={styles.buttonIndicator}>
                <View style={[styles.indicator, styles.aacIndicator]} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.spacer} />

          {/* زر القصص */}
          <Animated.View
            style={[
              styles.buttonWrapper,
              {
                transform: [
                  { scale: scaleButtons },
                  { scale: buttonScales.stories },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.mainButton, styles.storiesButton]}
              onPress={navigateToLearning}
              onPressIn={() => handlePressIn("stories", "القصص")}
              onPressOut={() => handlePressOut("stories")}
              activeOpacity={1}
            >
              <View style={styles.iconDisplay}>
                <Text style={styles.bigIcon}>📚</Text>
                <View style={styles.floatingStars}>
                  <Text style={styles.star}>⭐</Text>
                  <Text style={styles.star}>⭐</Text>
                  <Text style={styles.star}>⭐</Text>
                </View>
              </View>

              <View style={styles.buttonIndicator}>
                <View style={[styles.indicator, styles.storiesIndicator]} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  statsPreview: {
    flexDirection: "row",
    gap: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#E8C68E",
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A6B6F",
  },

  statsButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#7FA896",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7FA896",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  statsButtonIcon: {
    fontSize: 32,
  },

  secretButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    opacity: 0.3,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    fontSize: 30,
    opacity: 0.5,
  },

  /* 🦁 قسم الأسد */
  lionSection: {
    position: "absolute",
    top: 85,
    left: 15,
    zIndex: 5,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#E8C68E",
  },

  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 60,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonWrapper: {
    flex: 1,
    maxWidth: 300,
  },
  spacer: {
    width: 50,
  },

  mainButton: {
    height: 320,
    borderRadius: 45,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 6,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  aacButton: {
    backgroundColor: "#7FA896",
  },
  storiesButton: {
    backgroundColor: "#D9956C",
  },

  iconDisplay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  iconGrid: {
    width: "90%",
    aspectRatio: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignContent: "space-around",
    padding: 10,
  },
  wordCard: {
    width: "42%",
    aspectRatio: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  wordIcon: {
    fontSize: 55,
  },

  bigIcon: {
    fontSize: 140,
  },
  floatingStars: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
  },
  star: {
    fontSize: 25,
    marginHorizontal: 3,
  },

  buttonIndicator: {
    marginTop: 15,
    width: "80%",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  indicator: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  aacIndicator: {
    backgroundColor: "#5B8A8F",
  },
  storiesIndicator: {
    backgroundColor: "#B87B5B",
  },
});