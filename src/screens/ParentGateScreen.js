import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { COLORS } from "../styles/colors";

export default function ParentGateScreen({ navigation }) {
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );
  const isPortrait = screenDimensions.height > screenDimensions.width;

  const [modalVisible, setModalVisible] = useState(true);
  const [question, setQuestion] = useState(generateQuestion());
  const [answer, setAnswer] = useState("");
  const [errorShake, setErrorShake] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

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
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setErrorShake(false);
      // بعد الاهتزاز، إغلاق النافذة والرجوع للصفحة الرئيسية
      setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setModalVisible(false);
          navigation.navigate("Home");
        });
      }, 500);
    });
  };

  const checkAnswer = () => {
    if (parseInt(answer) === question.answer) {
      // إجابة صحيحة - الذهاب لقائمة الوالدين
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
        navigation.navigate("ParentMenu");
      });
    } else {
      // إجابة خاطئة - اهتزاز ثم الرجوع للصفحة الرئيسية
      shakeError();
    }
  };

  const handleCancel = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      navigation.navigate("Home");
    });
  };

  return (
    <Modal transparent animationType="fade" visible={modalVisible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <Animated.View
            style={[
              styles.container,
              isPortrait && styles.containerPortrait,
              {
                transform: [
                  { scale: scaleAnim },
                  { translateX: shakeAnimation },
                ],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* 🎨 خلفية ترابية */}
              <View style={styles.backgroundPattern}>
                <View style={[styles.floatingShape, styles.shape1]} />
                <View style={[styles.floatingShape, styles.shape2]} />
              </View>

              {/* زر الإغلاق */}
              <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>

              {/* الأيقونة */}
              <View style={[styles.iconContainer, !isPortrait && styles.iconContainerLandscape]}>
                <Text style={[styles.lockIcon, !isPortrait && styles.lockIconLandscape]}>🔒</Text>
              </View>

              {/* العنوان */}
              <Text style={[styles.title, !isPortrait && styles.titleLandscape]}>للكبار فقط</Text>
              
              {isPortrait && (
                <Text style={styles.subtitle}>حل المسألة للمتابعة</Text>
              )}

              {/* السؤال */}
              <View style={[styles.questionBox, !isPortrait && styles.questionBoxLandscape]}>
                <Text style={[styles.questionText, !isPortrait && styles.questionTextLandscape]}>{question.question}</Text>
                <Text style={[styles.equalsSign, !isPortrait && styles.equalsSignLandscape]}>=</Text>
                <Text style={[styles.questionMark, !isPortrait && styles.questionMarkLandscape]}>؟</Text>
              </View>

              {/* الإدخال */}
              <TextInput
                style={[styles.input, errorShake && styles.inputError, !isPortrait && styles.inputLandscape]}
                keyboardType="number-pad"
                value={answer}
                onChangeText={setAnswer}
                placeholder="0"
                placeholderTextColor={COLORS.text.light}
                maxLength={3}
                autoFocus={true}
                onSubmitEditing={checkAnswer}
              />

              {/* رسالة تحذيرية */}
              {errorShake && (
                <View style={[styles.errorBox, !isPortrait && styles.errorBoxLandscape]}>
                  <Text style={[styles.errorText, !isPortrait && styles.errorTextLandscape]}>
                    ⚠️ إجابة خاطئة! سيتم الرجوع للصفحة الرئيسية...
                  </Text>
                </View>
              )}

              {/* الأزرار */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, !isPortrait && styles.buttonLandscape]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.cancelText, !isPortrait && styles.buttonTextLandscape]}>إلغاء</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    !answer && styles.confirmButtonDisabled,
                    !isPortrait && styles.buttonLandscape,
                  ]}
                  onPress={checkAnswer}
                  disabled={!answer}
                >
                  <Text style={[styles.confirmText, !isPortrait && styles.buttonTextLandscape]}>تأكيد</Text>
                </TouchableOpacity>
              </View>

              {/* نص تحذيري */}
              {isPortrait && (
                <Text style={styles.warningText}>
                  💡 هذا القفل لحماية إعدادات طفلك
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    backgroundColor: COLORS.background,
    width: "85%",
    maxWidth: 450,
    padding: 30,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 5,
    borderColor: COLORS.neutral.white,
  },
  containerPortrait: {
    width: "90%",
    padding: 25,
  },

  /* 🎨 خلفية ترابية */
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 30,
    overflow: "hidden",
  },
  floatingShape: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.08,
  },
  shape1: {
    width: 150,
    height: 150,
    backgroundColor: COLORS.primary.green,
    top: -50,
    right: -50,
  },
  shape2: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.secondary.orange,
    bottom: -40,
    left: -40,
  },

  /* زر الإغلاق */
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.neutral.cream,
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text.secondary,
  },

  /* الأيقونة */
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary.teal,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 5,
    borderColor: COLORS.neutral.white,
  },
  iconContainerLandscape: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
    borderWidth: 4,
  },
  lockIcon: {
    fontSize: 45,
  },
  lockIconLandscape: {
    fontSize: 35,
  },

  /* العنوان */
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary.darkTeal,
    marginBottom: 8,
  },
  titleLandscape: {
    fontSize: 22,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.secondary,
    marginBottom: 20,
  },

  /* السؤال */
  questionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 4,
    borderColor: COLORS.primary.sage,
  },
  questionBoxLandscape: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 3,
  },
  questionText: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  questionTextLandscape: {
    fontSize: 26,
  },
  equalsSign: {
    fontSize: 28,
    fontWeight: "700",
    marginHorizontal: 12,
    color: COLORS.text.secondary,
  },
  equalsSignLandscape: {
    fontSize: 22,
    marginHorizontal: 8,
  },
  questionMark: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.secondary.orange,
  },
  questionMarkLandscape: {
    fontSize: 26,
  },

  /* الإدخال */
  input: {
    width: 130,
    height: 70,
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: COLORS.primary.green,
    backgroundColor: COLORS.neutral.white,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    color: COLORS.text.primary,
  },
  inputLandscape: {
    width: 110,
    height: 60,
    fontSize: 28,
    borderRadius: 15,
    borderWidth: 3,
    marginBottom: 15,
  },
  inputError: {
    borderColor: COLORS.secondary.rust,
    backgroundColor: COLORS.secondary.peach,
  },

  /* رسالة الخطأ */
  errorBox: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: COLORS.secondary.rust,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  errorBoxLandscape: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.secondary.rust,
    textAlign: "center",
  },
  errorTextLandscape: {
    fontSize: 12,
  },

  /* الأزرار */
  buttonsContainer: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
    marginBottom: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 3,
    borderColor: COLORS.neutral.cream,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary.green,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  buttonLandscape: {
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 2,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  cancelText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text.primary,
  },
  confirmText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.neutral.white,
  },
  buttonTextLandscape: {
    fontSize: 16,
  },

  /* نص تحذيري */
  warningText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text.secondary,
    textAlign: "center",
  },
});