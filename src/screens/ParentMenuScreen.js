import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function ParentMenuScreen({ navigation }) {
  const menuItems = [
    {
      id: 1,
      title: "بروفايل الطفل",
      icon: "👤",
      color: "#D9956C",
      route: "ChildProfile",
      description: "عرض وتعديل المعلومات",
    },
    {
      id: 2,
      title: "إدارة الكلمات",
      icon: "💬",
      color: "#7FA896",
      route: "WordManager",
      description: "إضافة وتعديل الكلمات",
    },
    {
      id: 3,
      title: "إدارة التصنيفات",
      icon: "🗂️",
      color: "#A8C5C5",
      route: "CategoryManager",
      description: "إضافة وتعديل الأقسام",
    },
    {
      id: 4,
      title: "الإحصائيات والتقارير",
      icon: "📊",
      color: "#E8C68E",
      route: "Statistics",
      description: "تقارير الأداء والتقدم",
    },
  ];

  return (
    <View style={styles.container}>
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>🏠</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>إعدادات الأهل</Text>
          <Text style={styles.headerIcon}>⚙️</Text>
        </View>
      </View>

      {/* القائمة */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuCard, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.85}
          >
            {/* الأيقونة */}
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>

            {/* المعلومات */}
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>

            {/* سهم */}
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>←</Text>
            </View>
          </TouchableOpacity>
        ))}

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  backIcon: {
    fontSize: 32,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerIcon: {
    fontSize: 36,
  },

  /* ====== القائمة ====== */
  menuContainer: {
    padding: 20,
  },

  /* ====== بطاقات القائمة ====== */
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    minHeight: 110,
  },

  /* ====== الأيقونة ====== */
  iconContainer: {
    width: 75,
    height: 75,
    borderRadius: 37,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  menuIcon: {
    fontSize: 45,
  },

  /* ====== المعلومات ====== */
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  menuDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },

  /* ====== السهم ====== */
  arrowContainer: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  /* ====== مسافة إضافية ====== */
  bottomSpacer: {
    height: 30,
  },
});