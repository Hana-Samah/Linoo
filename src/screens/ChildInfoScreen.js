import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
} from "react-native";
import { useState, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import { saveChildInfo } from "../storage/childStorage";

/* ====== ألوان Linoo الترابية ====== */
const COLORS = {
  background: "#FFF9EE",
  card: "#FFFFFF",
  primary: "#7FA896",
  primarySoft: "#E8F5F2",
  textMain: "#2D3436",
  textSub: "#636E72",
  border: "#E8EAED",
};

export default function ChildInfoScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [imageUri, setImageUri] = useState(null);

  /* Animation */
  const photoScale = useRef(new Animated.Value(0.85)).current;
  const photoOpacity = useRef(new Animated.Value(0)).current;

  const animatePhoto = () => {
    Animated.parallel([
      Animated.spring(photoScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(photoOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("تنبيه", "الرجاء السماح بالوصول للصور");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      animatePhoto();
    }
  };

  const save = async () => {
    if (!imageUri) {
      Alert.alert("تنبيه", "الرجاء إضافة صورة للطفل");
      return;
    }
    if (!name.trim() || !age.trim() || !gender) {
      Alert.alert("تنبيه", "الرجاء تعبئة جميع الحقول");
      return;
    }

    await saveChildInfo({ name, age, gender, imageUri });
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ===== العنوان ===== */}
          <View style={styles.header}>
            <Text style={styles.title}>معلومات الطفل</Text>
            <Text style={styles.subtitle}>
              دعنا نجهّز ملف بطلنا الصغير
            </Text>
          </View>

          {/* ===== الكارد ===== */}
          <View style={styles.card}>
            {/* ===== الصورة ===== */}
            <TouchableOpacity
              style={styles.photoContainer}
              activeOpacity={0.8}
              onPress={pickImage}
            >
              {imageUri ? (
                <Animated.Image
                  source={{ uri: imageUri }}
                  style={[
                    styles.photoImage,
                    {
                      opacity: photoOpacity,
                      transform: [{ scale: photoScale }],
                    },
                  ]}
                />
              ) : (
                <>
                  <Text style={styles.photoIcon}>📷</Text>
                  <Text style={styles.photoHint}>
                    اضغط لإضافة صورة
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {!imageUri && (
              <Text style={styles.photoNote}>
                الصورة مطلوبة لإكمال التسجيل
              </Text>
            )}

            {/* ===== الاسم ===== */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>الاسم</Text>
              <TextInput
                style={styles.input}
                placeholder="اسم الطفل"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            {/* ===== العمر ===== */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>العمر</Text>
              <TextInput
                style={styles.input}
                placeholder="العمر"
                keyboardType="number-pad"
                maxLength={2}
                value={age}
                onChangeText={setAge}
                placeholderTextColor="#999"
              />
            </View>

            {/* ===== الجنس ===== */}
            <Text style={styles.label}>الجنس</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "male" && styles.genderActive,
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
                  ولد
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "female" && styles.genderActive,
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
                  بنت
                </Text>
              </TouchableOpacity>
            </View>

            {/* ===== زر البدء ===== */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={save}
              activeOpacity={0.85}
            >
              <Text style={styles.saveText}>ابدأ الآن</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================== Styles ================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSub,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 10,
  },
  photoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primarySoft,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 10,
  },
  photoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  photoIcon: {
    fontSize: 40,
  },
  photoHint: {
    fontSize: 13,
    color: COLORS.textSub,
    marginTop: 6,
  },
  photoNote: {
    textAlign: "center",
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    fontSize: 16,
  },
  genderRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 24,
  },
  genderButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  genderActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  genderIcon: {
    fontSize: 36,
  },
  genderText: {
    marginTop: 6,
    fontSize: 16,
    color: COLORS.textSub,
    fontWeight: "600",
  },
  genderTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
});
