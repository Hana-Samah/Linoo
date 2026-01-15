import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { getWords, saveWords } from "../storage/wordsStorage";
import { getCategories } from "../storage/categoriesStorage";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";

export default function WordFormScreen({ navigation, route }) {
  const editingWord = route.params?.word;
  const [categories, setCategories] = useState([]);

  const [text, setText] = useState(editingWord?.text || "");
  const [category, setCategory] = useState(editingWord?.category || "");
  const [favorite, setFavorite] = useState(editingWord?.favorite || false);
  const [audioUri, setAudioUri] = useState(editingWord?.audioUri || null);
  const [imageUri, setImageUri] = useState(editingWord?.imageUri || null);
  const [useTTS, setUseTTS] = useState(editingWord?.useTTS || false);

  const recordingRef = useRef(null);
  const soundRef = useRef(null);

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
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingWord ? "تعديل كلمة" : "كلمة جديدة"}
        </Text>
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>✏️</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* الكلمة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 الكلمة</Text>
          <TextInput
            style={styles.input}
            placeholder="اكتب الكلمة هنا..."
            value={text}
            onChangeText={setText}
            placeholderTextColor="#9A9A9A"
          />
        </View>

        {/* الصورة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🖼️ الصورة</Text>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickFromGallery}
            >
              <Text style={styles.secondaryButtonIcon}>📂</Text>
              <Text style={styles.secondaryButtonText}>المعرض</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
              <Text style={styles.secondaryButtonIcon}>📷</Text>
              <Text style={styles.secondaryButtonText}>كاميرا</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* الصوت */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔊 الصوت</Text>
          
          {/* اختيار نوع الصوت */}
          <View style={styles.audioChoice}>
            <TouchableOpacity
              style={[styles.choiceButton, useTTS && styles.choiceActive]}
              onPress={() => {
                setUseTTS(true);
                setAudioUri(null);
              }}
            >
              <Text style={styles.choiceIcon}>🤖</Text>
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
              <Text style={styles.choiceIcon}>🎙️</Text>
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
              <Text style={styles.recordIcon}>🎙️</Text>
              <Text style={styles.recordText}>اضغط مطولاً للتسجيل</Text>
            </TouchableOpacity>
          )}

          {/* زر التشغيل */}
          {(audioUri || useTTS) && (
            <TouchableOpacity style={styles.playButton} onPress={playRecording}>
              <Text style={styles.playIcon}>▶️</Text>
              <Text style={styles.playText}>
                {useTTS ? "تجربة الصوت" : "تشغيل التسجيل"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* التصنيف */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📂 التصنيف</Text>
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
          <Text style={styles.favoriteIcon}>{favorite ? "⭐" : "☆"}</Text>
          <Text style={styles.favoriteText}>
            {favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          </Text>
        </TouchableOpacity>

        {/* زر الحفظ */}
        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>💾 حفظ الكلمة</Text>
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
    backgroundColor: "#7FA896",
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
    marginBottom: 25,
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

  /* ====== الصوت ====== */
  audioChoice: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 15,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E0E0E0",
  },
  choiceActive: {
    backgroundColor: "#A8C5C5",
    borderColor: "#7FA896",
  },
  choiceIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7A7A7A",
  },
  choiceTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  recordButton: {
    backgroundColor: "#D9956C",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#D9956C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  recordText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  playButton: {
    backgroundColor: "#7FA896",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  playIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  playText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* ====== التصنيفات ====== */
  categoriesScroll: {
    paddingVertical: 5,
  },
  categoryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E0E0E0",
    minWidth: 90,
  },
  categoryActive: {
    backgroundColor: "#B5C9B4",
    borderColor: "#7FA896",
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7A7A7A",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* ====== المفضلة ====== */
  favoriteButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#E8C68E",
    flexDirection: "row",
    justifyContent: "center",
  },
  favoriteActive: {
    backgroundColor: "#E8C68E",
  },
  favoriteIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  favoriteText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4A4A4A",
  },

  /* ====== زر الحفظ ====== */
  saveButton: {
    backgroundColor: "#7FA896",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#7FA896",
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