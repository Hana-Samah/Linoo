import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { getChildInfo } from "../storage/childStorage";
import { speakWithFemaleVoice, stopSpeaking } from "../utils/ttsHelper";
import { getStars, getCurrentStreak } from "../storage/rewardsTracking";
import { getDailyProgress } from "../storage/dailyLionProgress";
import LionProgress from "../components/LionProgress";

// 🎨 ألوان Linoo الترابية
const COLORS = {
  background: "#FAF8F5",
  cream: "#F5EFE7",
  green: "#7FA896",
  teal: "#5B8A8F",
  darkTeal: "#4A6B6F",
  sage: "#B5C9B4",
  orange: "#D9956C",
  peach: "#E8B88E",
  rust: "#B87B5B",
  yellow: "#E8C68E",
  lightBlue: "#A8C5C5",
  white: "#FFFFFF",
  textPrimary: "#4A4A4A",
  textSecondary: "#7A7A7A",
};

export default function HomeScreen({ navigation }) {
  const [childInfo, setChildInfo] = useState(null);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window"),
  );

  // ✨ Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const lionFloat = useRef(new Animated.Value(0)).current;
  const starPulse = useRef(new Animated.Value(1)).current;
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  const soundRef = useRef(null);

  const buttonScales = {
    aac: useRef(new Animated.Value(1)).current,
    stories: useRef(new Animated.Value(1)).current,
  };

  const buttonRotations = {
    aac: useRef(new Animated.Value(0)).current,
    stories: useRef(new Animated.Value(0)).current,
  };

  // 📱 Get dynamic values
  const isPortrait = screenDimensions.height > screenDimensions.width;
  const AAC_IMAGE = require("../../assets/aac-icon.png");
  const STORIES_IMAGE = require("../../assets/stories-icon.png");

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });

    // ⭐ نبضات النجوم المستمرة
    Animated.loop(
      Animated.sequence([
        Animated.timing(starPulse, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(starPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => subscription?.remove();
  }, []);

  const playWelcomeSound = async (childName) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      Speech.stop();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/welcome.mp3"),
        { shouldPlay: true },
      );

      soundRef.current = sound;

      await new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            soundRef.current = null;
            resolve();
          }
        });
      });

      await new Promise((resolve) => {
        Speech.speak(childName, {
          language: "ar",
          pitch: 1.3,
          rate: 0.7,
          onDone: resolve,
          onStopped: resolve,
          onError: resolve,
        });
      });
    } catch (error) {
      console.error("Error playing welcome sound:", error);
      speakWithFemaleVoice(`مرحباً ${childName}`, {
        pitch: 1.3,
        rate: 0.7,
      });
    }
  };

  const playLionEncouragement = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      Speech.stop();

      const lionSounds = [
        require("../../assets/sounds/lion/encouragement1.mp3"),
        require("../../assets/sounds/lion/encouragement2.mp3"),
        require("../../assets/sounds/lion/encouragement3.mp3"),
      ];

      const randomSound =
        lionSounds[Math.floor(Math.random() * lionSounds.length)];

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(randomSound, {
        shouldPlay: true,
      });

      soundRef.current = sound;

      return new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            soundRef.current = null;
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Error playing lion encouragement:", error);
      const messages = [
        "رائع! استمر في عملك الجيد!",
        "أنت تقوم بعمل ممتاز!",
        "واصل! شعر الأسد ينمو!",
      ];
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      speakWithFemaleVoice(randomMessage, { pitch: 1.3, rate: 0.7 });
    }
  };

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.unlockAsync();

      const loadChild = async () => {
        const child = await getChildInfo();
        setChildInfo(child);

        const userStars = await getStars();
        const userStreak = await getCurrentStreak();

        setStars(userStars);
        setStreak(userStreak);

        const lionProgress = await getDailyProgress();
        setDailyProgress(lionProgress);

        if (child && !hasPlayedWelcome) {
          setTimeout(() => {
            playWelcomeSound(child.name);
            setHasPlayedWelcome(true);
          }, 800);
        }
      };

      loadChild();

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(lionFloat, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(lionFloat, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      return () => {
        if (soundRef.current) {
          soundRef.current.unloadAsync();
        }
        Speech.stop();
        stopSpeaking();
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
      };
    }, []),
  );

  const lionTranslateY = lionFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const handlePressIn = (buttonName, soundText) => {
    Animated.parallel([
      Animated.spring(buttonScales[buttonName], {
        toValue: 0.9,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(buttonRotations[buttonName], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    speakWithFemaleVoice(soundText, {
      pitch: 1.2,
      rate: 0.8,
    });
  };

  const handlePressOut = (buttonName) => {
    Animated.parallel([
      Animated.spring(buttonScales[buttonName], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(buttonRotations[buttonName], {
        toValue: 0,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const aacRotation = buttonRotations.aac.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-5deg"],
  });

  const storiesRotation = buttonRotations.stories.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "5deg"],
  });

  const navigateToAAC = () => {
    handlePressOut("aac");
    setTimeout(() => navigation.navigate("AAC"), 100);
  };

  const navigateToLearning = () => {
    handlePressOut("stories");
    setTimeout(() => navigation.navigate("Learning"), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* 🎈 خلفية ترابية ناعمة */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.floatingShape, styles.shape1]} />
          <View style={[styles.floatingShape, styles.shape2]} />
          <View style={[styles.floatingShape, styles.shape3]} />
          <View style={[styles.floatingShape, styles.shape4]} />
        </View>

        {/* الشريط العلوي: الترحيب + صورة الطفل */}
        <View style={[styles.topHeader, isPortrait && styles.topHeaderPortrait]}>
          {/* 👋 ترحيب */}
          <Animated.View
            style={[
              styles.welcomeSection,
              isPortrait && styles.welcomeSectionPortrait,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={[styles.welcomeBubble, isPortrait && styles.welcomeBubblePortrait]}>
              <Text style={[styles.helloText, isPortrait && styles.helloTextPortrait]}>مرحبا </Text>
              {childInfo && (
                <Text style={[styles.childNameText, isPortrait && styles.childNameTextPortrait]}>{childInfo.name}</Text>
              )}
            </View>
          </Animated.View>

          {/* 👤 صورة الطفل */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ParentGate")}
            style={[styles.profileButton, isPortrait && styles.profileButtonPortrait]}
            activeOpacity={0.9}
          >
            <View style={styles.profileContainer}>
              {childInfo?.imageUri ? (
                <Image
                  source={{ uri: childInfo.imageUri }}
                  style={[styles.profileImage, isPortrait && styles.profileImagePortrait]}
                />
              ) : (
                <View style={[styles.profilePlaceholder, isPortrait && styles.profilePlaceholderPortrait]}>
                  <Text style={[styles.profileEmoji, isPortrait && styles.profileEmojiPortrait]}>😊</Text>
                </View>
              )}
              <View style={[styles.profileBorder, isPortrait && styles.profileBorderPortrait]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 🌟 شريط النجوم */}
        <Animated.View
          style={[
            styles.starsBar,
            isPortrait && styles.starsBarPortrait,
            {
              opacity: fadeAnim,
              transform: [{ scale: starPulse }],
            },
          ]}
        >
        </Animated.View>

        {/* 🦁 الأسد */}
        <Animated.View
          style={[
            styles.lionSection,
            isPortrait && styles.lionSectionPortrait,
            {
              opacity: fadeAnim,
              transform: [{ translateY: lionTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={playLionEncouragement}
            activeOpacity={0.8}
            style={styles.lionTouchable}
          >
            <View style={[styles.lionBox, isPortrait && styles.lionBoxPortrait]}>
              <LionProgress
                progress={dailyProgress}
                maxProgress={8}
                onPress={playLionEncouragement}
                showLabel={false}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* 🎮 الأزرار الرئيسية */}
        <Animated.View
          style={[
            styles.mainButtons,
            isPortrait && styles.mainButtonsPortrait,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* 💬 زر التواصل */}
          <Animated.View
            style={{
              transform: [
                { scale: buttonScales.aac },
                { rotate: aacRotation },
              ],
            }}
          >
            <TouchableOpacity
              onPress={navigateToAAC}
              onPressIn={() => handlePressIn("aac", "التواصل")}
              onPressOut={() => handlePressOut("aac")}
              activeOpacity={1}
              style={[styles.bigButton, isPortrait && styles.bigButtonPortrait]}
            >
              <View style={[styles.buttonCard, styles.aacCard, isPortrait && styles.buttonCardPortrait]}>
                {/* أيقونة كبيرة */}
                <View style={styles.iconWrapper}>
                  <View style={[styles.iconCircle, styles.aacIconBg, isPortrait && styles.iconCirclePortrait]}>
                    <Image
                      source={AAC_IMAGE}
                      style={[styles.buttonIcon, isPortrait && styles.buttonIconPortrait]}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* 📚 زر القصص */}
          <Animated.View
            style={{
              transform: [
                { scale: buttonScales.stories },
                { rotate: storiesRotation },
              ],
            }}
          >
            <TouchableOpacity
              onPress={navigateToLearning}
              onPressIn={() => handlePressIn("stories", "القصص")}
              onPressOut={() => handlePressOut("stories")}
              activeOpacity={1}
              style={[styles.bigButton, isPortrait && styles.bigButtonPortrait]}
            >
              <View style={[styles.buttonCard, styles.storiesCard, isPortrait && styles.buttonCardPortrait]}>
                {/* أيقونة كبيرة */}
                <View style={styles.iconWrapper}>
                  <View style={[styles.iconCircle, styles.storiesIconBg, isPortrait && styles.iconCirclePortrait]}>
                    <Image
                      source={STORIES_IMAGE}
                      style={[styles.buttonIcon, isPortrait && styles.buttonIconPortrait]}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* 🎨 زخرفة سفلية */}
        {!isPortrait && (
          <View style={styles.bottomEmojis}>
            <Text style={styles.bottomEmoji}>🌈</Text>
            <Text style={styles.bottomEmoji}>⭐</Text>
            <Text style={styles.bottomEmoji}>🎈</Text>
            <Text style={styles.bottomEmoji}>🎨</Text>
            <Text style={styles.bottomEmoji}>🌟</Text>
          </View>
        )}
      </View>
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
    backgroundColor: COLORS.background,
  },

  /* 🎈 خلفية ترابية */
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
    backgroundColor: COLORS.green,
    top: -50,
    right: -60,
  },
  shape2: {
    width: 150,
    height: 150,
    backgroundColor: COLORS.orange,
    bottom: -40,
    left: -50,
  },
  shape3: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.teal,
    top: "30%",
    left: -30,
  },
  shape4: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.peach,
    bottom: "25%",
    right: -20,
  },

  /* الشريط العلوي */
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 55 : 25,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  topHeaderPortrait: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 15,
  },

  /* 👤 صورة الطفل */
  profileButton: {
    zIndex: 100,
  },
  profileButtonPortrait: {
  },
  profileContainer: {
    position: "relative",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profileImagePortrait: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
  },
  profilePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.yellow,
  },
  profilePlaceholderPortrait: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
  },
  profileEmoji: {
    fontSize: 36,
  },
  profileEmojiPortrait: {
    fontSize: 30,
  },
  profileBorder: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: COLORS.sage,
    top: -4,
    left: -4,
  },
  profileBorderPortrait: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    top: -3,
    left: -3,
  },

  /* 🌟 شريط النجوم */
  starsBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 135 : 105,
    left: 20,
    flexDirection: "row",
    gap: 15,
    zIndex: 100,
  },
  starsBarPortrait: {
    top: Platform.OS === "ios" ? 120 : 90,
    left: 15,
  },

  /* 👋 ترحيب */
  welcomeSection: {
    flex: 1,
    alignItems: "flex-start",
    marginRight: 15,
  },
  welcomeSectionPortrait: {
    flex: 1,
    marginRight: 10,
  },
  welcomeBubble: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.cream,
  },
  welcomeBubblePortrait: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
  },
  helloText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.orange,
    marginRight: 5,
  },
  helloTextPortrait: {
    fontSize: 18,
    marginRight: 4,
  },
  childNameText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.teal,
  },
  childNameTextPortrait: {
    fontSize: 20,
  },

  /* 🦁 الأسد */
  lionSection: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  lionSectionPortrait: {
    marginTop: 25,
    paddingHorizontal: 15,
  },
  lionTouchable: {
    borderRadius: 30,
  },
  lionBox: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 4,
    borderColor: COLORS.sage,
  },
  lionBoxPortrait: {
    borderRadius: 25,
    padding: 15,
    borderWidth: 3,
  },

  /* 🎮 الأزرار الرئيسية */
  mainButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  mainButtonsPortrait: {
    flexDirection: "column",
    gap: 15,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },

  bigButton: {
    width: Dimensions.get("window").width * 0.42,
    maxWidth: 250,
  },
  bigButtonPortrait: {
    width: "100%",
    maxWidth: 350,
  },

  buttonCard: {
    height: 250,
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonCardPortrait: {
    height: 180,
  },

  /* أيقونات الأزرار */
  iconCircle: {
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 5,
  },
  iconCirclePortrait: {
    borderRadius: 25,
    borderWidth: 4,
  },
  aacIconBg: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.sage,
  },
  storiesIconBg: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.peach,
  },
  buttonIcon: {
    width: 200,
    height: 200,
  },
  buttonIconPortrait: {
    width: 150,
    height: 150,
  },

  /* 🎨 زخرفة سفلية */
  bottomEmojis: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  bottomEmoji: {
    fontSize: 30,
    opacity: 0.3,
  },
});