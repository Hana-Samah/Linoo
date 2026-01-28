import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import {
  getCategories,
  saveCategories,
} from "../storage/categoriesStorage";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "../styles/colors";

const icons = {
  back: require("../../assets/backspace-icon.webp"),
  category: require("../../assets/categories-icon.webp"),
  gallery: require("../../assets/gallery-icon.webp"),
  camera: require("../../assets/camera-icon.webp"),
  save: require("../../assets/save-icon.webp"),
};

export default function CategoryFormScreen({ navigation, route }) {
  const editingCategory = route.params?.category;
  const [name, setName] = useState(editingCategory?.name || "");
  const [icon, setIcon] = useState(editingCategory?.icon || "📁");
  const [imageUri, setImageUri] = useState(editingCategory?.imageUri || null);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );
  const isPortrait = screenDimensions.height > screenDimensions.width;

  const iconOptions = [
    "😊",
    "🎁",
    "🙋",
    "👨‍👩‍👧‍👦",
    "⚽",
    "🏠",
    "🚗",
    "📚",
    "🎮",
    "🍕",
    "🌈",
    "🎨",
    "🎵",
    "💼",
    "🥗",
    "🏫",
  ];

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("تنبيه", "الرجاء السماح بالوصول للصور");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("تنبيه", "الرجاء السماح بالكاميرا");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال اسم التصنيف");
      return;
    }

    const categories = await getCategories();

    const categoryData = {
      id: editingCategory?.id || Date.now().toString(),
      name,
      icon,
      imageUri,
    };

    const updated = editingCategory
      ? categories.map((c) =>
          c.id.toString() === editingCategory.id.toString()
            ? categoryData
            : c
        )
      : [...categories, categoryData];

    await saveCategories(updated);
    navigation.goBack();
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Image source={icons.category} style={styles.headerIcon} resizeMode="contain" />
          <Text style={[styles.headerTitle, isPortrait && styles.headerTitlePortrait]}>
            {editingCategory ? "تعديل التصنيف" : "تصنيف جديد"}
          </Text>
        </View>

        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, isPortrait && styles.contentPortrait]}>
        {/* الاسم */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> اسم التصنيف</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: الطعام"
            value={name}
            onChangeText={setName}
            placeholderTextColor={COLORS.text.light}
          />
        </View>

        {/* الأيقونة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> اختر أيقونة او  صورة </Text>
          <View style={styles.iconGrid}>
            {iconOptions.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.iconButton,
                  icon === emoji && styles.iconActive,
                ]}
                onPress={() => setIcon(emoji)}
              >
                <Text style={styles.iconEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* الصورة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> صورة (اختياري)</Text>
          {imageUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.preview} />
            </View>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickImage}
            >
              <Image source={icons.gallery} style={styles.secondaryButtonIcon} resizeMode="contain" />
              <Text style={styles.secondaryButtonText}>المعرض</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={takePhoto}
            >
              <Image source={icons.camera} style={styles.secondaryButtonIcon} resizeMode="contain" />
              <Text style={styles.secondaryButtonText}>كاميرا</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* زر الحفظ */}
        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Image source={icons.save} style={styles.saveIcon} resizeMode="contain" />
          <Text style={styles.saveText}>حفظ التصنيف</Text>
        </TouchableOpacity>

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
    width: 55,
    height: 55,
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
    tintColor: COLORS.primary.teal,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary.teal,
  },
  headerTitlePortrait: {
    fontSize: 24,
  },
  spacer: {
    width: 60,
  },

  /* ====== المحتوى ====== */
  content: {
    padding: 20,
  },
  contentPortrait: {
    padding: 15,
  },

  /* ====== القسم ====== */
  section: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: COLORS.primary.sage,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: 15,
  },

  /* ====== الحقول ====== */
  input: {
    backgroundColor: COLORS.neutral.cream,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },

  /* ====== شبكة الأيقونات ====== */
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconButton: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: COLORS.neutral.cream,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  iconActive: {
    backgroundColor: COLORS.primary.sage,
    borderColor: COLORS.primary.green,
    transform: [{ scale: 1.05 }],
    shadowColor: COLORS.primary.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconEmoji: {
    fontSize: 40,
  },

  /* ====== الصورة ====== */
  previewContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  preview: {
    width: 160,
    height: 160,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.secondary.yellow,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  secondaryButtonIcon: {
    width: 24,
    height: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.neutral.white,
  },

  /* ====== زر الحفظ ====== */
  saveButton: {
    backgroundColor: COLORS.primary.teal,
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    shadowColor: COLORS.primary.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 5,
    borderColor: COLORS.neutral.white,
  },
  saveIcon: {
    width: 28,
    height: 28,
  },
  saveText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.neutral.white,
  },

  /* ====== مسافة إضافية ====== */
  bottomSpacer: {
    height: 30,
  },
});