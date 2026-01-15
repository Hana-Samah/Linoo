import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useState, useRef } from "react";

export default function ParentGateScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [modalVisible, setModalVisible] = useState(true);
  const [question, setQuestion] = useState(generateQuestion());
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [errorShake, setErrorShake] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  /* ===== توليد سؤال عشوائي ===== */
  function generateQuestion() {
    const types = ["add", "subtract", "multiply"];
    const type = types[Math.floor(Math.random() * types.length)];

    switch (type) {
      case "add": {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        return { question: `${a} + ${b}`, answer: a + b };
      }
      case "subtract": {
        const big = Math.floor(Math.random() * 15) + 5;
        const small = Math.floor(Math.random() * big);
        return { question: `${big} - ${small}`, answer: big - small };
      }
      case "multiply": {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        return { question: `${a} × ${b}`, answer: a * b };
      }
      default:
        return { question: "2 + 2", answer: 4 };
    }
  }

  /* ===== أنيميشن اهتزاز الخطأ ===== */
  const shakeError = () => {
    setErrorShake(true);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 8,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -8,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 8,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start(() => setErrorShake(false));
  };

  const checkAnswer = () => {
    if (parseInt(answer) === question.answer) {
      setModalVisible(false);
      setTimeout(() => navigation.navigate("ParentMenu"), 300);
    } else {
      shakeError();
      setAnswer("");
      setAttempts((prev) => prev + 1);
      setQuestion(generateQuestion());
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setTimeout(() => navigation.goBack(), 300);
  };

  return (
    <Modal transparent animationType="fade" visible={modalVisible}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            isLandscape && styles.containerLandscape,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          {/* زر الإغلاق */}
          <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          {/* الأيقونة */}
          <View
            style={[
              styles.iconContainer,
              isLandscape && styles.iconLandscape,
            ]}
          >
            <Text style={styles.lockIcon}>🔒</Text>
          </View>

          {/* العنوان */}
          <Text style={[styles.title, isLandscape && styles.titleLandscape]}>
            للكبار فقط
          </Text>

          {!isLandscape && (
            <Text style={styles.subtitle}>حل المسألة للمتابعة</Text>
          )}

          {/* السؤال */}
          <View
            style={[
              styles.questionBox,
              isLandscape && styles.questionBoxLandscape,
            ]}
          >
            <Text style={styles.questionText}>{question.question}</Text>
            <Text style={styles.equalsSign}>=</Text>
            <Text style={styles.questionMark}>؟</Text>
          </View>

          {/* الإدخال */}
          <TextInput
            style={[styles.input, errorShake && styles.inputError]}
            keyboardType="number-pad"
            value={answer}
            onChangeText={setAnswer}
            placeholder="0"
            maxLength={3}
          />

          {/* المحاولات */}
          {attempts > 0 && (
            <View style={styles.attemptsBox}>
              <Text style={styles.attemptsText}>
                محاولات خاطئة: {attempts}
              </Text>
            </View>
          )}

          {/* الأزرار */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !answer && styles.confirmButtonDisabled,
              ]}
              onPress={checkAnswer}
              disabled={!answer}
            >
              <Text style={styles.confirmText}>تأكيد</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    backgroundColor: "#FAF8F5",
    width: "85%",
    maxWidth: 360,
    padding: 22,
    borderRadius: 28,
    alignItems: "center",
    elevation: 15,
  },

  containerLandscape: {
    width: "70%",
    padding: 18,
  },

  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },

  closeIcon: {
    fontSize: 18,
  },

  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#7FA896",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  iconLandscape: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginBottom: 8,
  },

  lockIcon: {
    fontSize: 34,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A6B6F",
    marginBottom: 6,
  },

  titleLandscape: {
    fontSize: 20,
  },

  subtitle: {
    fontSize: 14,
    color: "#7A7A7A",
    marginBottom: 16,
  },

  questionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 16,
  },

  questionBoxLandscape: {
    paddingVertical: 12,
    marginBottom: 12,
  },

  questionText: {
    fontSize: 28,
    fontWeight: "bold",
  },

  equalsSign: {
    fontSize: 24,
    marginHorizontal: 8,
  },

  questionMark: {
    fontSize: 28,
  },

  input: {
    width: 110,
    height: 60,
    fontSize: 26,
    textAlign: "center",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#7FA896",
    marginBottom: 16,
  },

  inputError: {
    borderColor: "#D97B6C",
    backgroundColor: "#FFE8E8",
  },

  attemptsBox: {
    backgroundColor: "#FFE8E8",
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },

  attemptsText: {
    fontSize: 14,
    color: "#D97B6C",
  },

  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  cancelText: {
    fontSize: 16,
  },

  confirmButton: {
    flex: 1,
    backgroundColor: "#7FA896",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  confirmButtonDisabled: {
    opacity: 0.5,
  },

  confirmText: {
    fontSize: 16,
    color: "#FFF",
  },
});
