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
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getChildInfo, saveChildInfo } from "../storage/childStorage";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../styles/colors";

const icons = {
  back: require("../../assets/backspace-icon.webp"),
  profile: require("../../assets/profile-icon.webp"),
  gallery: require("../../assets/gallery-icon.webp"),
  camera: require("../../assets/camera-icon.webp"),
  save: require("../../assets/save-icon.webp"),
  delete: require("../../assets/clear-icon.webp"),
  girl: require("../../assets/girl.webp"),
  boy: require("../../assets/boy.webp"),
};

export default function ChildProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [imageUri, setImageUri] = useState(null);
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
          <Image source={icons.profile} style={styles.headerIcon} resizeMode="contain" />
          <Text style={[styles.headerTitle, isPortrait && styles.headerTitlePortrait]}>بروفايل الطفل</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, isPortrait && styles.contentPortrait]}>
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
              <Image source={icons.gallery} style={styles.imageButtonIcon} resizeMode="contain" />
              <Text style={styles.imageButtonText}>المعرض</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Image source={icons.camera} style={styles.imageButtonIcon} resizeMode="contain" />
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
              placeholderTextColor={COLORS.text.light}
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
              placeholderTextColor={COLORS.text.light}
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
                <Image source={icons.boy} style={styles.genderIcon} resizeMode="contain" />
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
                <Image source ={icons.girl} style={styles.genderIcon} resizeMode="contain" />
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
          <Image source={icons.save} style={styles.saveIcon} resizeMode="contain" />
          <Text style={styles.saveText}>حفظ التعديلات</Text>
        </TouchableOpacity>

        {/* زر الحذف */}
        <TouchableOpacity style={styles.deleteButton} onPress={deleteProfile}>
          <Image source={icons.delete} style={styles.deleteIcon} resizeMode="contain" />
          <Text style={styles.deleteText}>حذف البروفايل نهائياً</Text>
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
    width: 57,
    height: 57,
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

  /* ====== قسم الصورة ====== */
  imageSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: COLORS.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: COLORS.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: COLORS.secondary.yellow,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  imageButtonIcon: {
    width: 24,
    height: 24,
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.neutral.white,
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
    fontWeight: "800",
    color: COLORS.primary.darkTeal,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text.primary,
    borderWidth: 4,
    borderColor: COLORS.primary.sage,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  /* ====== أزرار الجنس ====== */
  genderButtons: {
    flexDirection: "row",
    gap: 15,
  },
  genderButton: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.neutral.cream,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary.teal,
    borderColor: COLORS.primary.darkTeal,
  },
  genderIcon: {
    fontSize: 42,
    marginBottom: 8,
    width: 128,
    height: 128,
  },
  genderText: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text.secondary,
  },
  genderTextActive: {
    color: COLORS.neutral.white,
  },

  /* ====== أزرار الحفظ والحذف ====== */
  saveButton: {
    backgroundColor: COLORS.primary.green,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    shadowColor: COLORS.primary.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 15,
    borderWidth: 4,
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
  deleteButton: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    borderWidth: 4,
    borderColor: COLORS.secondary.rust,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  deleteIcon: {
    width: 24,
    height: 24,
  },
  deleteText: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.secondary.rust,
  },

  /* ====== مسافة إضافية ====== */
  bottomSpacer: {
    height: 30,
  },
});