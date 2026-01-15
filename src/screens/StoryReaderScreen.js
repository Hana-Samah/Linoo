import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { Audio, Video } from "expo-av";
import * as Speech from "expo-speech";
import { incrementReadCount } from "../data/stories";
import { addPoints, checkAchievements, updateWeeklyGoals } from "../storage/rewardsTracking";
import { addDailyProgress, PROGRESS_REASONS } from "../storage/dailyLionProgress";

const { width, height } = Dimensions.get("window");

export default function StoryReaderScreen({ navigation, route }) {
  const { story } = route.params;
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [storyCompleted, setStoryCompleted] = useState(false);

  const currentScene = story.scenes[currentSceneIndex];
  const isFirstScene = currentSceneIndex === 0;
  const isLastScene = currentSceneIndex === story.scenes.length - 1;

  const soundRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

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
          rate: 0.55,
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
      
      // 🦁 إضافة تقدم يومي عند إكمال قصة
      await addDailyProgress(1, PROGRESS_REASONS.STORY_COMPLETED);
      
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
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.storyTitle} numberOfLines={1}>
          {story.title}
        </Text>

        <View style={styles.pageCounter}>
          <Text style={styles.pageText}>
            {currentSceneIndex + 1}/{story.scenes.length}
          </Text>
        </View>
      </View>

      {/* الصورة أو الفيديو */}
      <View style={styles.mediaContainer}>
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
          /* في آخر مشهد - نعرض زر الكويز */
          <TouchableOpacity
            style={styles.quizButton}
            onPress={handleQuiz}
            activeOpacity={0.8}
          >
            <Text style={styles.quizIcon}>🎯</Text>
            <Text style={styles.quizText}>ابدأ الاختبار</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },

  /* ====== الهيدر ====== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#D9956C",
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  storyTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginHorizontal: 10,
  },
  pageCounter: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* ====== الصورة/الفيديو ====== */
  mediaContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 6,
    borderColor: "#F0F0F0",
  },
  media: {
    width: "100%",
    height: "100%",
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
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: "#D9956C",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#D9956C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  dotCompleted: {
    backgroundColor: "#7FA896",
  },

  /* ====== النص ====== */
  textContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 25,
    paddingHorizontal: 25,
    borderRadius: 25,
    minHeight: 100,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 4,
    borderColor: "#F5F5F5",
  },
  sceneText: {
    fontSize: 22,
    textAlign: "center",
    color: "#4A6B6F",
    fontWeight: "600",
    lineHeight: 34,
  },
  textReading: {
    color: "#7FA896",
  },

  /* ====== أزرار التحكم ====== */
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 30,
  },
  navButton: {
    backgroundColor: "#7FA896",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  navButtonDisabled: {
    backgroundColor: "#D0D0D0",
    opacity: 0.5,
  },
  navIcon: {
    fontSize: 38,
    color: "#FFFFFF",
  },
  mainButton: {
    backgroundColor: "#D9956C",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 6,
    borderColor: "#FFFFFF",
  },
  mainIcon: {
    fontSize: 48,
    color: "#FFFFFF",
  },

  /* ====== زر الكويز ====== */
  quizButton: {
    backgroundColor: "#7FA896",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    gap: 12,
    shadowColor: "#7FA896",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 15,
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  quizIcon: {
    fontSize: 36,
  },
  quizText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});