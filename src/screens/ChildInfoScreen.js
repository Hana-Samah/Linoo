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
import { useState, useRef, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { saveChildInfo } from "../storage/childStorage";

/* ====== 🎨 ألوان Linoo الترابية ====== */
const COLORS = {
  background: "#FFF9EE",
  card: "#FFFFFF",
  primary: "#7FA896",
  primarySoft: "#E8F5F2",
  accent: "#E8C68E",
  secondary: "#D9956C",
  textMain: "#2D3436",
  textSub: "#636E72",
  border: "#E8EAED",
};

export default function ChildInfoScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [imageUri, setImageUri] = useState(null);

  /* ✨ Animations */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const photoScale = useRef(new Animated.Value(0.85)).current;
  const photoOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 🎬 Entrance animation sequence
    Animated.sequence([
      // 1️⃣ Logo bounce
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      
      // 2️⃣ Content fade & slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // 3️⃣ Button entrance
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 6,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
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

      {/* 🎨 Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* 🦁 Logo Section */}
          <Animated.View
            style={[
              styles.logoSection,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={styles.logoCircle}>
              <Image 
                source={require("../../assets/lion/lion_8.png")} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            
          </Animated.View>

          {/* 📝 Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>معلومات  الطفل</Text>
            <Text style={styles.subtitle}>
              دعنا نجهّز ملف بطلنا / بطلتنا  🌟
            </Text>
          </Animated.View>

          {/* 📋 Form Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* 📸 Photo Section */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionLabel}>📸 صورة الطفل</Text>
              
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
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoIcon}>📷</Text>
                    <Text style={styles.photoHint}>اضغط لإضافة صورة</Text>
                  </View>
                )}
                
                {/* Camera badge */}
                {!imageUri && (
                  <View style={styles.cameraBadge}>
                    <Text style={styles.cameraIcon}>📷</Text>
                  </View>
                )}
              </TouchableOpacity>

              {!imageUri && (
                <View style={styles.photoNote}>
                  <Text style={styles.photoNoteIcon}>ℹ️</Text>
                  <Text style={styles.photoNoteText}>
                    الصورة مطلوبة لإكمال التسجيل
                  </Text>
                </View>
              )}
            </View>

            {/* 👤 Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>👤 الاسم</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="اسم الطفل الرائع"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#999"
                />
                <View style={styles.inputIcon}>
                  <Text style={styles.inputIconText}>✏️</Text>
                </View>
              </View>
            </View>

            {/* 🎂 Age Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>🎂 العمر</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="كم عمره؟"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={age}
                  onChangeText={setAge}
                  placeholderTextColor="#999"
                />
                <View style={styles.inputIcon}>
                  <Text style={styles.inputIconText}>🎈</Text>
                </View>
              </View>
              <Text style={styles.ageHint}>من 2 إلى 8 سنوات</Text>
            </View>

            {/* 👶 Gender Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>👶 الجنس</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "male" && styles.genderActive,
                  ]}
                  onPress={() => setGender("male")}
                  activeOpacity={0.8}
                >
                  <View style={styles.genderIconContainer}>
                    <Text style={styles.genderIcon}>👦</Text>
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      gender === "male" && styles.genderTextActive,
                    ]}
                  >
                    ولد
                  </Text>
                  
                  {gender === "male" && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "female" && styles.genderActive,
                  ]}
                  onPress={() => setGender("female")}
                  activeOpacity={0.8}
                >
                  <View style={styles.genderIconContainer}>
                    <Text style={styles.genderIcon}>👧</Text>
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      gender === "female" && styles.genderTextActive,
                    ]}
                  >
                    بنت
                  </Text>
                  
                  {gender === "female" && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* 🚀 Start Button */}
          <Animated.View
            style={{
              transform: [{ scale: buttonScale }],
            }}
          >
            <TouchableOpacity
              style={styles.saveButton}
              onPress={save}
              activeOpacity={0.85}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>🚀</Text>
                <Text style={styles.saveText}>ابدأ الرحلة الآن</Text>
              </View>
              <View style={styles.buttonShine} />
            </TouchableOpacity>

            {/* Footer note */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                ✨ رحلة التعلم والتواصل تبدأ من هنا
              </Text>
            </View>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================== 🎨 Styles ================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },

  /* 🎨 Decorative circles */
  decorCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.accent,
    opacity: 0.06,
    top: -80,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
    bottom: -50,
    left: -40,
  },

  /* 🦁 Logo Section */
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
 
  logoImage: {
    width: 200,
    height: 200,
  },
  starsDecor: {
    position: 'absolute',
    top: -5,
    right: '35%',
    flexDirection: 'row',
    gap: 4,
  },
  miniStar: {
    fontSize: 16,
  },

  /* 📝 Header */
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSub,
    marginTop: 8,
    textAlign: 'center',
  },

  /* 📋 Card */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 24,
  },

  /* 📸 Photo Section */
  photoSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 16,
    textAlign: 'center',
  },
  photoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  photoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
  },
  photoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoHint: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: '600',
    textAlign: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cameraIcon: {
    fontSize: 20,
  },
  photoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent + '30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  photoNoteIcon: {
    fontSize: 16,
  },
  photoNoteText: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: '600',
  },

  /* 📝 Input Sections */
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 10,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 16,
    paddingRight: 50,
    borderWidth: 2,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.textMain,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputIconText: {
    fontSize: 18,
  },
  ageHint: {
    fontSize: 12,
    color: COLORS.textSub,
    marginTop: 6,
    marginRight: 4,
  },

  /* 👶 Gender Selection */
  genderRow: {
    flexDirection: 'row',
    gap: 14,
  },
  genderButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  genderActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  genderIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderIcon: {
    fontSize: 36,
  },
  genderText: {
    fontSize: 16,
    color: COLORS.textSub,
    fontWeight: '600',
  },
  genderTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 17,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  checkIcon: {
    fontSize: 14,
    color: COLORS.card,
    fontWeight: 'bold',
  },

  /* 🚀 Save Button */
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonIcon: {
    fontSize: 24,
  },
  saveText: {
    color: COLORS.card,
    fontSize: 20,
    fontWeight: '800',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  /* 📝 Footer */
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSub,
    textAlign: 'center',
  },

  /* Spacing */
  bottomSpacer: {
    height: 20,
  },
});