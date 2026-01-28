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
import { useState, useEffect } from "react";
import { COLORS } from "../styles/colors";

const icons = {
  home: require("../../assets/home-icon.webp"),
  profile: require("../../assets/profile-icon.webp"),
  words: require("../../assets/words-icon.webp"),
  categories: require("../../assets/categories-icon.webp"),
  statistics: require("../../assets/statistics-icon.webp"),
};

export default function ParentMenuScreen({ navigation }) {
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );
  const isPortrait = screenDimensions.height > screenDimensions.width;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const menuItems = [
    {
      id: 1,
      title: "بروفايل الطفل",
      iconKey: "profile",
      color: COLORS.secondary.orange,
      route: "ChildProfile",
      description: "عرض وتعديل المعلومات",
    },
    {
      id: 2,
      title: "إدارة الكلمات",
      iconKey: "words",
      color: COLORS.primary.green,
      route: "WordManager",
      description: "إضافة وتعديل الكلمات",
    },
    {
      id: 3,
      title: "إدارة التصنيفات",
      iconKey: "categories",
      color: COLORS.primary.teal,
      route: "CategoryManager",
      description: "إضافة وتعديل الأقسام",
    },
    {
      id: 4,
      title: "الإحصائيات والتقارير",
      iconKey: "statistics",
      color: COLORS.secondary.yellow,
      route: "Statistics",
      description: "تقارير الأداء والتقدم",
    },
  ];

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
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.backButton}
        >
          <Image source={icons.home} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, isPortrait && styles.headerTitlePortrait]}>إعدادات الأهل</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      {/* القائمة */}
      <ScrollView
        contentContainerStyle={[styles.menuContainer, isPortrait && styles.menuContainerPortrait]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.menuGrid, !isPortrait && styles.menuGridLandscape]}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuCard,
                isPortrait && styles.menuCardPortrait,
                !isPortrait && styles.menuCardLandscape,
                { borderColor: item.color },
              ]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.85}
            >
              {/* الأيقونة */}
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Image 
                  source={icons[item.iconKey]} 
                  style={styles.menuIcon} 
                  resizeMode="contain"
                />
              </View>

              {/* المعلومات */}
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* مسافة إضافية */}
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

  /* ====== الهيدر ====== */
  header: {
    backgroundColor: "transparent",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
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
  headerContent: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    tintColor: COLORS.secondary.orange,
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
  spacer: {
    width: 60,
  },

  /* ====== القائمة ====== */
  menuContainer: {
    padding: 20,
  },
  menuContainerPortrait: {
    padding: 15,
  },

  /* ====== شبكة القائمة ====== */
  menuGrid: {
    width: "100%",
  },
  menuGridLandscape: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* ====== بطاقات القائمة ====== */
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 4,
    minHeight: 110,
  },
  menuCardPortrait: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 3,
    minHeight: 100,
  },
  menuCardLandscape: {
    width: "48%",
    marginBottom: 20,
  },

  /* ====== الأيقونة ====== */
  iconContainer: {
    width: 75,
    height: 75,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
  },
  menuIcon: {
    width: 72,
    height: 72,
    tintColor: COLORS.neutral.white,
  },

  /* ====== المعلومات ====== */
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  menuDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: "600",
  },

  /* ====== مسافة إضافية ====== */
  bottomSpacer: {
    height: 30,
  },
});