import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { useState, useCallback, useRef } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { getWords } from "../storage/wordsStorage";
import { getCategories } from "../storage/categoriesStorage";
import { trackWordUsage } from "../storage/wordsTracking";
import { addStars, updateDailyStreak, checkAchievements } from "../storage/rewardsTracking";
import { addDailyProgress, PROGRESS_REASONS } from "../storage/dailyLionProgress";
import { useFocusEffect } from "@react-navigation/native";

let currentSound = null;

export default function AACScreen({ navigation }) {
  const [sentence, setSentence] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("fav");
  const [words, setWords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pressedWord, setPressedWord] = useState(null);
  const [showStars, setShowStars] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);

  const starsAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );

      const loadData = async () => {
        const storedWords = await getWords();
        const storedCategories = await getCategories();

        const favorites = storedWords.filter((w) => w.favorite);
        const others = storedWords.filter((w) => !w.favorite);

        setWords([
          ...favorites.map((w) => ({ ...w, category: "fav" })),
          ...others,
        ]);

        setCategories([
          { id: "fav", name: "المفضلة", icon: "⭐" },
          ...storedCategories,
        ]);
      };

      loadData();
      updateDailyStreak();
    }, [])
  );

  const showStarsAnimation = (stars) => {
    setStarsEarned(stars);
    setShowStars(true);
    starsAnim.setValue(0);

    Animated.sequence([
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(starsAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowStars(false);
    });
  };

  const playWordAudio = async (word) => {
    setSentence((prev) => [...prev, word]);

    try {
      await trackWordUsage(word.id, word.text);
      const result = await addStars(1, `استخدام كلمة: ${word.text}`);
      
      // 🦁 إضافة تقدم يومي عند استخدام كلمة
      const progressResult = await addDailyProgress(1, PROGRESS_REASONS.AAC_WORD_USED);
      if (progressResult && !progressResult.maxReached) {
        console.log(`🦁 ${progressResult.message}`);
      }
      
      const allWords = await getWords();
      const uniqueWordsUsed = new Set(allWords.map(w => w.id)).size;
      await checkAchievements("word", uniqueWordsUsed);
      
      if (result) {
        showStarsAnimation(result.starsAdded);
      }
    } catch (error) {
      console.log("خطأ في تسجيل النجوم:", error);
    }

    setPressedWord(word.id);
    setTimeout(() => setPressedWord(null), 300);

    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    Speech.stop();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    if (word.useTTS) {
      Speech.speak(word.text, { language: "ar", rate: 0.55, pitch: 1.2 });
    } else if (word.audioUri) {
      const { sound } = await Audio.Sound.createAsync(
        typeof word.audioUri === "string"
          ? { uri: word.audioUri }
          : word.audioUri,
        { shouldPlay: true }
      );

      currentSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          currentSound = null;
        }
      });
    } else {
      Speech.speak(word.text, { language: "ar", rate: 0.55, pitch: 1.2 });
    }
  };

  const speakSentence = async () => {
    if (!sentence.length) return;

    Speech.stop();
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    for (let i = 0; i < sentence.length; i++) {
      const word = sentence[i];

      await new Promise((resolve) => {
        if (word.useTTS) {
          Speech.speak(word.text, {
            language: "ar",
            rate: 0.55,
            pitch: 1.2,
            onDone: resolve,
          });
        } else if (word.audioUri) {
          Audio.Sound.createAsync(
            typeof word.audioUri === "string"
              ? { uri: word.audioUri }
              : word.audioUri,
            { shouldPlay: true }
          ).then(({ sound }) => {
            currentSound = sound;

            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.didJustFinish) {
                sound.unloadAsync();
                currentSound = null;
                resolve();
              }
            });
          });
        } else {
          Speech.speak(word.text, {
            language: "ar",
            rate: 0.55,
            pitch: 1.2,
            onDone: resolve,
          });
        }
      });

      if (i < sentence.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
    
    // 🦁 مكافأة إضافية لتكوين جملة كاملة
    if (sentence.length >= 3) {
      await addStars(3, "تكوين جملة كاملة");
      showStarsAnimation(3);
      await addDailyProgress(1, PROGRESS_REASONS.SENTENCE_FORMED);
    }
  };

  return (
    <View style={styles.container}>
      {showStars && (
        <Animated.View
          style={[
            styles.starsPopup,
            {
              opacity: starsAnim,
              transform: [
                {
                  translateY: starsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
                {
                  scale: starsAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.2, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.starsText}>+{starsEarned} ⭐</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.homeButton}
        >
          <Text style={styles.homeIcon}>🏠</Text>
        </TouchableOpacity>

        <View style={styles.sentenceBar}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.sentenceScroll}
            showsHorizontalScrollIndicator={false}
          >
            {sentence.length === 0 ? (
              <View style={styles.emptyMessage}>
                <Text style={styles.emptyIcon}>👆</Text>
                <Text style={styles.emptyText}>اختر كلمات</Text>
              </View>
            ) : (
              sentence.map((w, i) => (
                <View key={i} style={styles.sentenceWord}>
                  {w.imageUri && (
                    <Image
                      source={{ uri: w.imageUri }}
                      style={styles.sentenceImage}
                    />
                  )}
                  <Text style={styles.sentenceText} numberOfLines={1}>
                    {w.text}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={speakSentence}
            style={[
              styles.controlButton,
              styles.speakButton,
              sentence.length === 0 && styles.buttonDisabled,
            ]}
            disabled={sentence.length === 0}
          >
            <Text style={styles.controlIcon}>🔊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSentence(sentence.slice(0, -1))}
            style={[
              styles.controlButton,
              styles.backspaceButton,
              sentence.length === 0 && styles.buttonDisabled,
            ]}
            disabled={sentence.length === 0}
          >
            <Text style={styles.controlIcon}>⌫</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSentence([])}
            style={[
              styles.controlButton,
              styles.clearButton,
              sentence.length === 0 && styles.buttonDisabled,
            ]}
            disabled={sentence.length === 0}
          >
            <Text style={styles.controlIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.wordsArea}>
          <ScrollView
            contentContainerStyle={styles.wordsGrid}
            showsVerticalScrollIndicator={false}
          >
            {words.filter((w) => w.category === selectedCategory).length ===
            0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🔍</Text>
                <Text style={styles.emptyStateText}>لا توجد كلمات</Text>
              </View>
            ) : (
              words
                .filter((w) => w.category === selectedCategory)
                .map((word) => (
                  <TouchableOpacity
                    key={word.id}
                    style={[
                      styles.wordCard,
                      pressedWord === word.id && styles.wordCardPressed,
                    ]}
                    onPress={() => playWordAudio(word)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.wordImageContainer}>
                      {word.imageUri ? (
                        <Image
                          source={{ uri: word.imageUri }}
                          style={styles.wordImage}
                        />
                      ) : (
                        <View style={styles.wordPlaceholder}>
                          <Text style={styles.placeholderEmoji}>💬</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.wordLabel}>
                      <Text style={styles.wordText} numberOfLines={2}>
                        {word.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
            )}
          </ScrollView>
        </View>

        <View style={styles.categoriesPanel}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && styles.categoryActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <View style={styles.categoryIconContainer}>
                  {cat.imageUri ? (
                    <Image
                      source={{ uri: cat.imageUri }}
                      style={styles.categoryImage}
                    />
                  ) : (
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                  numberOfLines={2}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

  starsPopup: {
    position: "absolute",
    top: "40%",
    left: "50%",
    marginLeft: -75,
    zIndex: 1000,
    backgroundColor: "#FFD700",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  starsText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7FA896",
    paddingVertical: 12,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  homeButton: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  homeIcon: {
    fontSize: 36,
  },

  sentenceBar: {
    flex: 1,
    height: 65,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginRight: 12,
    paddingHorizontal: 12,
    borderWidth: 3,
    borderColor: "#E8C68E",
  },
  sentenceScroll: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 5,
  },
  emptyMessage: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.4,
  },
  emptyIcon: {
    fontSize: 28,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 18,
    color: "#7A7A7A",
    fontWeight: "600",
  },
  sentenceWord: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#E8C68E",
    borderRadius: 12,
    padding: 6,
    marginHorizontal: 4,
    minWidth: 65,
    borderWidth: 2,
    borderColor: "#D9B57B",
  },
  sentenceImage: {
    width: 35,
    height: 35,
    borderRadius: 8,
    marginBottom: 3,
  },
  sentenceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4A4A4A",
    textAlign: "center",
  },

  controls: {
    flexDirection: "row",
  },
  controlButton: {
    width: 65,
    height: 65,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  speakButton: {
    backgroundColor: "#5B8A8F",
  },
  backspaceButton: {
    backgroundColor: "#D9956C",
  },
  clearButton: {
    backgroundColor: "#B87B5B",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  controlIcon: {
    fontSize: 32,
  },

  mainContent: {
    flex: 1,
    flexDirection: "row",
  },

  wordsArea: {
    flex: 1,
    padding: 15,
  },
  wordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingBottom: 20,
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    marginTop: 60,
  },
  emptyStateIcon: {
    fontSize: 80,
    opacity: 0.3,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 20,
    color: "#9A9A9A",
    fontWeight: "600",
  },

  wordCard: {
    width: 155,
    height: 165,
    margin: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 5,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  wordCardPressed: {
    borderColor: "#7FA896",
    transform: [{ scale: 0.95 }],
  },
  wordImageContainer: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  wordImage: {
    width: "100%",
    height: "100%",
  },
  wordPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  placeholderEmoji: {
    fontSize: 60,
  },
  wordLabel: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 45,
  },
  wordText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A4A4A",
    textAlign: "center",
  },

  categoriesPanel: {
    width: 140,
    backgroundColor: "#B5C9B4",
    borderLeftWidth: 4,
    borderLeftColor: "#9AB399",
  },
  categoriesList: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  categoryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 8,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
    minHeight: 100,
  },
  categoryActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#7FA896",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  categoryIconContainer: {
    marginBottom: 6,
  },
  categoryImage: {
    width: 55,
    height: 55,
    borderRadius: 27,
  },
  categoryEmoji: {
    fontSize: 45,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A6B6F",
    textAlign: "center",
  },
  categoryTextActive: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A6B6F",
  },
});