import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { getStoriesSortedByReadCount } from "../data/stories";
import { COLORS } from "../styles/colors";

const icons = {
  back: require("../../assets/home-icon.webp"),
};

export default function LearningScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  const [stories, setStories] = useState([]);

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
        {/* 🎨 خلفية ترابية متحركة */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.floatingShape, styles.shape1]} />
          <View style={[styles.floatingShape, styles.shape2]} />
          <View style={[styles.floatingShape, styles.shape3]} />
          <View style={[styles.floatingShape, styles.shape4]} />
        </View>

        {/* 📚 هيدر جميل */}
        <View style={[
          styles.header,
          {
            paddingTop: isPortrait ? 10 : 8,
            paddingBottom: isPortrait ? 15 : 10,
            paddingHorizontal: isPortrait ? 15 : 20,
          }
        ]}>
          {/* زر الرجوع */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={[
              styles.backButton,
              {
                width: isPortrait ? 55 : 50,
                height: isPortrait ? 55 : 50,
                borderRadius: isPortrait ? 27.5 : 25,
              }
            ]}
          >
            <Image 
              source={icons.back} 
              style={[
                styles.backIcon,
                {
                  width: isPortrait ? 30 : 28,
                  height: isPortrait ? 30 : 28,
                }
              ]} 
            />
          </TouchableOpacity>
          
          {/* عنوان الصفحة */}
          <View style={styles.headerTitleContainer}>
            <Text style={[
              styles.headerTitle,
              {
                fontSize: isPortrait ? 24 : 22,
              }
            ]}>📚 مكتبة القصص</Text>
            <View style={[
              styles.headerUnderline,
              {
                width: isPortrait ? 60 : 50,
                height: isPortrait ? 4 : 3,
              }
            ]} />
          </View>

          <View style={[styles.spacer, { width: isPortrait ? 55 : 50 }]} />
        </View>

        {/* 📖 قائمة القصص */}
        <ScrollView
          contentContainerStyle={[
            styles.storiesList,
            {
              padding: isPortrait ? 15 : 20,
              paddingBottom: isPortrait ? 30 : 40,
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[
            styles.storiesGrid,
            !isPortrait && {
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }
          ]}>
            {stories.map((story, index) => (
              <TouchableOpacity
                key={story.id}
                style={[
                  styles.storyCard,
                  {
                    borderRadius: isPortrait ? 22 : 20,
                    marginBottom: isPortrait ? 18 : 16,
                    borderWidth: isPortrait ? 3 : 3,
                  },
                  !isPortrait && {
                    width: "48%",
                  }
                ]}
                onPress={() => openStory(story)}
                activeOpacity={0.85}
              >
                {/* صورة القصة مع تأثير */}
                <View style={styles.imageWrapper}>
                  <View style={[
                    styles.imageContainer,
                    {
                      height: isPortrait ? 180 : 150,
                    }
                  ]}>
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
                <View style={[
                  styles.titleContainer,
                  {
                    padding: isPortrait ? 16 : 14,
                    minHeight: isPortrait ? 70 : 65,
                  }
                ]}>
                  <Text 
                    style={[
                      styles.storyTitle,
                      {
                        fontSize: isPortrait ? 18 : 17,
                        lineHeight: isPortrait ? 26 : 24,
                      }
                    ]} 
                    numberOfLines={2}
                  >
                    {story.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
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

  /* ====== هيدر ====== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    zIndex: 100,
  },
  backButton: {
    backgroundColor: COLORS.primary.teal,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  backIcon: {
    tintColor: COLORS.neutral.white,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "900",
    color: COLORS.secondary.orange,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerUnderline: {
    backgroundColor: COLORS.primary.green,
    borderRadius: 2,
    marginTop: 5,
  },
  spacer: {
    // width set dynamically
  },

  /* ====== قائمة القصص ====== */
  storiesList: {
    // padding set dynamically
  },

  /* ====== شبكة القصص ====== */
  storiesGrid: {
    width: "100%",
  },

  /* ====== بطاقة القصة ====== */
  storyCard: {
    backgroundColor: COLORS.neutral.white,
    overflow: "hidden",
    borderColor: COLORS.primary.sage,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },

  /* ====== صورة القصة ====== */
  imageWrapper: {
    position: "relative",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    backgroundColor: COLORS.neutral.cream,
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
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
  },
  storyTitle: {
    fontWeight: "800",
    color: COLORS.text.primary,
    textAlign: "center",
  },

  bottomSpacer: {
    height: 20,
  },
});