import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { Audio, Video } from "expo-av";
import * as Speech from "expo-speech";
import { incrementReadCount } from "../data/stories";
import { addPoints, checkAchievements, updateWeeklyGoals } from "../storage/rewardsTracking";
import { addDailyProgress } from "../storage/dailyLionProgress";
import { COLORS } from "../styles/colors";

export default function StoryReaderScreen({ navigation, route }) {
  const { story } = route.params;
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const isSmallScreen = width < 375;

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

  // 🎯 حساب الأبعاد بناءً على الاتجاه
  const containerPadding = isPortrait ? 15 : 20;
  const headerHeight = isPortrait ? 60 : 50;
  // ✅ تصليح: استخدام undefined بدلاً من نسبة مئوية للعمودي
  const imageHeight = isPortrait 
    ? undefined  // سيأخذ المساحة المتاحة تلقائياً
    : undefined;
  const textMinHeight = isPortrait ? 70 : 60;
  const buttonSize = isPortrait ? 60 : 55;
  const buttonSizeLarge = isPortrait ? 75 : 70;

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

        {/* 📌 الهيدر */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "transparent",
          paddingVertical: isPortrait ? 10 : 8,
          paddingHorizontal: containerPadding,
          paddingTop: Platform.OS === "ios" ? 5 : 10,
          height: headerHeight,
          zIndex: 100,
        }}>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: isPortrait ? 45 : 42,
              height: isPortrait ? 45 : 42,
              borderRadius: isPortrait ? 22.5 : 21,
              backgroundColor: COLORS.primary.teal,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 5,
              elevation: 5,
              borderWidth: 3,
              borderColor: COLORS.neutral.white,
            }}
          >
            <Text style={{
              fontSize: isPortrait ? 22 : 20,
              fontWeight: "bold",
              color: COLORS.neutral.white,
            }}>✕</Text>
          </TouchableOpacity>

          <Text style={{
            flex: 1,
            fontSize: isPortrait ? (isSmallScreen ? 15 : 16) : 15,
            fontWeight: "800",
            color: COLORS.secondary.orange,
            textAlign: "center",
            marginHorizontal: 10,
          }} numberOfLines={1}>
            {story.title}
          </Text>

          <View style={{
            backgroundColor: COLORS.neutral.white,
            paddingHorizontal: isPortrait ? 12 : 10,
            paddingVertical: isPortrait ? 6 : 5,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: COLORS.primary.sage,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 3,
            elevation: 3,
          }}>
            <Text style={{
              fontSize: isPortrait ? 13 : 12,
              fontWeight: "700",
              color: COLORS.text.primary,
            }}>
              {currentSceneIndex + 1}/{story.scenes.length}
            </Text>
          </View>
        </View>

        {/* 📱 المحتوى الرئيسي */}
        <View style={{
          flex: 1,
          flexDirection: isPortrait ? "column" : "row",
          paddingHorizontal: containerPadding,
          paddingBottom: isPortrait ? 10 : 8,
          gap: isPortrait ? 10 : 16,
        }}>
          {/* 🖼️ الصورة أو الفيديو */}
          <View style={{
            flex: isPortrait ? 1.5 : 1.2,
            backgroundColor: COLORS.neutral.white,
            borderRadius: isPortrait ? 18 : 20,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
            borderWidth: 3,
            borderColor: COLORS.primary.sage,
          }}>
            {currentScene.video ? (
              <Video
                ref={videoRef}
                source={currentScene.video}
                style={{ width: "100%", height: "100%" }}
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
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            )}
          </View>

          {/* 📝 قسم النص والأزرار */}
          <View style={{
            flex: isPortrait ? 1 : 1,
            justifyContent: "space-between",
          }}>
            {/* 🔵 مؤشر التقدم */}
            <View style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: isPortrait ? 8 : 6,
            }}>
              {story.scenes.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: index === currentSceneIndex ? 12 : 8,
                    height: index === currentSceneIndex ? 12 : 8,
                    borderRadius: index === currentSceneIndex ? 6 : 4,
                    backgroundColor: index < currentSceneIndex
                      ? COLORS.primary.green
                      : index === currentSceneIndex
                      ? COLORS.secondary.orange
                      : "#E0E0E0",
                    marginHorizontal: 3,
                    borderWidth: index === currentSceneIndex ? 2 : 0,
                    borderColor: COLORS.neutral.white,
                    shadowColor: index === currentSceneIndex ? COLORS.secondary.orange : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 3,
                    elevation: index === currentSceneIndex ? 3 : 0,
                  }}
                />
              ))}
            </View>

            {/* 📖 النص */}
            <View style={{
              backgroundColor: COLORS.neutral.white,
              paddingVertical: isPortrait ? (isSmallScreen ? 12 : 14) : 12,
              paddingHorizontal: isPortrait ? 14 : 12,
              borderRadius: 18,
              minHeight: textMinHeight,
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 5,
              borderWidth: 3,
              borderColor: COLORS.primary.sage,
            }}>
              <Text style={{
                fontSize: isPortrait ? (isSmallScreen ? 15 : 16) : 15,
                textAlign: "center",
                color: isReading ? COLORS.primary.green : COLORS.text.primary,
                fontWeight: "700",
                lineHeight: isPortrait ? 24 : 22,
              }}>
                {currentScene.text}
              </Text>
            </View>

            {/* 🎮 أزرار التحكم */}
            <View style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: isPortrait ? 10 : 8,
              gap: 10,
            }}>
              {/* ⏮️ زر السابق */}
              <TouchableOpacity
                style={{
                  backgroundColor: isFirstScene ? "#D0D0D0" : COLORS.primary.green,
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: 14,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: isFirstScene ? 0.1 : 0.2,
                  shadowRadius: 6,
                  elevation: isFirstScene ? 3 : 6,
                  borderWidth: 3,
                  borderColor: COLORS.neutral.white,
                  opacity: isFirstScene ? 0.5 : 1,
                }}
                onPress={goToPreviousScene}
                disabled={isFirstScene}
                activeOpacity={0.8}
              >
                {/* ⚠️ تصحيح اتجاه السهم للجوال */}
                <Text style={{
                  fontSize: 26,
                  color: COLORS.neutral.white,
                }}>◀</Text>
              </TouchableOpacity>

              {/* ⏯️ زر التشغيل/الإيقاف */}
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.secondary.orange,
                  width: buttonSizeLarge,
                  height: buttonSizeLarge,
                  borderRadius: 18,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  elevation: 10,
                  borderWidth: 4,
                  borderColor: COLORS.neutral.white,
                }}
                onPress={togglePlayPause}
                activeOpacity={0.8}
              >
                <Text style={{
                  fontSize: 36,
                  color: COLORS.neutral.white,
                }}>{isPlaying ? "⏸" : "▶"}</Text>
              </TouchableOpacity>

              {/* ⏭️ زر التالي أو الكويز */}
              {!isLastScene ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.primary.green,
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: 14,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 6,
                    borderWidth: 3,
                    borderColor: COLORS.neutral.white,
                  }}
                  onPress={goToNextScene}
                  activeOpacity={0.8}
                >
                  {/* ⚠️ تصحيح اتجاه السهم للجوال */}
                  <Text style={{
                    fontSize: 26,
                    color: COLORS.neutral.white,
                  }}>▶</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.neutral.white,
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: 14,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    elevation: 10,
                    borderWidth: 4,
                    borderColor: COLORS.secondary.yellow,
                    overflow: "hidden",
                  }}
                  onPress={handleQuiz}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={require("../../assets/quiz-icon.webp")}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
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