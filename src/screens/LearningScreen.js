import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { getStoriesSortedByReadCount } from "../data/stories";

export default function LearningScreen({ navigation }) {
  const [stories, setStories] = useState([]);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

      loadStories();
    }, [])
  );

  const loadStories = async () => {
    const sortedStories = await getStoriesSortedByReadCount();
    setStories(sortedStories);
  };

  const openStory = (story) => {
    navigation.navigate("StoryReader", { story });
  };

  return (
    <View style={styles.container}>
      {/* الهيدر */}
      <View style={styles.header}>
        {/* ✅ يرجع للهوم مباشرة */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>🏠</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>القصص</Text>
        <View style={styles.headerIcon}>
          <Text style={styles.bookEmoji}>📚</Text>
        </View>
      </View>

      {/* قائمة القصص */}
      <ScrollView
        contentContainerStyle={styles.storiesContainer}
        showsVerticalScrollIndicator={false}
      >
        {stories.map((story, index) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyCard}
            onPress={() => openStory(story)}
            activeOpacity={0.85}
          >
            {/* صورة الغلاف */}
            <View style={styles.coverContainer}>
              <Image
                source={story.coverImage}
                style={styles.coverImage}
                resizeMode="cover"
              />
              
              {/* شارة الأكثر قراءة */}
              {index === 0 && story.readCount > 0 && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularIcon}>⭐</Text>
                </View>
              )}

              {/* عداد المشاهدات */}
              {story.readCount > 0 && (
                <View style={styles.viewsBadge}>
                  <Text style={styles.viewsIcon}>👁️</Text>
                  <Text style={styles.viewsText}>{story.readCount}</Text>
                </View>
              )}
            </View>

            {/* معلومات القصة */}
            <View style={styles.storyInfo}>
              <Text style={styles.storyTitle} numberOfLines={2}>
                {story.title}
              </Text>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{story.category}</Text>
              </View>
            </View>

            {/* زر التشغيل الكبير */}
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶️</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* مسافة إضافية في النهاية */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  backButton: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerIcon: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  bookEmoji: {
    fontSize: 32,
  },

  /* ====== قائمة القصص ====== */
  storiesContainer: {
    padding: 20,
  },

  /* ====== بطاقة القصة ====== */
  storyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    marginBottom: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 5,
    borderColor: "#F0F0F0",
  },

  /* ====== صورة الغلاف ====== */
  coverContainer: {
    position: "relative",
    width: "100%",
    height: 220,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  popularBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#E8C68E",
    width: 55,
    height: 55,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  popularIcon: {
    fontSize: 30,
  },
  viewsBadge: {
    position: "absolute",
    bottom: 15,
    left: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  viewsIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  viewsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A4A4A",
  },

  /* ====== معلومات القصة ====== */
  storyInfo: {
    padding: 20,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A6B6F",
    marginBottom: 12,
    lineHeight: 32,
  },
  categoryBadge: {
    backgroundColor: "#B5C9B4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4A6B6F",
  },

  /* ====== زر التشغيل ====== */
  playButtonContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  playButton: {
    backgroundColor: "#7FA896",
    width: 75,
    height: 75,
    borderRadius: 37,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  playIcon: {
    fontSize: 38,
  },

  /* ====== مسافة إضافية ====== */
  bottomSpacer: {
    height: 30,
  },
});