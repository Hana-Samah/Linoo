import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { getWords, saveWords } from "../storage/wordsStorage";
import { getCategories } from "../storage/categoriesStorage";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import { COLORS } from "../styles/colors";

const icons = {
  back: require("../../assets/backspace-icon.webp"),
  edit: require("../../assets/edit-icon.webp"),
  gallery: require("../../assets/gallery-icon.webp"),
  camera: require("../../assets/camera-icon.webp"),
  tts: require("../../assets/manager/tts-icon.webp"),
  record: require("../../assets/manager/record-icon.webp"),
  play: require("../../assets/play-icon.webp"),
  save: require("../../assets/save-icon.webp"),
  favorite: require("../../assets/unfavorite-icon.webp"),
  favoriteActive: require("../../assets/manager/favorite-icon.webp"),
};

export default function WordFormScreen({ navigation, route }) {
  const editingWord = route.params?.word;
  const [categories, setCategories] = useState([]);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );
  const isPortrait = screenDimensions.height > screenDimensions.width;

  const [text, setText] = useState(editingWord?.text || "");
  const [category, setCategory] = useState(editingWord?.category || "");
  const [favorite, setFavorite] = useState(editingWord?.favorite || false);
  const [audioUri, setAudioUri] = useState(editingWord?.audioUri || null);
  const [imageUri, setImageUri] = useState(editingWord?.imageUri || null);
  const [useTTS, setUseTTS] = useState(editingWord?.useTTS || false);

  const recordingRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);

      if (!category && data.length > 0) {
        setCategory(data[0].id);
      }
    };
    loadCategories();
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("تنبيه", "الرجاء السماح بالمايك");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      Alert.alert("🎙️ جاري التسجيل", "اضغط مرة أخرى لإيقاف التسجيل");
    } catch (err) {
      Alert.alert("خطأ", "فشل بدء التسجيل");
    }
  };

  const stopRecording = async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setUseTTS(false);
      recordingRef.current = null;
      Alert.alert("✅ تم التسجيل", "تم حفظ الصوت بنجاح");
    } catch (err) {
      Alert.alert("خطأ", "فشل حفظ التسجيل");
    }
  };

  const playRecording = async () => {
    try {
      if (!audioUri && !useTTS) {
        Alert.alert("تنبيه", "لا يوجد صوت محفوظ");
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (useTTS) {
        Speech.speak(text, { language: "ar" });
      } else if (audioUri) {
        const { sound } = await Audio.Sound.createAsync({
          uri: audioUri,
        });

        soundRef.current = sound;
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            soundRef.current = null;
          }
        });
      }
    } catch (err) {
      Alert.alert("خطأ", "تعذر تشغيل الصوت");
    }
  };

  const pickFromGallery = async () => {
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
    if (!text.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال الكلمة");
      return;
    }

    if (!category) {
      Alert.alert("تنبيه", "الرجاء اختيار التصنيف");
      return;
    }

    const words = await getWords();

    const wordData = {
      id: editingWord?.id || Date.now().toString(),
      text,
      category,
      favorite,
      audioUri: useTTS ? null : audioUri,
      imageUri,
      useTTS,
    };

    const updated = editingWord
      ? words.map((w) => (w.id === editingWord.id ? wordData : w))
      : [...words, wordData];

    await saveWords(updated);
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
          <Image source={icons.edit} style={styles.headerIcon} resizeMode="contain" />
          <Text style={[styles.headerTitle, isPortrait && styles.headerTitlePortrait]}>
            {editingWord ? "تعديل كلمة" : "كلمة جديدة"}
          </Text>
        </View>

        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, isPortrait && styles.contentPortrait]}>
        {/* الكلمة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> الكلمة</Text>
          <TextInput
            style={styles.input}
            placeholder="اكتب الكلمة هنا..."
            value={text}
            onChangeText={setText}
            placeholderTextColor={COLORS.text.light}
          />
        </View>

        {/* الصورة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> الصورة</Text>
          {imageUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.preview} />
            </View>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickFromGallery}
            >
              <Image source={icons.gallery} style={styles.secondaryButtonIcon} resizeMode="contain" />
              <Text style={styles.secondaryButtonText}>المعرض</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
              <Image source={icons.camera} style={styles.secondaryButtonIcon} resizeMode="contain" />
              <Text style={styles.secondaryButtonText}>كاميرا</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* الصوت */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> الصوت</Text>
          
          {/* اختيار نوع الصوت */}
          <View style={styles.audioChoice}>
            <TouchableOpacity
              style={[styles.choiceButton, useTTS && styles.choiceActive]}
              onPress={() => {
                setUseTTS(true);
                setAudioUri(null);
              }}
            >
              <Image source={icons.tts} style={styles.choiceIcon} resizeMode="contain" />
              <Text style={[styles.choiceText, useTTS && styles.choiceTextActive]}>
                صوت آلي
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.choiceButton,
                !useTTS && audioUri && styles.choiceActive,
              ]}
              onPress={() => setUseTTS(false)}
            >
              <Image source={icons.record} style={styles.choiceIcon} resizeMode="contain" />
              <Text
                style={[
                  styles.choiceText,
                  !useTTS && audioUri && styles.choiceTextActive,
                ]}
              >
                تسجيل
              </Text>
            </TouchableOpacity>
          </View>

          {/* زر التسجيل */}
          {!useTTS && (
            <TouchableOpacity
              style={styles.recordButton}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Image source={icons.record} style={styles.recordIcon} resizeMode="contain" />
              <Text style={styles.recordText}>اضغط مطولاً للتسجيل</Text>
            </TouchableOpacity>
          )}

          {/* زر التشغيل */}
          {(audioUri || useTTS) && (
            <TouchableOpacity style={styles.playButton} onPress={playRecording}>
              <Image source={icons.play} style={styles.playIcon} resizeMode="contain" />
              <Text style={styles.playText}>
                {useTTS ? "تجربة الصوت" : "تشغيل التسجيل"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* التصنيف */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> التصنيف</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.categoryActive,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* المفضلة */}
        <TouchableOpacity
          style={[styles.favoriteButton, favorite && styles.favoriteActive]}
          onPress={() => setFavorite(!favorite)}
        >
          <Image 
            source={favorite ? icons.favoriteActive : icons.favorite} 
            style={styles.favoriteIcon} 
            resizeMode="contain" 
          />
          <Text style={[styles.favoriteText, favorite && styles.favoriteTextActive]}>
            {favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          </Text>
        </TouchableOpacity>

        {/* زر الحفظ */}
        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Image source={icons.save} style={styles.saveIcon} resizeMode="contain" />
          <Text style={styles.saveText}>حفظ الكلمة</Text>
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary.green,
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

  /* ====== حقل الإدخال ====== */
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

  /* ====== الصورة ====== */
  previewContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
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

  /* ====== الصوت ====== */
  audioChoice: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 15,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: COLORS.neutral.cream,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  choiceActive: {
    backgroundColor: COLORS.primary.teal,
    borderColor: COLORS.primary.darkTeal,
  },
  choiceIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text.secondary,
  },
  choiceTextActive: {
    color: COLORS.neutral.white,
  },
  recordButton: {
    backgroundColor: COLORS.secondary.rust,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  recordIcon: {
    width: 28,
    height: 28,
  },
  recordText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.neutral.white,
  },
  playButton: {
    backgroundColor: COLORS.primary.green,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  playIcon: {
    width: 24,
    height: 24,
  },
  playText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.neutral.white,
  },

  /* ====== التصنيف ====== */
  categoriesScroll: {
    gap: 12,
    paddingRight: 20,
  },
  categoryButton: {
    backgroundColor: COLORS.neutral.cream,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 100,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  categoryActive: {
    backgroundColor: COLORS.primary.sage,
    borderColor: COLORS.primary.green,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text.secondary,
  },
  categoryTextActive: {
    color: COLORS.neutral.white,
  },

  /* ====== المفضلة ====== */
  favoriteButton: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: COLORS.secondary.yellow,
  },
  favoriteActive: {
    backgroundColor: COLORS.secondary.yellow,
    borderColor: COLORS.secondary.orange,
  },
  favoriteIcon: {
    width: 28,
    height: 28,
  },
  favoriteText: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  favoriteTextActive: {
    color: COLORS.neutral.white,
  },

  /* ====== زر الحفظ ====== */
  saveButton: {
    backgroundColor: COLORS.primary.green,
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    shadowColor: COLORS.primary.green,
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

  bottomSpacer: {
    height: 30,
  },
});