import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { Audio, Video } from "expo-av";
import * as Speech from "expo-speech";
import { incrementReadCount } from "../data/stories";
import { addPoints, checkAchievements, updateWeeklyGoals } from "../storage/rewardsTracking";
import { addDailyProgress, PROGRESS_REASONS } from "../storage/dailyLionProgress";
import { COLORS } from "../styles/colors";

export default function StoryReaderScreen({ navigation, route }) {
  const { story } = route.params;
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );

  const currentScene = story.scenes[currentSceneIndex];
  const isFirstScene = currentSceneIndex === 0;
  const isLastScene = currentSceneIndex === story.scenes.length - 1;
  const isPortrait = screenDimensions.height > screenDimensions.width;

  const soundRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    ScreenOrientation.unlockAsync();

    incrementReadCount(story.id);

    return () => {
      Speech.stop();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playCurrentScene();
    }

    return () => {
      Speech.stop();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [currentSceneIndex, isPlaying]);

  const playCurrentScene = async () => {
    setIsReading(true);

    Speech.stop();
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    await new Promise((resolve) => {
      if (currentScene.audio) {
        Audio.Sound.createAsync(currentScene.audio, {
          shouldPlay: true,
        }).then(({ sound }) => {
          soundRef.current = sound;

          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              sound.unloadAsync();
              soundRef.current = null;
              setIsReading(false);
              resolve();
            }
          });
        }).catch((error) => {
          console.error("Error playing audio:", error);
          setIsReading(false);
          resolve();
        });
      } else {
        Speech.speak(currentScene.text, {
          language: "ar",
          pitch: 1.2,
          rate: 0.85,
          onDone: () => {
            setIsReading(false);
            resolve();
          },
          onStopped: () => {
            setIsReading(false);
            resolve();
          },
          onError: (error) => {
            console.error("Speech error:", error);
            setIsReading(false);
            resolve();
          },
        });
      }
    });

    if (!isLastScene && isPlaying) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      goToNextScene();
    }
  };

  const goToNextScene = () => {
    if (!isLastScene) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const goToPreviousScene = () => {
    if (!isFirstScene) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      Speech.stop();
      if (soundRef.current) {
        soundRef.current.pauseAsync();
      }
      setIsPlaying(false);
      setIsReading(false);
    } else {
      setIsPlaying(true);
      playCurrentScene();
    }
  };

  const handleClose = () => {
    Speech.stop();
    if (soundRef.current) {
      soundRef.current.unloadAsync();
    }
    navigation.goBack();
  };

  const handleQuiz = async () => {
    Speech.stop();
    if (soundRef.current) {
      soundRef.current.unloadAsync();
    }
    
    if (!storyCompleted) {
      await addPoints(20, `إنهاء قصة: ${story.title}`);
      await updateWeeklyGoals("story");
      
      const readCount = await incrementReadCount(story.id);
      await checkAchievements("story", readCount);
      
      const progressResult = await addDailyProgress("STORY_COMPLETED", `إكمال قصة: ${story.title}`);
      if (progressResult && progressResult.hairGrown) {
        console.log(`🦁 ${progressResult.message}`);
      }
      
      setStoryCompleted(true);
    }
    
    navigation.navigate("Quiz", {
      quiz: story.quiz,
      storyId: story.id,
      storyTitle: story.title,
    });
  };

  return (
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
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <Text style={[styles.storyTitle, isPortrait && styles.storyTitlePortrait]} numberOfLines={1}>
          {story.title}
        </Text>

        <View style={styles.pageCounter}>
          <Text style={styles.pageText}>
            {currentSceneIndex + 1}/{story.scenes.length}
          </Text>
        </View>
      </View>

      {/* المحتوى الرئيسي */}
      <View style={[styles.mainContent, isPortrait && styles.mainContentPortrait]}>
        {/* الصورة أو الفيديو */}
        <View style={[styles.mediaContainer, isPortrait && styles.mediaContainerPortrait]}>
          {currentScene.video ? (
            <Video
              ref={videoRef}
              source={currentScene.video}
              style={styles.media}
              resizeMode="contain"
              shouldPlay={isPlaying}
              isLooping={false}
              useNativeControls={false}
              onPlaybackStatusUpdate={(status) => {
                if (status.didJustFinish) {
                  console.log("Video finished");
                }
              }}
            />
          ) : (
            <Image
              source={currentScene.image}
              style={styles.media}
              resizeMode="contain"
            />
          )}
        </View>

        {/* النص ومؤشر التقدم */}
        <View style={[styles.textSection, isPortrait && styles.textSectionPortrait]}>
          {/* مؤشر التقدم */}
          <View style={styles.progressContainer}>
            {story.scenes.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentSceneIndex && styles.dotActive,
                  index < currentSceneIndex && styles.dotCompleted,
                ]}
              />
            ))}
          </View>

          {/* النص */}
          <View style={styles.textContainer}>
            <Text style={[styles.sceneText, isReading && styles.textReading]}>
              {currentScene.text}
            </Text>
          </View>

          {/* أزرار التحكم */}
          <View style={styles.controlsContainer}>
            {!isLastScene ? (
              <>
                {/* السابق */}
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    isFirstScene && styles.navButtonDisabled,
                  ]}
                  onPress={goToPreviousScene}
                  disabled={isFirstScene}
                  activeOpacity={0.8}
                >
                  <Text style={styles.navIcon}>◀</Text>
                </TouchableOpacity>

                {/* تشغيل/إيقاف */}
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={togglePlayPause}
                  activeOpacity={0.8}
                >
                  <Text style={styles.mainIcon}>{isPlaying ? "⏸" : "▶"}</Text>
                </TouchableOpacity>

                {/* التالي */}
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    isLastScene && styles.navButtonDisabled,
                  ]}
                  onPress={goToNextScene}
                  disabled={isLastScene}
                  activeOpacity={0.8}
                >
                  <Text style={styles.navIcon}>▶</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* في آخر مشهد - زر الرجوع + زر الكويز */
              <>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={goToPreviousScene}
                  activeOpacity={0.8}
                >
                  <Text style={styles.navIcon}>◀</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quizButton}
                  onPress={handleQuiz}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={require("../../assets/quiz-icon.png")}
                    style={styles.quizImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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

  /* ====== الهيدر ====== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    zIndex: 100,
  },
  headerPortrait: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 15,
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary.teal,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
  },
  closeIcon: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.neutral.white,
  },
  storyTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.secondary.orange,
    textAlign: "center",
    marginHorizontal: 10,
  },
  storyTitlePortrait: {
    fontSize: 18,
  },
  pageCounter: {
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.primary.sage,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  pageText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
  },

  /* ====== المحتوى الرئيسي ====== */
  mainContent: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
    gap: 20,
  },
  mainContentPortrait: {
    flexDirection: "column",
    padding: 15,
    gap: 15,
  },

  /* ====== الصورة/الفيديو ====== */
  mediaContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 4,
    borderColor: COLORS.primary.sage,
  },
  mediaContainerPortrait: {
    flex: 2,
    borderRadius: 25,
    borderWidth: 3,
  },
  media: {
    width: "100%",
    height: "100%",
  },

  /* ====== قسم النص ====== */
  textSection: {
    flex: 1,
    justifyContent: "space-between",
  },
  textSectionPortrait: {
    flex: 1,
  },

  /* ====== مؤشر التقدم ====== */
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: COLORS.secondary.orange,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
    shadowColor: COLORS.secondary.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  dotCompleted: {
    backgroundColor: COLORS.primary.green,
  },

  /* ====== النص ====== */
  textContainer: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 25,
    minHeight: 120,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 4,
    borderColor: COLORS.primary.sage,
  },
  sceneText: {
    fontSize: 22,
    textAlign: "center",
    color: COLORS.text.primary,
    fontWeight: "700",
    lineHeight: 34,
  },
  textReading: {
    color: COLORS.primary.green,
  },

  /* ====== أزرار التحكم ====== */
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    gap: 15,
  },
  navButton: {
    backgroundColor: COLORS.primary.green,
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
  },
  navButtonDisabled: {
    backgroundColor: "#D0D0D0",
    opacity: 0.5,
  },
  navIcon: {
    fontSize: 36,
    color: COLORS.neutral.white,
  },
  mainButton: {
    backgroundColor: COLORS.secondary.orange,
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 5,
    borderColor: COLORS.neutral.white,
  },
  mainIcon: {
    fontSize: 48,
    color: COLORS.neutral.white,
  },

  /* ====== زر الكويز ====== */
  quizButton: {
    backgroundColor: COLORS.neutral.white,
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 15,
    borderWidth: 5,
    borderColor: COLORS.secondary.yellow,
    overflow: "hidden",
  },
  quizImage: {
    width: "100%",
    height: "100%",
  },
});