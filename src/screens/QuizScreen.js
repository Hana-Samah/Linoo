import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { getChildInfo } from "../storage/childStorage";
import { addStar, saveQuizResult, getQuizResults } from "../data/stories";
import { addPoints, checkAchievements, updateWeeklyGoals } from "../storage/rewardsTracking";
import { addDailyProgress } from "../storage/dailyLionProgress";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { COLORS } from "../styles/colors";

const icons = {
  speaker: require("../../assets/speaker-icon.webp"),
  correct: require("../../assets/correct-icon.webp"),
  wrong: require("../../assets/wrong-icon.webp"),
  star: require("../../assets/lion/lion_8.webp"),
};

export default function QuizScreen({ navigation, route }) {
  const { quiz, storyId, storyTitle } = route.params;
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const isSmallScreen = width < 375;

  const [childName, setChildName] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [frozenOptions, setFrozenOptions] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  
  const soundRef = useRef(null);

  useEffect(() => {
    loadChildName();
    shuffleOptions();
    speakQuestion();
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      Speech.stop();
    };
  }, []);

  const loadChildName = async () => {
    const child = await getChildInfo();
    if (child) {
      setChildName(child.name);
    }
  };

  const shuffleOptions = () => {
    const shuffled = [...quiz.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    
    if (!frozenOptions) {
      setFrozenOptions(shuffled);
    }
  };

  const speakQuestion = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      Speech.stop();

      if (quiz.questionAudio && !quiz.useTTS) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          quiz.questionAudio,
          { shouldPlay: true }
        );

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
      } else {
        return new Promise((resolve) => {
          Speech.speak(quiz.question, {
            language: "ar",
            rate: 0.55,
            pitch: 1.2,
            onDone: resolve,
            onStopped: resolve,
            onError: resolve,
          });
        });
      }
    } catch (error) {
      console.error("Error playing question audio:", error);
      return new Promise((resolve) => {
        Speech.speak(quiz.question, {
          language: "ar",
          rate: 0.55,
          pitch: 1.2,
          onDone: resolve,
          onStopped: resolve,
          onError: resolve,
        });
      });
    }
  };

  const speakOption = async (option) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      Speech.stop();

      if (option.audio) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          option.audio,
          { shouldPlay: true }
        );

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
      } else {
        return new Promise((resolve) => {
          Speech.speak(option.text, {
            language: "ar",
            rate: 0.55,
            pitch: 1.2,
            onDone: resolve,
            onStopped: resolve,
            onError: resolve,
          });
        });
      }
    } catch (error) {
      console.error("Error playing option audio:", error);
      return new Promise((resolve) => {
        Speech.speak(option.text, {
          language: "ar",
          rate: 0.55,
          pitch: 1.2,
          onDone: resolve,
          onStopped: resolve,
          onError: resolve,
        });
      });
    }
  };

  const speakEncouragement = async (soundKey) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      Speech.stop();

      const ENCOURAGEMENT_SOUNDS = {
        correct: require("../../assets/sounds/encouragement/correct.mp3"),
        try_again: require("../../assets/sounds/encouragement/try_again.mp3"),
      };

      if (ENCOURAGEMENT_SOUNDS[soundKey]) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          ENCOURAGEMENT_SOUNDS[soundKey],
          { shouldPlay: true }
        );

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
      }
    } catch (error) {
      console.error("Error playing encouragement:", error);
      return Promise.resolve();
    }
  };

  const handleOptionPress = async (option) => {
    if (isProcessing || showResult) return;
    
    setIsProcessing(true);
    
    await speakOption(option);
    
    setSelectedOption(option.id);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await new Promise(resolve => setTimeout(resolve, 800));

    if (option.isCorrect) {
      console.log("✅ إجابة صحيحة!");
      
      setIsCorrect(true);
      setShowResult(true);

      const quizResults = await saveQuizResult(storyId, true);
      await addStar();
      
      const pointsToAdd = attempts === 0 ? 15 : 10;
      await addPoints(pointsToAdd, `إجابة صحيحة في سؤال "${storyTitle}"`);
      await updateWeeklyGoals("quiz");
      
      const progressResult = await addDailyProgress("QUIZ_CORRECT", "إجابة صحيحة");
      if (progressResult && progressResult.hairGrown) {
        console.log(`🦁 ${progressResult.message}`);
      }
      
      let totalCorrectAnswers = 0;
      Object.values(quizResults).forEach(storyResults => {
        totalCorrectAnswers += storyResults.filter(r => r.isCorrect).length;
      });
      
      await checkAchievements("quiz", totalCorrectAnswers);

      Animated.parallel([
        Animated.spring(starAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(300),
          Animated.spring(pointsAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      await speakEncouragement('correct');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("📙 الرجوع لقائمة القصص");
      navigation.navigate("Learning");
      
    } else {
      console.log(`❌ إجابة خاطئة - المحاولة ${attempts + 1}`);
      
      setIsCorrect(false);
      setShowResult(true);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      await speakEncouragement('try_again');
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (newAttempts === 1) {
        console.log("🔄 المحاولة الثانية: نفس الترتيب");
        setShuffledOptions(frozenOptions);
      } else if (newAttempts >= 2) {
        console.log("✅ المحاولة الثالثة: الإجابة الصحيحة فقط");
        const correctAnswer = quiz.options.find(opt => opt.isCorrect);
        setShuffledOptions([correctAnswer]);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setSelectedOption(null);
      setShowResult(false);
      setIsProcessing(false);
      
      await speakQuestion();
    }
    
    setIsProcessing(false);
  };

  // حساب ارتفاع الصورة بناءً على الوضع
  const getImageHeight = () => {
    if (shuffledOptions.length === 1) {
      return isPortrait ? 200 : 180;
    }
    return isPortrait ? 140 : 100;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
        {/* 🎨 خلفية ترابية */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.floatingShape, styles.shape1]} />
          <View style={[styles.floatingShape, styles.shape2]} />
          <View style={[styles.floatingShape, styles.shape3]} />
          <View style={[styles.floatingShape, styles.shape4]} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: isPortrait ? 16 : 20,
            paddingTop: Platform.OS === "ios" ? 10 : 15,
            paddingBottom: 20,
          }}
        >
          {/* الهيدر */}
          <View style={{
            marginBottom: isPortrait ? 16 : 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{
                fontSize: isPortrait ? 28 : 24,
                fontWeight: "900",
                color: COLORS.secondary.orange,
              }}>🎯 الاختبار</Text>
            </View>
            
            {attempts > 0 && (
              <View style={{
                backgroundColor: COLORS.neutral.white,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: COLORS.secondary.rust,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 3,
              }}>
                <Text style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: COLORS.secondary.rust,
                }}>المحاولة {attempts + 1}</Text>
              </View>
            )}
          </View>

          {/* السؤال */}
          <View style={{
            marginBottom: isPortrait ? 20 : 16,
            alignItems: "center",
          }}>
            <View style={{
              backgroundColor: COLORS.neutral.white,
              borderRadius: isPortrait ? 22 : 20,
              padding: isPortrait ? 20 : 16,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 6,
              borderWidth: 3,
              borderColor: COLORS.primary.sage,
              alignItems: "center",
            }}>
              <Text style={{
                fontSize: isPortrait ? 20 : 18,
                fontWeight: "700",
                color: COLORS.text.primary,
                textAlign: "center",
                lineHeight: isPortrait ? 28 : 26,
                marginBottom: 12,
              }}>
                {quiz.question}
              </Text>
              
              <TouchableOpacity 
                style={{
                  width: isPortrait ? 55 : 50,
                  height: isPortrait ? 55 : 50,
                  borderRadius: 14,
                  backgroundColor: COLORS.primary.green,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: COLORS.primary.green,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 5,
                  borderWidth: 3,
                  borderColor: COLORS.neutral.white,
                }}
                onPress={speakQuestion}
                activeOpacity={0.8}
              >
                <Image
                  source={icons.speaker}
                  style={{
                    width: 28,
                    height: 28,
                    tintColor: COLORS.neutral.white,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* الخيارات */}
          <View style={{
            flexDirection: isPortrait ? "column" : "row",
            gap: isPortrait ? 16 : 14,
            justifyContent: "center",
            flexWrap: isPortrait ? "nowrap" : "wrap",
            alignItems: isPortrait ? "stretch" : "flex-start",
          }}>
            {shuffledOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                style={{
                  width: isPortrait
                    ? "100%"
                    : shuffledOptions.length === 1
                    ? Math.min(350, width * 0.6)
                    : "48%",
                  maxWidth: shuffledOptions.length === 1 && isPortrait ? 380 : undefined,
                  alignSelf: shuffledOptions.length === 1 ? "center" : undefined,
                  transform: [{ scale: selectedOption === option.id ? scaleAnim : 1 }],
                }}
              >
                <TouchableOpacity
                  onPress={() => handleOptionPress(option)}
                  disabled={showResult || isProcessing}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: COLORS.neutral.white,
                    borderRadius: isPortrait ? 20 : 18,
                    overflow: "hidden",
                    borderWidth: shuffledOptions.length === 1 ? 4 : 3,
                    borderColor: shuffledOptions.length === 1
                      ? COLORS.primary.green
                      : selectedOption === option.id
                      ? COLORS.primary.teal
                      : COLORS.neutral.cream,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 8,
                    elevation: 6,
                    backgroundColor:
                      showResult && selectedOption === option.id && isCorrect
                        ? COLORS.primary.sage
                        : showResult && selectedOption === option.id && !isCorrect
                        ? COLORS.secondary.peach
                        : COLORS.neutral.white,
                    transform: shuffledOptions.length === 1 ? [{ scale: 1.02 }] : undefined,
                  }}
                >
                  {/* الصورة */}
                  <View style={{
                    width: "100%",
                    height: getImageHeight(),
                    backgroundColor: COLORS.neutral.cream,
                  }}>
                    <Image
                      source={option.image}
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      resizeMode="cover"
                    />
                  </View>

                  {/* النص */}
                  <View style={{
                    padding: isPortrait ? 14 : 12,
                    backgroundColor: "transparent",
                    minHeight: isPortrait ? 60 : 55,
                    justifyContent: "center",
                  }}>
                    <Text style={{
                      fontSize: isPortrait ? 16 : 15,
                      fontWeight: "700",
                      color: COLORS.text.primary,
                      textAlign: "center",
                    }}>
                      {option.text}
                    </Text>
                  </View>

                  {/* علامة صح/خطأ */}
                  {showResult && selectedOption === option.id && (
                    <View style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: isPortrait ? 55 : 50,
                      height: isPortrait ? 55 : 50,
                      borderRadius: 14,
                      backgroundColor: COLORS.neutral.white,
                      justifyContent: "center",
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.25,
                      shadowRadius: 5,
                      elevation: 6,
                      borderWidth: 3,
                      borderColor: COLORS.neutral.white,
                      padding: 6,
                    }}>
                      <Image 
                        source={isCorrect ? icons.correct : icons.wrong} 
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </ScrollView>

        {/* رسالة النجاح - في الأعلى */}
        {showResult && isCorrect && (
          <Animated.View
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 60 : 70,
              left: 20,
              right: 20,
              backgroundColor: COLORS.neutral.white,
              borderRadius: isPortrait ? 25 : 22,
              padding: isPortrait ? 24 : 20,
              alignItems: "center",
              shadowColor: COLORS.primary.green,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 10,
              borderWidth: 4,
              borderColor: COLORS.primary.green,
              opacity: starAnim,
              transform: [
                {
                  scale: starAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            }}
          >
            <Image
              source={icons.star}
              style={{
                width: isPortrait ? 75 : 65,
                height: isPortrait ? 75 : 65,
                marginBottom: 12,
              }}
              resizeMode="contain"
            />
            <Text style={{
              fontSize: isPortrait ? 24 : 22,
              fontWeight: "900",
              color: COLORS.primary.green,
              marginBottom: 6,
            }}>
              أحسنت يا {childName}!
            </Text>
            <Text style={{
              fontSize: isPortrait ? 16 : 15,
              fontWeight: "600",
              color: COLORS.text.secondary,
              marginBottom: 10,
            }}>
              حصلت على نجمة
            </Text>
            
            <Animated.View
              style={{
                marginTop: 8,
                backgroundColor: COLORS.secondary.yellow,
                paddingHorizontal: isPortrait ? 20 : 18,
                paddingVertical: isPortrait ? 10 : 8,
                borderRadius: 18,
                borderWidth: 3,
                borderColor: COLORS.neutral.white,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.18,
                shadowRadius: 5,
                elevation: 5,
                opacity: pointsAnim,
                transform: [
                  {
                    translateY: pointsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <Text style={{
                fontSize: isPortrait ? 20 : 18,
                fontWeight: "900",
                color: COLORS.neutral.white,
              }}>
                +{attempts === 0 ? 15 : 10} نقطة 🎉
              </Text>
            </Animated.View>
          </Animated.View>
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
});