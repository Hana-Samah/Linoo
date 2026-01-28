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
  useWindowDimensions,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { saveChildInfo } from "../storage/childStorage";
import { COLORS } from "../styles/colors";

const icons = {
  camera: require("../../assets/camera-icon.webp"),
  save: require("../../assets/save-icon.webp"),
  girl: require("../../assets/girl.webp"),
  boy: require("../../assets/boy.webp"),
};

export default function ChildInfoScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const isSmallScreen = width < 375;

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

      {/* 🎨 خلفية ترابية */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.floatingShape, styles.shape1]} />
        <View style={[styles.floatingShape, styles.shape2]} />
        <View style={[styles.floatingShape, styles.shape3]} />
        <View style={[styles.floatingShape, styles.shape4]} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: isPortrait ? 20 : 24,
              paddingTop: isPortrait ? 16 : 12,
              paddingBottom: isPortrait ? 24 : 16,
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 🦁 Logo Section */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                marginBottom: isPortrait ? 20 : 12,
                transform: [{ scale: logoScale }],
              }
            ]}
          >
            <Image 
              source={require("../../assets/lion/lion_8.webp")} 
              style={{
                width: isPortrait ? (isSmallScreen ? 140 : 160) : 120,
                height: isPortrait ? (isSmallScreen ? 140 : 160) : 120,
              }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 📝 Header */}
          <Animated.View
            style={[
              styles.header,
              {
                marginBottom: isPortrait ? 24 : 16,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={{
              fontSize: isPortrait ? (isSmallScreen ? 26 : 28) : 24,
              fontWeight: "900",
              color: COLORS.secondary.orange,
              textAlign: "center",
            }}>معلومات الطفل</Text>
            <Text style={{
              fontSize: isPortrait ? (isSmallScreen ? 15 : 16) : 14,
              fontWeight: "600",
              color: COLORS.text.secondary,
              marginTop: 8,
              textAlign: "center",
            }}>
              دعنا نجهّز ملف بطلنا / بطلتنا 🌟
            </Text>
          </Animated.View>

          {/* 📋 Form Card */}
          <Animated.View
            style={[
              styles.card,
              {
                borderRadius: isPortrait ? 25 : 22,
                padding: isPortrait ? 20 : 18,
                marginBottom: isPortrait ? 20 : 16,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* 📸 Photo Section */}
            <View style={[styles.photoSection, { marginBottom: isPortrait ? 20 : 16 }]}>
              <Text style={{
                fontSize: isPortrait ? 16 : 15,
                fontWeight: "800",
                color: COLORS.text.primary,
                marginBottom: isPortrait ? 14 : 12,
                textAlign: "center",
              }}>📸 صورة الطفل</Text>
              
              <TouchableOpacity
                style={[
                  styles.photoContainer,
                  {
                    width: isPortrait ? 140 : 120,
                    height: isPortrait ? 140 : 120,
                    borderRadius: isPortrait ? 70 : 60,
                  }
                ]}
                activeOpacity={0.8}
                onPress={pickImage}
              >
                {imageUri ? (
                  <Animated.Image
                    source={{ uri: imageUri }}
                    style={[
                      styles.photoImage,
                      {
                        width: isPortrait ? 140 : 120,
                        height: isPortrait ? 140 : 120,
                        borderRadius: isPortrait ? 70 : 60,
                        opacity: photoOpacity,
                        transform: [{ scale: photoScale }],
                      },
                    ]}
                  />
                ) : (
                  <View style={[
                    styles.photoPlaceholder,
                    {
                      width: isPortrait ? 140 : 120,
                      height: isPortrait ? 140 : 120,
                      borderRadius: isPortrait ? 70 : 60,
                    }
                  ]}>
                    <Text style={{ fontSize: isPortrait ? 45 : 40 }}>📷</Text>
                    <Text style={{
                      fontSize: isPortrait ? 11 : 10,
                      fontWeight: "700",
                      color: COLORS.text.secondary,
                      textAlign: "center",
                      marginTop: 6,
                    }}>اضغط لإضافة صورة</Text>
                  </View>
                )}
                
                {/* Camera badge */}
                {!imageUri && (
                  <View style={[
                    styles.cameraBadge,
                    {
                      width: isPortrait ? 40 : 36,
                      height: isPortrait ? 40 : 36,
                      borderRadius: isPortrait ? 20 : 18,
                    }
                  ]}>
                    <Image 
                      source={icons.camera} 
                      style={{
                        width: isPortrait ? 22 : 20,
                        height: isPortrait ? 22 : 20,
                      }}
                      resizeMode="contain" 
                    />
                  </View>
                )}
              </TouchableOpacity>

              {!imageUri && (
                <View style={[
                  styles.photoNote,
                  {
                    marginTop: isPortrait ? 12 : 10,
                    paddingVertical: isPortrait ? 10 : 8,
                    paddingHorizontal: isPortrait ? 16 : 14,
                  }
                ]}>
                  <Text style={{ fontSize: 14 }}>ℹ️</Text>
                  <Text style={{
                    fontSize: isPortrait ? 12 : 11,
                    color: COLORS.neutral.white,
                    fontWeight: "700",
                    marginLeft: 6,
                  }}>
                    الصورة مطلوبة لإكمال التسجيل
                  </Text>
                </View>
              )}
            </View>

            {/* 👤 Name Input */}
            <View style={[styles.inputSection, { marginBottom: isPortrait ? 18 : 14 }]}>
              <Text style={{
                fontSize: isPortrait ? 16 : 15,
                fontWeight: "800",
                color: COLORS.text.primary,
                marginBottom: isPortrait ? 10 : 8,
              }}>👤 الاسم</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      paddingVertical: isPortrait ? 14 : 12,
                      paddingHorizontal: isPortrait ? 18 : 16,
                      fontSize: isPortrait ? 16 : 15,
                      borderRadius: isPortrait ? 18 : 16,
                    }
                  ]}
                  placeholder="اسم الطفل الرائع"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={COLORS.text.light}
                />
              </View>
            </View>

            {/* 🎂 Age Input */}
            <View style={[styles.inputSection, { marginBottom: isPortrait ? 18 : 14 }]}>
              <Text style={{
                fontSize: isPortrait ? 16 : 15,
                fontWeight: "800",
                color: COLORS.text.primary,
                marginBottom: isPortrait ? 10 : 8,
              }}>🎂 العمر</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      paddingVertical: isPortrait ? 14 : 12,
                      paddingHorizontal: isPortrait ? 18 : 16,
                      fontSize: isPortrait ? 16 : 15,
                      borderRadius: isPortrait ? 18 : 16,
                    }
                  ]}
                  placeholder="كم عمره؟"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={age}
                  onChangeText={setAge}
                  placeholderTextColor={COLORS.text.light}
                />
              </View>
              <Text style={{
                fontSize: isPortrait ? 11 : 10,
                fontWeight: "600",
                color: COLORS.text.secondary,
                marginTop: 6,
                marginRight: 4,
              }}>من 2 إلى 8 سنوات</Text>
            </View>

            {/* 👶 Gender Selection */}
            <View style={styles.inputSection}>
              <Text style={{
                fontSize: isPortrait ? 16 : 15,
                fontWeight: "800",
                color: COLORS.text.primary,
                marginBottom: isPortrait ? 12 : 10,
              }}>👶 الجنس</Text>
              <View style={[styles.genderRow, { gap: isPortrait ? 12 : 10 }]}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    {
                      borderRadius: isPortrait ? 18 : 16,
                      paddingVertical: isPortrait ? 18 : 14,
                      paddingHorizontal: isPortrait ? 14 : 12,
                    },
                    gender === "male" && styles.genderActive,
                  ]}
                  onPress={() => setGender("male")}
                  activeOpacity={0.8}
                >
                  <View style={styles.genderIconContainer}>
                    <Image 
                      source={icons.boy} 
                      style={{
                        width: isPortrait ? 80 : 70,
                        height: isPortrait ? 80 : 70,
                      }}
                      resizeMode="contain" 
                    />
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      {
                        fontSize: isPortrait ? 15 : 14,
                      },
                      gender === "male" && styles.genderTextActive,
                    ]}
                  >
                    ولد
                  </Text>
                  
                  {gender === "male" && (
                    <View style={[
                      styles.checkBadge,
                      {
                        width: isPortrait ? 28 : 26,
                        height: isPortrait ? 28 : 26,
                        borderRadius: isPortrait ? 14 : 13,
                      }
                    ]}>
                      <Text style={{ fontSize: isPortrait ? 14 : 13, color: COLORS.neutral.white, fontWeight: "bold" }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    {
                      borderRadius: isPortrait ? 18 : 16,
                      paddingVertical: isPortrait ? 18 : 14,
                      paddingHorizontal: isPortrait ? 14 : 12,
                    },
                    gender === "female" && styles.genderActive,
                  ]}
                  onPress={() => setGender("female")}
                  activeOpacity={0.8}
                >
                  <View style={styles.genderIconContainer}>
                    <Image 
                      source={icons.girl} 
                      style={{
                        width: isPortrait ? 80 : 70,
                        height: isPortrait ? 80 : 70,
                      }}
                      resizeMode="contain" 
                    />
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      {
                        fontSize: isPortrait ? 15 : 14,
                      },
                      gender === "female" && styles.genderTextActive,
                    ]}
                  >
                    بنت
                  </Text>
                  
                  {gender === "female" && (
                    <View style={[
                      styles.checkBadge,
                      {
                        width: isPortrait ? 28 : 26,
                        height: isPortrait ? 28 : 26,
                        borderRadius: isPortrait ? 14 : 13,
                      }
                    ]}>
                      <Text style={{ fontSize: isPortrait ? 14 : 13, color: COLORS.neutral.white, fontWeight: "bold" }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* 🚀 Save Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  paddingVertical: isPortrait ? 18 : 16,
                  borderRadius: isPortrait ? 22 : 20,
                  marginBottom: isPortrait ? 12 : 10,
                }
              ]}
              onPress={save}
              activeOpacity={0.85}
            >
              <View style={styles.buttonContent}>
                <Image 
                  source={icons.save} 
                  style={{
                    width: isPortrait ? 26 : 24,
                    height: isPortrait ? 26 : 24,
                  }}
                  resizeMode="contain" 
                />
                <Text style={{
                  color: COLORS.neutral.white,
                  fontSize: isPortrait ? 20 : 18,
                  fontWeight: "900",
                  marginLeft: 10,
                }}>ابدأ المغامرة</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* 📝 Footer */}
          <View style={styles.footer}>
            <Text style={{
              fontSize: isPortrait ? 12 : 11,
              fontWeight: "600",
              color: COLORS.text.secondary,
              textAlign: "center",
            }}>
              جميع البيانات محفوظة على جهازك فقط 🔒
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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

  /* ScrollView */
  scroll: {
    flexGrow: 1,
  },

  /* 🦁 Logo Section */
  logoSection: {
    alignItems: 'center',
  },

  /* 📝 Header */
  header: {
    alignItems: 'center',
  },

  /* 📋 Card */
  card: {
    backgroundColor: COLORS.neutral.white,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 4,
    borderColor: COLORS.primary.sage,
  },

  /* 📸 Photo Section */
  photoSection: {
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  photoImage: {
    borderWidth: 5,
    borderColor: COLORS.primary.green,
  },
  photoPlaceholder: {
    backgroundColor: COLORS.primary.sage,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: COLORS.primary.green,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  photoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary.peach,
    borderRadius: 18,
    gap: 8,
  },

  /* 📝 Input Sections */
  inputSection: {
    // Margins set dynamically
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 3,
    borderColor: COLORS.primary.sage,
    fontWeight: '600',
    color: COLORS.text.primary,
  },

  /* 👶 Gender Selection */
  genderRow: {
    flexDirection: 'row',
  },
  genderButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.neutral.cream,
    backgroundColor: COLORS.background,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderActive: {
    backgroundColor: COLORS.primary.sage,
    borderColor: COLORS.primary.green,
    borderWidth: 4,
  },
  genderIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  genderText: {
    color: COLORS.text.secondary,
    fontWeight: '700',
  },
  genderTextActive: {
    color: COLORS.primary.green,
    fontWeight: '900',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },

  /* 🚀 Save Button */
  saveButton: {
    backgroundColor: COLORS.primary.green,
    alignItems: 'center',
    shadowColor: COLORS.primary.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 5,
    borderColor: COLORS.neutral.white,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* 📝 Footer */
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});