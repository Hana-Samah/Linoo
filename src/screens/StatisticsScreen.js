import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import { useState, useCallback, useRef } from "react";
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

export default function StatisticsScreen({ navigation }) {
  const [topWords, setTopWords] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [totalStars, setTotalStars] = useState(0);
  
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

  const allAchievements = Object.values(ACHIEVEMENTS_LIST);
  const achievementProgress = Math.round((achievements.length / allAchievements.length) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />

      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إحصائياتي</Text>
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>📊</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* رسالة تحفيزية */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationIcon}>⭐</Text>
            <Text style={styles.motivationText}>{motivationalMsg}</Text>
          </View>

          {/* بطاقات الملخص الرئيسية */}
          <View style={styles.summaryCards}>
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
            <Text style={styles.wordsTitle}>الكلمات الأكثر استخداماً 💬</Text>
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
                {achievements.length} / {allAchievements.length}
              </Text>
            </View>

            <View style={styles.achievementsProgressBar}>
              <View style={[styles.achievementsProgressFill, { width: `${achievementProgress}%` }]} />
            </View>

            <View style={styles.achievementsList}>
              {allAchievements.map((achievement) => {
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  container: {
    flex: 1,
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
    fontSize: 22,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  /* ====== رسالة تحفيزية ====== */
  motivationCard: {
    backgroundColor: "#FFD700",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  motivationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  motivationText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },

  /* ====== بطاقات الملخص ====== */
  summaryCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
  },
  starsCard: {
    borderColor: "#FFD700",
  },
  levelCard: {
    borderColor: "#FF6B6B",
  },
  streakCard: {
    borderColor: "#FF4500",
  },
  summaryIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#636E72",
    fontWeight: "600",
  },

  /* ====== شريط تقدم المستوى ====== */
  levelProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: "#7FA896",
  },
  levelProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelProgressTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3436",
  },
  levelProgressPercentage: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7FA896",
  },
  progressBarContainer: {
    height: 16,
    backgroundColor: "#E8EAED",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#7FA896",
    borderRadius: 8,
  },
  levelProgressSubtext: {
    fontSize: 13,
    color: "#636E72",
    textAlign: "center",
  },

  /* ====== الرسم البياني ====== */
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3436",
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
    backgroundColor: "#7FA896",
    borderRadius: 8,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dayLabel: {
    fontSize: 10,
    color: "#636E72",
    fontWeight: "600",
    textAlign: "center",
  },

  /* ====== قائمة الكلمات ====== */
  wordsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wordsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 16,
  },
  wordItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  wordRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7FA896",
    justifyContent: "center",
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  wordCount: {
    fontSize: 13,
    color: "#636E72",
  },
  wordBar: {
    width: 80,
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  wordBarFill: {
    height: "100%",
    backgroundColor: "#7FA896",
    borderRadius: 3,
  },

  /* ====== الإنجازات ====== */
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
    fontWeight: "700",
    color: "#2D3436",
  },
  achievementsProgress: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7FA896",
  },
  achievementsProgressBar: {
    height: 12,
    backgroundColor: "#E8EAED",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 20,
  },
  achievementsProgressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 6,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 2,
    borderColor: "#E8EAED",
  },
  achievementUnlocked: {
    backgroundColor: "#FFF9E6",
    borderColor: "#FFD700",
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
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 13,
    color: "#636E72",
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
  },
  achievementLockText: {
    fontSize: 11,
    color: "#999",
  },
  achievementStars: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  achievementStarsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },

  /* ====== حالة فارغة ====== */
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
    color: "#9A9A9A",
  },
});