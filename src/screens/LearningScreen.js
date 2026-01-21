import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { getStoriesSortedByReadCount } from "../data/stories";
import { COLORS } from "../styles/colors";

const icons = {
  back: require("../../assets/home-icon.png"),
};

export default function LearningScreen({ navigation }) {
  const [stories, setStories] = useState([]);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );

  // تحديد الوضع (عمودي أو أفقي)
  const isPortrait = screenDimensions.height > screenDimensions.width;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.unlockAsync();
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
      {/* 🎨 خلفية ترابية متحركة */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.floatingShape, styles.shape1]} />
        <View style={[styles.floatingShape, styles.shape2]} />
        <View style={[styles.floatingShape, styles.shape3]} />
        <View style={[styles.floatingShape, styles.shape4]} />
      </View>

      {/* 📚 هيدر جميل */}
      <View style={[styles.header, isPortrait && styles.headerPortrait]}>
        {/* زر الرجوع */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        
        {/* عنوان الصفحة */}
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, isPortrait && styles.headerTitlePortrait]}> مكتبة القصص</Text>
          <View style={styles.headerUnderline} />
        </View>

        <View style={styles.spacer} />
      </View>

      {/* 📖 قائمة القصص */}
      <ScrollView
        contentContainerStyle={[styles.storiesList, isPortrait && styles.storiesListPortrait]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.storiesGrid, !isPortrait && styles.storiesGridLandscape]}>
          {stories.map((story, index) => (
            <TouchableOpacity
              key={story.id}
              style={[
                styles.storyCard, 
                isPortrait && styles.storyCardPortrait,
                !isPortrait && styles.storyCardLandscape
              ]}
              onPress={() => openStory(story)}
              activeOpacity={0.85}
            >
              {/* صورة القصة مع تأثير */}
              <View style={styles.imageWrapper}>
                <View style={[styles.imageContainer, isPortrait && styles.imageContainerPortrait]}>
                  <Image
                    source={story.coverImage}
                    style={styles.storyImage}
                    resizeMode="cover"
                  />
                  {/* تأثير التدرج */}
                  <View style={styles.imageGradient} />
                </View>
              </View>

              {/* عنوان القصة */}
              <View style={[styles.titleContainer, isPortrait && styles.titleContainerPortrait]}>
                <Text style={[styles.storyTitle, isPortrait && styles.storyTitlePortrait]} numberOfLines={2}>
                  {story.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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

  /* ====== هيدر ====== */
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
  backButton: {
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
  backIcon: {
    width: 32,
    height: 32,
    tintColor: COLORS.neutral.white,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.secondary.orange,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerTitlePortrait: {
    fontSize: 24,
  },
  headerUnderline: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.primary.green,
    borderRadius: 2,
    marginTop: 5,
  },
  spacer: {
    width: 60,
  },

  /* ====== قائمة القصص ====== */
  storiesList: {
    padding: 20,
    paddingBottom: 40,
  },
  storiesListPortrait: {
    padding: 15,
    paddingBottom: 30,
  },

  /* ====== شبكة القصص ====== */
  storiesGrid: {
    width: "100%",
  },
  storiesGridLandscape: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* ====== بطاقة القصة ====== */
  storyCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 30,
    marginBottom: 25,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: COLORS.primary.sage,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  storyCardPortrait: {
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 3,
  },
  storyCardLandscape: {
    width: "48%",
    marginBottom: 20,
  },

  /* ====== صورة القصة ====== */
  imageWrapper: {
    position: "relative",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 240,
    backgroundColor: COLORS.neutral.cream,
  },
  imageContainerPortrait: {
    height: 200,
  },
  storyImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "transparent",
    borderBottomWidth: 0,
  },

  /* ====== عنوان القصة ====== */
  titleContainer: {
    padding: 20,
    backgroundColor: COLORS.neutral.white,
    minHeight: 85,
    justifyContent: "center",
  },
  titleContainerPortrait: {
    padding: 18,
    minHeight: 75,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text.primary,
    lineHeight: 32,
    textAlign: "center",
  },
  storyTitlePortrait: {
    fontSize: 20,
    lineHeight: 28,
  },
});