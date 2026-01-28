import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
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

function generateQuestion() {
  const types = ["add", "subtract", "multiply"];
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case "add": {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      return { question: `${a} + ${b}`, answer: a + b };
    }
    case "subtract": {
      const big = Math.floor(Math.random() * 15) + 5;
      const small = Math.floor(Math.random() * big);
      return { question: `${big} - ${small}`, answer: big - small };
    }
    case "multiply": {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      return { question: `${a} × ${b}`, answer: a * b };
    }
    default:
      return { question: "2 + 2", answer: 4 };
  }
}

export default function HomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const isSmallScreen = width < 375;

  const [childInfo, setChildInfo] = useState(null);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [question, setQuestion] = useState(generateQuestion());
  const [answer, setAnswer] = useState("");
  const [errorShake, setErrorShake] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const lionFloat = useRef(new Animated.Value(0)).current;
  const starPulse = useRef(new Animated.Value(1)).current;
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const soundRef = useRef(null);

  const buttonScales = {
    aac: useRef(new Animated.Value(1)).current,
    stories: useRef(new Animated.Value(1)).current,
  };

  const buttonRotations = {
    aac: useRef(new Animated.Value(0)).current,
    stories: useRef(new Animated.Value(0)).current,
  };

  const AAC_IMAGE = require("../../assets/aac-icon.webp");
  const STORIES_IMAGE = require("../../assets/stories-icon.webp");

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

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

  const handleProfilePress = () => {
    setQuestion(generateQuestion());
    setAnswer("");
    setErrorShake(false);
    setModalVisible(true);
  };

  const shakeError = () => {
    setErrorShake(true);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setErrorShake(false);
      setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setModalVisible(false);
        });
      }, 500);
    });
  };

  const checkAnswer = () => {
    if (parseInt(answer) === question.answer) {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
        navigation.navigate("ParentMenu");
      });
    } else {
      shakeError();
    }
  };

  const handleCancel = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  // حساب الأبعاد
  const safeTop = Platform.OS === 'ios' ? (isPortrait ? 0 : 0) : (StatusBar.currentHeight || 0);
  const containerPadding = isPortrait ? 16 : 20;
  const buttonSize = isPortrait ? (isSmallScreen ? 130 : 140) : 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
          paddingTop: safeTop,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backgroundPattern}>
          <View style={[styles.floatingShape, styles.shape1]} />
          <View style={[styles.floatingShape, styles.shape2]} />
          <View style={[styles.floatingShape, styles.shape3]} />
          <View style={[styles.floatingShape, styles.shape4]} />
        </View>

        {/* الشريط العلوي */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 10,
          paddingHorizontal: containerPadding,
          zIndex: 100,
          marginBottom: isPortrait ? 16 : 8,
        }}>
          <Animated.View
            style={{
              flex: 1,
              alignItems: "flex-start",
              marginRight: 12,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={{
              backgroundColor: COLORS.white,
              paddingHorizontal: isSmallScreen ? 12 : 14,
              paddingVertical: isSmallScreen ? 6 : 8,
              borderRadius: 18,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 5,
              borderWidth: 2,
              borderColor: COLORS.cream,
            }}>
              <Text style={{
                fontSize: isSmallScreen ? 14 : 16,
                fontWeight: "700",
                color: COLORS.orange,
                marginRight: 4,
              }}>مرحبا </Text>
              {childInfo && (
                <Text style={{
                  fontSize: isSmallScreen ? 16 : 18,
                  fontWeight: "900",
                  color: COLORS.teal,
                }}>{childInfo.name}</Text>
              )}
            </View>
          </Animated.View>

          <TouchableOpacity
            onPress={handleProfilePress}
            activeOpacity={0.9}
          >
            <View style={{ position: "relative" }}>
              {childInfo?.imageUri ? (
                <Image
                  source={{ uri: childInfo.imageUri }}
                  style={{
                    width: isSmallScreen ? 50 : 55,
                    height: isSmallScreen ? 50 : 55,
                    borderRadius: isSmallScreen ? 25 : 27.5,
                    borderWidth: 3,
                    borderColor: COLORS.white,
                  }}
                />
              ) : (
                <View style={{
                  width: isSmallScreen ? 50 : 55,
                  height: isSmallScreen ? 50 : 55,
                  borderRadius: isSmallScreen ? 25 : 27.5,
                  backgroundColor: COLORS.white,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 3,
                  borderColor: COLORS.yellow,
                }}>
                  <Text style={{ fontSize: isSmallScreen ? 24 : 26 }}>😊</Text>
                </View>
              )}
              <View style={{
                position: "absolute",
                width: isSmallScreen ? 56 : 61,
                height: isSmallScreen ? 56 : 61,
                borderRadius: isSmallScreen ? 28 : 30.5,
                borderWidth: 2,
                borderColor: COLORS.sage,
                top: -3,
                left: -3,
              }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* الأسد */}
        <Animated.View
          style={{
            alignItems: "center",
            marginTop: 8,
            paddingHorizontal: containerPadding,
            marginBottom: isPortrait ? 20 : 8,
            opacity: fadeAnim,
            transform: [{ translateY: lionTranslateY }],
          }}
        >
          <TouchableOpacity
            onPress={playLionEncouragement}
            activeOpacity={0.8}
          >
            <View style={{
              backgroundColor: COLORS.white,
              borderRadius: isPortrait ? 22 : 18,
              padding: isPortrait ? 12 : 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 8,
              borderWidth: 3,
              borderColor: COLORS.sage,
            }}>
              <LionProgress
                progress={dailyProgress}
                maxProgress={8}
                onPress={playLionEncouragement}
                showLabel={false}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* الأزرار الرئيسية */}
        <Animated.View
          style={{
            flexDirection: isPortrait ? "column" : "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            paddingHorizontal: containerPadding,
            paddingTop: 8,
            opacity: fadeAnim,
          }}
        >
          {/* زر التواصل */}
          <Animated.View
            style={{
              width: isPortrait ? "100%" : "45%",
              maxWidth: 400,
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
            >
              <View style={{
                height: isPortrait ? (isSmallScreen ? 140 : 160) : 110,
                alignItems: "center",
                justifyContent: "center",
              }}>
                <View style={{
                  borderRadius: 22,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 8,
                  borderWidth: 4,
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.sage,
                }}>
                  <Image
                    source={AAC_IMAGE}
                    style={{
                      width: buttonSize,
                      height: buttonSize,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* زر القصص */}
          <Animated.View
            style={{
              width: isPortrait ? "100%" : "45%",
              maxWidth: 400,
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
            >
              <View style={{
                height: isPortrait ? (isSmallScreen ? 140 : 160) : 110,
                alignItems: "center",
                justifyContent: "center",
              }}>
                <View style={{
                  borderRadius: 22,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 8,
                  borderWidth: 4,
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.peach,
                }}>
                  <Image
                    source={STORIES_IMAGE}
                    style={{
                      width: buttonSize,
                      height: buttonSize,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {!isPortrait && (
          <View style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 15,
            marginTop: 8,
            paddingBottom: 8,
          }}>
            <Text style={{ fontSize: 20, opacity: 0.3 }}>🌈</Text>
            <Text style={{ fontSize: 20, opacity: 0.3 }}>⭐</Text>
            <Text style={{ fontSize: 20, opacity: 0.3 }}>🎈</Text>
            <Text style={{ fontSize: 20, opacity: 0.3 }}>🎨</Text>
            <Text style={{ fontSize: 20, opacity: 0.3 }}>🌟</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal قفل الوالدين */}
      <Modal transparent animationType="fade" visible={modalVisible}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.overlay}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={handleCancel}
          >
            <Animated.View
              style={[
                {
                  backgroundColor: COLORS.background,
                  width: isPortrait ? "88%" : "70%",
                  maxWidth: 420,
                  padding: isPortrait ? 22 : 28,
                  borderRadius: isPortrait ? 25 : 28,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 16,
                  borderWidth: 4,
                  borderColor: COLORS.white,
                  transform: [
                    { scale: scaleAnim },
                    { translateX: shakeAnimation },
                  ],
                },
              ]}
            >
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.modalBackgroundPattern}>
                  <View style={[styles.modalFloatingShape, styles.modalShape1]} />
                  <View style={[styles.modalFloatingShape, styles.modalShape2]} />
                </View>

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: COLORS.white,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 3,
                    elevation: 3,
                    borderWidth: 2,
                    borderColor: COLORS.cream,
                    zIndex: 10,
                  }}
                  onPress={handleCancel}
                >
                  <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.textSecondary }}>✕</Text>
                </TouchableOpacity>

                <View style={{
                  width: isPortrait ? 75 : 65,
                  height: isPortrait ? 75 : 65,
                  borderRadius: isPortrait ? 37.5 : 32.5,
                  backgroundColor: COLORS.teal,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: isPortrait ? 16 : 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 5,
                  borderWidth: 4,
                  borderColor: COLORS.white,
                }}>
                  <Text style={{ fontSize: isPortrait ? 38 : 32 }}>🔒</Text>
                </View>

                <Text style={{
                  fontSize: isPortrait ? 24 : 20,
                  fontWeight: "900",
                  color: COLORS.darkTeal,
                  marginBottom: isPortrait ? 6 : 4,
                }}>للكبار فقط</Text>

                {isPortrait && (
                  <Text style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: COLORS.textSecondary,
                    marginBottom: 16,
                  }}>حل المسألة للمتابعة</Text>
                )}

                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: COLORS.white,
                  paddingVertical: isPortrait ? 16 : 12,
                  paddingHorizontal: isPortrait ? 20 : 16,
                  borderRadius: isPortrait ? 20 : 16,
                  marginBottom: isPortrait ? 16 : 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                  elevation: 5,
                  borderWidth: 3,
                  borderColor: COLORS.sage,
                }}>
                  <Text style={{
                    fontSize: isPortrait ? 28 : 24,
                    fontWeight: "900",
                    color: COLORS.textPrimary,
                  }}>{question.question}</Text>
                  <Text style={{
                    fontSize: isPortrait ? 24 : 20,
                    fontWeight: "700",
                    marginHorizontal: isPortrait ? 10 : 8,
                    color: COLORS.textSecondary,
                  }}>=</Text>
                  <Text style={{
                    fontSize: isPortrait ? 28 : 24,
                    fontWeight: "900",
                    color: COLORS.orange,
                  }}>؟</Text>
                </View>

                <TextInput
                  style={{
                    width: isPortrait ? 110 : 95,
                    height: isPortrait ? 60 : 52,
                    fontSize: isPortrait ? 28 : 24,
                    fontWeight: "900",
                    textAlign: "center",
                    borderRadius: isPortrait ? 16 : 14,
                    borderWidth: 3,
                    borderColor: errorShake ? COLORS.rust : COLORS.green,
                    backgroundColor: errorShake ? COLORS.peach : COLORS.white,
                    marginBottom: isPortrait ? 16 : 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    elevation: 3,
                    color: COLORS.textPrimary,
                  }}
                  keyboardType="number-pad"
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  maxLength={3}
                  autoFocus={true}
                  onSubmitEditing={checkAnswer}
                />

                {errorShake && (
                  <View style={{
                    backgroundColor: COLORS.white,
                    paddingVertical: isPortrait ? 10 : 8,
                    paddingHorizontal: isPortrait ? 14 : 12,
                    borderRadius: isPortrait ? 16 : 14,
                    marginBottom: isPortrait ? 16 : 12,
                    borderWidth: 2,
                    borderColor: COLORS.rust,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 3,
                    elevation: 3,
                  }}>
                    <Text style={{
                      fontSize: isPortrait ? 13 : 12,
                      fontWeight: "700",
                      color: COLORS.rust,
                      textAlign: "center",
                    }}>
                      ⚠️ إجابة خاطئة! سيتم إغلاق النافذة...
                    </Text>
                  </View>
                )}

                <View style={{
                  flexDirection: "row",
                  gap: 12,
                  width: "100%",
                  marginBottom: isPortrait ? 12 : 8,
                }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: COLORS.white,
                      paddingVertical: isPortrait ? 14 : 12,
                      borderRadius: isPortrait ? 16 : 14,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 4,
                      elevation: 3,
                      borderWidth: 2,
                      borderColor: COLORS.cream,
                    }}
                    onPress={handleCancel}
                  >
                    <Text style={{
                      fontSize: isPortrait ? 16 : 15,
                      fontWeight: "800",
                      color: COLORS.textPrimary,
                    }}>إلغاء</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: answer ? COLORS.green : COLORS.cream,
                      paddingVertical: isPortrait ? 14 : 12,
                      borderRadius: isPortrait ? 16 : 14,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: answer ? 0.2 : 0.1,
                      shadowRadius: 4,
                      elevation: answer ? 5 : 2,
                      borderWidth: 2,
                      borderColor: COLORS.white,
                      opacity: answer ? 1 : 0.6,
                    }}
                    onPress={checkAnswer}
                    disabled={!answer}
                  >
                    <Text style={{
                      fontSize: isPortrait ? 16 : 15,
                      fontWeight: "800",
                      color: answer ? COLORS.white : COLORS.textSecondary,
                    }}>تأكيد</Text>
                  </TouchableOpacity>
                </View>

                {isPortrait && (
                  <Text style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: COLORS.textSecondary,
                    textAlign: "center",
                  }}>
                    💡 هذا القفل لحماية إعدادات طفلك
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBackgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 25,
    overflow: "hidden",
  },
  modalFloatingShape: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.08,
  },
  modalShape1: {
    width: 130,
    height: 130,
    backgroundColor: COLORS.green,
    top: -40,
    right: -40,
  },
  modalShape2: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.orange,
    bottom: -35,
    left: -35,
  },
});