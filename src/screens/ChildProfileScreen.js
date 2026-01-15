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
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getChildInfo, saveChildInfo } from "../storage/childStorage";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ChildProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [imageUri, setImageUri] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const child = await getChildInfo();
        if (child) {
          setName(child.name || "");
          setAge(child.age || "");
          setGender(child.gender || "");
          setImageUri(child.imageUri || null);
        }
      };
      loadData();
    }, [])
  );

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
      aspect: [1, 1],
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
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال اسم الطفل");
      return;
    }

    if (!age.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال عمر الطفل");
      return;
    }

    if (!gender) {
      Alert.alert("تنبيه", "الرجاء اختيار الجنس");
      return;
    }

    await saveChildInfo({
      name,
      age,
      gender,
      imageUri,
    });

    Alert.alert("تم الحفظ", "تم تحديث معلومات الطفل بنجاح ✅", [
      { text: "حسناً", onPress: () => navigation.goBack() },
    ]);
  };

  const deleteProfile = () => {
    Alert.alert(
      "⚠️ حذف البروفايل",
      "هل أنت متأكد من حذف جميع معلومات الطفل؟\n\nسيتم حذف:\n• معلومات الطفل\n• الكلمات المخصصة\n• التصنيفات\n• سجل القراءة\n\nلا يمكن التراجع عن هذا الإجراء!",
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "حذف نهائي",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "child_info",
                "AAC_WORDS",
                "AAC_WORDS_INITIALIZED",
                "AAC_CATEGORIES",
                "AAC_CATEGORIES_INITIALIZED",
                "STORIES_READ_COUNT",
                "USER_POINTS",
                "USER_ACHIEVEMENTS",
              ]);

              Alert.alert("✅ تم الحذف", "تم حذف جميع البيانات بنجاح", [
                {
                  text: "حسناً",
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Welcome" }],
                    });
                  },
                },
              ]);
            } catch (error) {
              Alert.alert("خطأ", "حدث خطأ أثناء الحذف");
            }
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>بروفايل الطفل</Text>
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>👤</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* صورة الطفل */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderIcon}>📷</Text>
              </View>
            )}
          </View>

          {/* أزرار تغيير الصورة */}
          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonIcon}>🖼️</Text>
              <Text style={styles.imageButtonText}>المعرض</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.imageButtonIcon}>📷</Text>
              <Text style={styles.imageButtonText}>كاميرا</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* الحقول */}
        <View style={styles.formSection}>
          {/* الاسم */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>الاسم</Text>
            <TextInput
              style={styles.input}
              placeholder="اسم الطفل"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9A9A9A"
            />
          </View>

          {/* العمر */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>العمر</Text>
            <TextInput
              style={styles.input}
              placeholder="عمر الطفل"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              placeholderTextColor="#9A9A9A"
            />
          </View>

          {/* الجنس */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>الجنس</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "male" && styles.genderButtonActive,
                ]}
                onPress={() => setGender("male")}
              >
                <Text style={styles.genderIcon}>👦</Text>
                <Text
                  style={[
                    styles.genderText,
                    gender === "male" && styles.genderTextActive,
                  ]}
                >
                  ذكر
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "female" && styles.genderButtonActive,
                ]}
                onPress={() => setGender("female")}
              >
                <Text style={styles.genderIcon}>👧</Text>
                <Text
                  style={[
                    styles.genderText,
                    gender === "female" && styles.genderTextActive,
                  ]}
                >
                  أنثى
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* زر الحفظ */}
        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>💾 حفظ التعديلات</Text>
        </TouchableOpacity>

        {/* زر الحذف */}
        <TouchableOpacity style={styles.deleteButton} onPress={deleteProfile}>
          <Text style={styles.deleteText}>🗑️ حذف البروفايل نهائياً</Text>
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
    backgroundColor: "#D9956C",
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

  /* ====== قسم الصورة ====== */
  imageSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  placeholderImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    borderStyle: "dashed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  placeholderIcon: {
    fontSize: 60,
  },

  /* ====== أزرار الصورة ====== */
  imageButtons: {
    flexDirection: "row",
    gap: 15,
  },
  imageButton: {
    backgroundColor: "#E8C68E",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  imageButtonIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A4A4A",
  },

  /* ====== قسم الحقول ====== */
  formSection: {
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A6B6F",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    fontSize: 17,
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

  /* ====== أزرار الجنس ====== */
  genderButtons: {
    flexDirection: "row",
    gap: 15,
  },
  genderButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderButtonActive: {
    backgroundColor: "#D9956C",
    borderColor: "#B87B5B",
  },
  genderIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  genderText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#7A7A7A",
  },
  genderTextActive: {
    color: "#FFFFFF",
  },

  /* ====== أزرار الحفظ والحذف ====== */
  saveButton: {
    backgroundColor: "#7FA896",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#7FA896",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 15,
  },
  saveText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  deleteButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FF6B6B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  deleteText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FF6B6B",
  },

  /* ====== مسافة إضافية ====== */
  bottomSpacer: {
    height: 30,
  },
});