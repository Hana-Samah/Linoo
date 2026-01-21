import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { getChildInfo } from "../storage/childStorage";
import { addStar, saveQuizResult, getQuizResults } from "../data/stories";
import {
  addPoints,
  checkAchievements,
  updateWeeklyGoals,
} from "../storage/rewardsTracking";
import { addDailyProgress } from "../storage/dailyLionProgress";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { COLORS } from "../styles/colors";

const icons = {
  speaker: require("../../assets/speaker-icon.png"),
  correct: require("../../assets/correct-icon.png"),
  wrong: require("../../assets/wrong-icon.png"),
  star: require("../../assets/lion/lion_8.png"),
};

export default function QuizScreen({ navigation, route }) {
  const { quiz, storyId, storyTitle } = route.params;
  const [childName, setChildName] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [frozenOptions, setFrozenOptions] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window"),
  );

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;

  const soundRef = useRef(null);
  const isPortrait = screenDimensions.height > screenDimensions.width;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

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

        const { sound } = await Audio.Sound.createAsync(quiz.questionAudio, {
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

        const { sound } = await Audio.Sound.createAsync(option.audio, {
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
          { shouldPlay: true },
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

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (option.isCorrect) {
      console.log("✅ إجابة صحيحة!");

      setIsCorrect(true);
      setShowResult(true);

      const quizResults = await saveQuizResult(storyId, true);
      await addStar();

      const pointsToAdd = attempts === 0 ? 15 : 10;
      await addPoints(pointsToAdd, `إجابة صحيحة في سؤال "${storyTitle}"`);
      await updateWeeklyGoals("quiz");

      const progressResult = await addDailyProgress(
        "QUIZ_CORRECT",
        "إجابة صحيحة",
      );
      if (progressResult && progressResult.hairGrown) {
        console.log(`🦁 ${progressResult.message}`);
      }

      let totalCorrectAnswers = 0;
      Object.values(quizResults).forEach((storyResults) => {
        totalCorrectAnswers += storyResults.filter((r) => r.isCorrect).length;
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

      await speakEncouragement("correct");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("📙 الرجوع لقائمة القصص");
      navigation.navigate("Learning");
    } else {
      console.log(`❌ إجابة خاطئة - المحاولة ${attempts + 1}`);

      setIsCorrect(false);
      setShowResult(true);

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      await speakEncouragement("try_again");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setShowResult(false);
      setSelectedOption(null);
      setIsProcessing(false);

      const wrongIndex = shuffledOptions.findIndex(
        (opt) => opt.id === option.id,
      );
      const newOptions = shuffledOptions.filter((opt) => opt.id !== option.id);
      setShuffledOptions(newOptions);

      if (newOptions.length === 1) {
        console.log("💡 بقي خيار واحد فقط");
      }

      return;
    }

    setIsProcessing(false);
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

        {/* الهيدر */}
        <View style={[styles.header, isPortrait && styles.headerPortrait]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🎯 الاختبار</Text>
          </View>

          {attempts > 0 && (
            <View style={styles.attemptsIndicator}>
              <Text style={styles.attemptsText}>محاولة {attempts}</Text>
            </View>
          )}
        </View>

        {/* السؤال */}
        <View style={styles.questionSection}>
          <View style={styles.questionBubble}>
            <Text style={styles.questionText}>{quiz.question}</Text>

            <TouchableOpacity
              style={styles.speakerButton}
              onPress={speakQuestion}
              activeOpacity={0.8}
            >
              <Image
                source={icons.speaker}
                style={styles.speakerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* الخيارات */}
        <View
          style={[styles.optionsRow, isPortrait && styles.optionsRowPortrait]}
        >
          {shuffledOptions.map((option, index) => (
            <Animated.View
              key={option.id}
              style={[
                styles.optionWrapper,
                shuffledOptions.length === 1 && styles.optionWrapperSingle,
                isPortrait && styles.optionWrapperPortrait,
                {
                  transform: [
                    { scale: selectedOption === option.id ? scaleAnim : 1 },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleOptionPress(option)}
                disabled={showResult || isProcessing}
                activeOpacity={0.85}
                style={[
                  styles.optionCard,
                  shuffledOptions.length === 1 && styles.optionCardSingle,
                  selectedOption === option.id && styles.optionSelected,
                  showResult &&
                    selectedOption === option.id &&
                    isCorrect &&
                    styles.optionCorrect,
                  showResult &&
                    selectedOption === option.id &&
                    !isCorrect &&
                    styles.optionWrong,
                ]}
              >
                {/* الصورة */}
                <View style={styles.imageContainer}>
                  <Image
                    source={option.image}
                    style={styles.optionImage}
                    resizeMode="cover"
                  />
                </View>

                {/* النص */}
                <View style={styles.textContainer}>
                  <Text style={styles.optionText}>{option.text}</Text>
                </View>

                {/* علامة صح/خطأ */}
                {showResult && selectedOption === option.id && (
                  <View style={styles.resultBadge}>
                    <Image
                      source={isCorrect ? icons.correct : icons.wrong}
                      style={styles.resultIcon}
                      resizeMode="contain"
                    />
                  </View>
                )}

                {shuffledOptions.length === 1 && (
                  <View style={styles.pressHereBadge}>
                    <Text style={styles.pressHereText}>👆 اضغط هنا</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* رسالة النجاح */}
        {showResult && isCorrect && (
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: starAnim,
                transform: [
                  {
                    scale: starAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              source={icons.star}
              style={styles.starIcon}
              resizeMode="contain"
            />
            <Text style={styles.successText}>أحسنت يا {childName}!</Text>
            <Text style={styles.successSubtext}>حصلت على نجمة</Text>

            <Animated.View
              style={[
                styles.pointsContainer,
                {
                  opacity: pointsAnim,
                  transform: [
                    {
                      translateY: pointsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.pointsText}>
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
    padding: 20,
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

  /* الهيدر */
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 10 : 0,
  },
  headerPortrait: {
    paddingTop: Platform.OS === "ios" ? 10 : 0,
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.secondary.orange,
  },

  attemptsIndicator: {
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.secondary.rust,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  attemptsText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.secondary.rust,
  },

  /* السؤال */
  questionSection: {
    marginBottom: 25,
    alignItems: "center",
  },
  questionBubble: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 25,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: COLORS.primary.sage,
    alignItems: "center",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
    lineHeight: 32,
  },
  speakerButton: {
    marginTop: 16,
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: COLORS.primary.green,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
  },
  speakerIcon: {
    width: 32,
    height: 32,
    tintColor: COLORS.neutral.white,
  },

  /* الخيارات */
  optionsRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  optionsRowPortrait: {
    flexDirection: "column",
    gap: 20,
  },
  optionWrapper: {
    flex: 1,
    maxWidth: "48%",
  },
  optionWrapperPortrait: {
    maxWidth: "100%",
    width: "100%",
  },
  optionWrapperSingle: {
    maxWidth: 350,
  },
  optionCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: COLORS.neutral.cream,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  optionCardSingle: {
    borderWidth: 5,
    borderColor: COLORS.primary.green,
    transform: [{ scale: 1.05 }],
  },
  optionSelected: {
    borderColor: COLORS.primary.teal,
  },
  optionCorrect: {
    borderColor: COLORS.primary.green,
    backgroundColor: COLORS.primary.sage,
  },
  optionWrong: {
    borderColor: COLORS.secondary.rust,
    backgroundColor: COLORS.secondary.peach,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.neutral.cream,
  },
  optionImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    padding: 16,
    backgroundColor: COLORS.neutral.white,
    minHeight: 70,
    justifyContent: "center",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
  },
  resultBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
    padding: 8,
  },
  resultIcon: {
    width: "100%",
    height: "100%",
  },

  pressHereBadge: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pressHereText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary.green,
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.primary.green,
  },

  /* رسالة النجاح */
  successContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 30,
    padding: 32,
    alignItems: "center",
    shadowColor: COLORS.primary.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 5,
    borderColor: COLORS.primary.green,
  },
  starIcon: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  successText: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary.green,
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.secondary,
    marginBottom: 12,
  },

  pointsContainer: {
    marginTop: 12,
    backgroundColor: COLORS.secondary.yellow,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  pointsText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.neutral.white,
  },
});
