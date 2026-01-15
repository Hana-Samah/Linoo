import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useState } from "react";
import {
  getCategories,
  saveCategories,
} from "../storage/categoriesStorage";
import * as ImagePicker from "expo-image-picker";

export default function CategoryFormScreen({ navigation, route }) {
  const editingCategory = route.params?.category;
  const [name, setName] = useState(editingCategory?.name || "");
  const [icon, setIcon] = useState(editingCategory?.icon || "📁");
  const [imageUri, setImageUri] = useState(editingCategory?.imageUri || null);

  const iconOptions = [
    "😊",
    "🍎",
    "🙋",
    "👨‍👩‍👧‍👦",
    "⚽",
    "🏠",
    "🚗",
    "📚",
    "🎮",
    "🐕",
    "🌈",
    "🎨",
    "🎵",
    "💼",
    "🏥",
    "🏫",
  ];

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
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingCategory ? "تعديل التصنيف" : "تصنيف جديد"}
        </Text>
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>📁</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* الاسم */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 اسم التصنيف</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: الطعام"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9A9A9A"
          />
        </View>

        {/* الأيقونة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>😊 اختر أيقونة</Text>
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
          <Text style={styles.sectionTitle}>🖼️ صورة (اختياري)</Text>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickImage}
            >
              <Text style={styles.secondaryButtonIcon}>📂</Text>
              <Text style={styles.secondaryButtonText}>المعرض</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={takePhoto}
            >
              <Text style={styles.secondaryButtonIcon}>📷</Text>
              <Text style={styles.secondaryButtonText}>كاميرا</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* زر الحفظ */}
        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>💾 حفظ التصنيف</Text>
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
    backgroundColor: "#FAF8F5",
  },

  /* ====== الهيدر ====== */
  header: {
    backgroundColor: "#B5C9B4",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 28,
  },

  /* ====== المحتوى ====== */
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A6B6F",
    marginBottom: 12,
  },

  /* ====== الحقول ====== */
  input: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    fontSize: 18,
    fontWeight: "500",
    color: "#4A4A4A",
    borderWidth: 3,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  /* ====== شبكة الأيقونات ====== */
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconButton: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconActive: {
    backgroundColor: "#B5C9B4",
    borderColor: "#7FA896",
    transform: [{ scale: 1.05 }],
  },
  iconEmoji: {
    fontSize: 40,
  },

  /* ====== الصورة ====== */
  preview: {
    width: 150,
    height: 150,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "#E0E0E0",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E8C68E",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  secondaryButtonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4A4A4A",
  },

  /* ====== زر الحفظ ====== */
  saveButton: {
    backgroundColor: "#B5C9B4",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#B5C9B4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  saveText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  /* ====== مسافة إضافية ====== */
  bottomSpacer: {
    height: 30,
  },
});