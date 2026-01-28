import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getTopUsedWords,
  getWeeklyStats,
} from "../storage/wordsTracking";
import { getStars } from "../data/stories";
import {
  getStars as getRewardStars,
  getUserLevel,
  getAchievements,
  getCurrentStreak,
  ACHIEVEMENTS_LIST,
  getMotivationalMessage,
  getCompleteStats,
} from "../storage/rewardsTracking";
import { COLORS } from "../styles/colors";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const icons = {
  back: require("../../assets/backspace-icon.webp"),
  statistics: require("../../assets/statistics-icon.webp"),
  print: require("../../assets/manager/print-icon.webp"),
};

export default function StatisticsScreen({ navigation }) {
  const [topWords, setTopWords] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [totalStars, setTotalStars] = useState(0);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );
  const isPortrait = screenDimensions.height > screenDimensions.width;
  
  // بيانات المكافآت المبسطة
  const [stars, setStars] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(0);
  const [motivationalMsg, setMotivationalMsg] = useState("");

  // أنيميشن
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllStats();
      
      // أنيميشن الدخول
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
      ]).start();
    }, [])
  );

  const loadAllStats = async () => {
    // إحصائيات الكلمات والقصص
    const words = await getTopUsedWords(5);
    const weekly = await getWeeklyStats();
    const storyStars = await getStars();

    setTopWords(words);
    setWeeklyStats(weekly);
    setTotalStars(storyStars);

    // إحصائيات المكافآت المبسطة
    const stats = await getCompleteStats();
    if (stats) {
      setStars(stats.stars);
      setLevel(stats.level);
      setLevelProgress(stats.levelProgress);
      setAchievements(stats.achievements);
      setStreak(stats.streak);
    }
    
    const message = getMotivationalMessage();
    setMotivationalMsg(message);
  };

  const maxCount = weeklyStats?.dailyData?.length
    ? Math.max(...weeklyStats.dailyData.map((d) => d.count))
    : 0;

  // تصفية الإنجازات - حذف الإنجازات المطلوبة
  const filteredAchievements = Object.values(ACHIEVEMENTS_LIST).filter(achievement => 
    achievement.id !== 'FIRST_WORD' &&          // الكلمة الأولى
    achievement.id !== 'WORD_EXPLORER' &&       // مكتشف الكلمات
    achievement.id !== 'BEGINNER_READER' &&     // قارئ مبتدئ
    achievement.id !== 'STORY_LOVER'            // محب القصص
  );

  const modifiedAchievements = filteredAchievements;

  const achievementProgress = Math.round((achievements.filter(a => 
    filteredAchievements.some(fa => fa.id === a.id)
  ).length / modifiedAchievements.length) * 100);

  // دالة الطباعة/الحفظ
  const generateAndPrintReport = async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير الإحصائيات</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #FAF8F5;
          }
          .header {
            text-align: center;
            background: linear-gradient(135deg, #7FA896, #5B8A8F);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
          }
          .summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .summary-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            min-width: 150px;
            margin: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .summary-card .icon {
            font-size: 40px;
            margin-bottom: 10px;
          }
          .summary-card .value {
            font-size: 28px;
            font-weight: bold;
            color: #2D3436;
          }
          .summary-card .label {
            font-size: 14px;
            color: #636E72;
            margin-top: 5px;
          }
          .section {
            background: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #2D3436;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #7FA896;
          }
          .word-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #F0F0F0;
          }
          .word-rank {
            width: 30px;
            height: 30px;
            background: #7FA896;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-left: 15px;
          }
          .word-text {
            flex: 1;
            font-weight: 600;
            color: #2D3436;
          }
          .word-count {
            color: #636E72;
            font-size: 14px;
          }
          .achievement-item {
            background: #FFF9E6;
            border: 2px solid #FFD700;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          .achievement-icon {
            font-size: 40px;
            margin-left: 15px;
          }
          .achievement-info {
            flex: 1;
          }
          .achievement-name {
            font-weight: bold;
            color: #2D3436;
            margin-bottom: 5px;
          }
          .achievement-desc {
            font-size: 13px;
            color: #636E72;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #636E72;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 تقرير الإحصائيات</h1>
          <p>تقرير شامل للإنجازات والتقدم</p>
          <p>${new Date().toLocaleDateString('ar-SA')}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="icon">⭐</div>
            <div class="value">${stars}</div>
            <div class="label">نجمة</div>
          </div>
          <div class="summary-card">
            <div class="icon">🏆</div>
            <div class="value">${level}</div>
            <div class="label">المستوى</div>
          </div>
          <div class="summary-card">
            <div class="icon">🔥</div>
            <div class="value">${streak}</div>
            <div class="label">يوم متتالي</div>
          </div>
        </div>

        ${topWords.length > 0 ? `
        <div class="section">
          <div class="section-title">الكلمات الأكثر استخداماً 💬</div>
          ${topWords.map((word, index) => `
            <div class="word-item">
              <div class="word-rank">${index + 1}</div>
              <div class="word-text">${word.wordText}</div>
              <div class="word-count">${word.count} مرة</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${achievements.filter(a => modifiedAchievements.some(ma => ma.id === a.id)).length > 0 ? `
        <div class="section">
          <div class="section-title">الإنجازات المكتسبة 🏅</div>
          ${achievements.filter(a => modifiedAchievements.some(ma => ma.id === a.id)).map(achievement => {
            const achievementData = modifiedAchievements.find(ma => ma.id === achievement.id);
            return `
              <div class="achievement-item">
                <div class="achievement-icon">${achievementData.icon}</div>
                <div class="achievement-info">
                  <div class="achievement-name">${achievementData.name}</div>
                  <div class="achievement-desc">${achievementData.description}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}

        <div class="footer">
          <p>🦁 تطبيق Linoo - رفيق طفلك في رحلة التواصل والتعلم</p>
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'مشاركة التقرير',
        });
      } else {
        Alert.alert('نجح', 'تم حفظ التقرير بنجاح');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء التقرير');
      console.error(error);
    }
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

      {/* الهيدر */}
      <View style={[styles.header, isPortrait && styles.headerPortrait]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Image source={icons.statistics} style={styles.headerIcon} resizeMode="contain" />
          <Text style={[styles.headerTitle, isPortrait && styles.headerTitlePortrait]}>إحصائياتي</Text>
        </View>

        <TouchableOpacity
          onPress={generateAndPrintReport}
          style={styles.printButton}
        >
          <Image source={icons.print} style={styles.printIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, isPortrait && styles.scrollContentPortrait]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* رسالة تحفيزية */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>{motivationalMsg}</Text>
          </View>

          {/* بطاقات الملخص الرئيسية */}
          <View style={[styles.summaryCards, !isPortrait && styles.summaryCardsLandscape]}>
            {/* النجوم */}
            <View style={[styles.summaryCard, styles.starsCard]}>
              <Text style={styles.summaryIcon}>⭐</Text>
              <Text style={styles.summaryValue}>{stars}</Text>
              <Text style={styles.summaryLabel}>نجمة</Text>
            </View>

            {/* المستوى */}
            <View style={[styles.summaryCard, styles.levelCard]}>
              <Text style={styles.summaryIcon}>🏆</Text>
              <Text style={styles.summaryValue}>{level}</Text>
              <Text style={styles.summaryLabel}>المستوى</Text>
            </View>

            {/* الاستمرارية */}
            <View style={[styles.summaryCard, styles.streakCard]}>
              <Text style={styles.summaryIcon}>🔥</Text>
              <Text style={styles.summaryValue}>{streak}</Text>
              <Text style={styles.summaryLabel}>يوم متتالي</Text>
            </View>
          </View>

          {/* شريط تقدم المستوى */}
          <View style={styles.levelProgressCard}>
            <View style={styles.levelProgressHeader}>
              <Text style={styles.levelProgressTitle}>التقدم للمستوى التالي</Text>
              <Text style={styles.levelProgressPercentage}>{levelProgress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${levelProgress}%` }]} />
            </View>
            <Text style={styles.levelProgressSubtext}>
              {50 - (stars % 50)} نجمة متبقية للمستوى {level + 1}
            </Text>
          </View>

          {/* الرسم البياني الأسبوعي */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>الاستخدام خلال الأسبوع</Text>
            <View style={styles.chart}>
              {weeklyStats?.dailyData?.map((day, index) => {
                const barHeight = maxCount > 0 ? (day.count / maxCount) * 150 : 0;
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View style={[styles.bar, { height: Math.max(barHeight, 4) }]}>
                        {day.count > 0 && <Text style={styles.barValue}>{day.count}</Text>}
                      </View>
                    </View>
                    <Text style={styles.dayLabel}>{day.dayName}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* الكلمات الأكثر استخداماً */}
          <View style={styles.wordsCard}>
            <Text style={styles.wordsTitle}>الكلمات الأكثر استخداماً</Text>
            {topWords.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>لا توجد كلمات مستخدمة بعد</Text>
              </View>
            ) : (
              topWords.map((word, index) => (
                <View key={word.wordId} style={styles.wordItem}>
                  <View style={styles.wordRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.wordInfo}>
                    <Text style={styles.wordText}>{word.wordText}</Text>
                    <Text style={styles.wordCount}>{word.count} مرة</Text>
                  </View>
                  <View style={styles.wordBar}>
                    <View
                      style={[
                        styles.wordBarFill,
                        { width: `${(word.count / topWords[0].count) * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </View>

          {/* الإنجازات */}
          <View style={styles.achievementsContainer}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.achievementsTitle}>الإنجازات المكتسبة</Text>
              <Text style={styles.achievementsProgress}>
                {achievements.filter(a => modifiedAchievements.some(ma => ma.id === a.id)).length} / {modifiedAchievements.length}
              </Text>
            </View>

            <View style={styles.achievementsProgressBar}>
              <View style={[styles.achievementsProgressFill, { width: `${achievementProgress}%` }]} />
            </View>

            <View style={styles.achievementsList}>
              {modifiedAchievements.map((achievement) => {
                const isUnlocked = achievements.some(a => a.id === achievement.id);
                const unlockedData = achievements.find(a => a.id === achievement.id);

                return (
                  <View
                    key={achievement.id}
                    style={[
                      styles.achievementCard,
                      isUnlocked && styles.achievementUnlocked,
                    ]}
                  >
                    <Text style={[styles.achievementIcon, !isUnlocked && styles.achievementLocked]}>
                      {achievement.icon}
                    </Text>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementName}>{achievement.name}</Text>
                      <Text style={styles.achievementDesc}>{achievement.description}</Text>
                      {isUnlocked && unlockedData && (
                        <Text style={styles.achievementDate}>
                          ✅ {unlockedData.dateString}
                        </Text>
                      )}
                      {!isUnlocked && (
                        <Text style={styles.achievementLockText}>🔒 مغلق</Text>
                      )}
                    </View>
                    {isUnlocked && achievement.stars > 0 && (
                      <View style={styles.achievementStars}>
                        <Text style={styles.achievementStarsText}>+{achievement.stars} ⭐</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
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
    tintColor: COLORS.secondary.yellow,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.secondary.yellow,
  },
  headerTitlePortrait: {
    fontSize: 24,
  },
  printButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary.teal,
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
  printIcon: {
    width: 33,
    height: 33,
  },

  scrollContent: {
    padding: 20,
  },
  scrollContentPortrait: {
    padding: 15,
  },

  /* رسالة تحفيزية */
  motivationCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: COLORS.secondary.yellow,
  },
  motivationIcon: {
    fontSize: 40,
  },
  motivationText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text.primary,
    lineHeight: 24,
  },

  /* بطاقات الملخص */
  summaryCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCardsLandscape: {
    justifyContent: "space-between",
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
  },
  starsCard: {
    borderColor: COLORS.secondary.yellow,
  },
  levelCard: {
    borderColor: COLORS.secondary.orange,
  },
  streakCard: {
    borderColor: COLORS.secondary.rust,
  },
  summaryIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
    fontWeight: "700",
  },

  /* شريط تقدم المستوى */
  levelProgressCard: {
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
    borderColor: COLORS.primary.green,
  },
  levelProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelProgressTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text.primary,
  },
  levelProgressPercentage: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.primary.green,
  },
  progressBarContainer: {
    height: 18,
    backgroundColor: COLORS.neutral.cream,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary.green,
    borderRadius: 10,
  },
  levelProgressSubtext: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: "center",
    fontWeight: "600",
  },

  /* الرسم البياني */
  chartCard: {
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
  chartTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 180,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    height: 150,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  bar: {
    width: 28,
    backgroundColor: COLORS.primary.teal,
    borderRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 4,
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  barValue: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.neutral.white,
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    fontWeight: "700",
    textAlign: "center",
  },

  /* قائمة الكلمات */
  wordsCard: {
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
  wordsTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  wordItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.neutral.cream,
    gap: 12,
  },
  wordRank: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.primary.green,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.neutral.white,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  wordCount: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  wordBar: {
    width: 80,
    height: 8,
    backgroundColor: COLORS.neutral.cream,
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.neutral.white,
  },
  wordBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary.green,
    borderRadius: 4,
  },

  /* الإنجازات */
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  achievementsProgress: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary.green,
  },
  achievementsProgressBar: {
    height: 14,
    backgroundColor: COLORS.neutral.cream,
    borderRadius: 7,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  achievementsProgressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary.yellow,
    borderRadius: 7,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: COLORS.neutral.cream,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  achievementUnlocked: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.secondary.yellow,
    borderWidth: 4,
  },
  achievementIcon: {
    fontSize: 48,
  },
  achievementLocked: {
    opacity: 0.3,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 11,
    color: COLORS.primary.green,
    fontWeight: "700",
  },
  achievementLockText: {
    fontSize: 11,
    color: COLORS.text.light,
    fontWeight: "600",
  },
  achievementStars: {
    backgroundColor: COLORS.secondary.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  achievementStarsText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.neutral.white,
  },

  /* حالة فارغة */
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 60,
    opacity: 0.3,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.light,
  },

  bottomSpacer: {
    height: 30,
  },
});