import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { getChildInfo } from "../storage/childStorage";
import { addStar, saveQuizResult, getQuizResults } from "../data/stories";
import { addPoints, checkAchievements, updateWeeklyGoals } from "../storage/rewardsTracking";
import { addDailyProgress, PROGRESS_REASONS } from "../storage/dailyLionProgress";
import * as Speech from "expo-speech";

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

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadChildName();
    shuffleOptions();
    speakQuestion();
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
  };

  const speakOption = async (optionText) => {
    return new Promise((resolve) => {
      Speech.speak(optionText, {
        language: "ar",
        rate: 0.55,
        pitch: 1.2,
        onDone: resolve,
        onStopped: resolve,
        onError: resolve,
      });
    });
  };

  const speakEncouragement = async (text) => {
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: "ar",
        rate: 0.55,
        pitch: 1.3,
        onDone: resolve,
        onStopped: resolve,
        onError: resolve,
      });
    });
  };

  const handleOptionPress = async (option) => {
    if (isProcessing || showResult) return;
    
    setIsProcessing(true);
    
    await speakOption(option.text);
    
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
      
      // 🦁 إضافة تقدم يومي عند إجابة صحيحة
      await addDailyProgress(1, PROGRESS_REASONS.QUIZ_CORRECT);
      
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

      const encouragements = attempts === 0 
        ? [
            `ممتاز يا ${childName}! إجابة صحيحة من أول مرة!`,
            `رائع يا ${childName}! أنت ذكي جداً!`,
            `أحسنت يا ${childName}! مبدع!`,
          ]
        : [
            `أحسنت يا ${childName}! إجابة رائعة!`,
            `برافو يا ${childName}!`,
            `ممتاز يا ${childName}!`,
          ];
      
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      
      await speakEncouragement(randomEncouragement);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("📙 الرجوع لقائمة القصص");
      navigation.navigate("Transition", {
        nextScreen: "Learning",
        nextActivity: "قائمة القصص",
        activityIcon: "📚",
        message: "رائع! لنختار قصة جديدة",
        countdown: 2,
      });
      
    } else {
      console.log(`❌ إجابة خاطئة - المحاولة ${attempts + 1}`);
      
      setIsCorrect(false);
      setShowResult(true);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      await speakEncouragement("حاول مرة أخرى");
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (newAttempts === 1) {
        console.log("🔄 المحاولة الثانية: نفس الترتيب");
        setShuffledOptions(frozenOptions);
      } else if (newAttempts >= 2) {
        console.log("✅ المحاولة الثالثة: الإجابة الصحيحة فقط");
        const correctAnswer = quiz.options.find(opt => opt.isCorrect);
        setShuffledOptions([correctAnswer]);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        await speakEncouragement("هذه هي الإجابة الصحيحة");
      }
      
      setSelectedOption(null);
      setShowResult(false);
      setIsProcessing(false);
      
      await speakQuestion();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />

      <View style={styles.container}>
        {/* الهيدر */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🎯</Text>
            <Text style={styles.headerTitle}>اختبار القصة</Text>
          </View>
          
          {attempts > 0 && (
            <View style={styles.attemptsIndicator}>
              <Text style={styles.attemptsText}>المحاولة {attempts + 1}</Text>
            </View>
          )}
        </View>

        {/* السؤال */}
        <View style={styles.questionSection}>
          <View style={styles.questionBubble}>
            <Text style={styles.questionText}>{quiz.question}</Text>
          </View>

          <TouchableOpacity 
            style={styles.speakerButton} 
            onPress={speakQuestion}
            disabled={isProcessing}
          >
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
        </View>

        {/* الخيارات */}
        <View style={styles.optionsRow}>
          {shuffledOptions.map((option) => (
            <Animated.View
              key={option.id}
              style={[
                styles.optionWrapper,
                shuffledOptions.length === 1 && styles.optionWrapperSingle,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedOption === option.id && styles.optionSelected,
                  showResult &&
                    selectedOption === option.id &&
                    (isCorrect ? styles.optionCorrect : styles.optionWrong),
                  shuffledOptions.length === 1 && styles.optionCardSingle,
                ]}
                onPress={() => handleOptionPress(option)}
                disabled={showResult || isProcessing}
                activeOpacity={0.8}
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
                    <Text style={styles.resultIcon}>
                      {isCorrect ? "✓" : "✗"}
                    </Text>
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
            <Text style={styles.starIcon}>⭐</Text>
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
    backgroundColor: "#FAF8F5",
  },
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3436",
  },
  
  attemptsIndicator: {
    backgroundColor: "#FFE8E8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  attemptsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6B6B",
  },

  questionSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  questionBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    borderColor: "#7FA896",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D3436",
    textAlign: "center",
    lineHeight: 32,
  },
  speakerButton: {
    marginTop: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7FA896",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7FA896",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  speakerIcon: {
    fontSize: 28,
  },

  optionsRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  optionWrapper: {
    flex: 1,
    maxWidth: "48%",
  },
  optionWrapperSingle: {
    maxWidth: 280,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#E8EAED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  optionCardSingle: {
    borderWidth: 6,
    borderColor: "#7FA896",
    transform: [{ scale: 1.1 }],
  },
  optionSelected: {
    borderColor: "#7FA896",
  },
  optionCorrect: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  optionWrong: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFEBEE",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#F8F9FA",
  },
  optionImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3436",
    textAlign: "center",
  },
  resultBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  resultIcon: {
    fontSize: 28,
    fontWeight: "bold",
  },
  
  pressHereBadge: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pressHereText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7FA896",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#7FA896",
  },

  successContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: "#4CAF50",
  },
  starIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  successText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 18,
    color: "#636E72",
    marginBottom: 12,
  },
  
  pointsContainer: {
    marginTop: 12,
    backgroundColor: "#FFD700",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  pointsText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
});