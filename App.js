import { I18nManager } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/screens/SplashScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import ChildInfoScreen from "./src/screens/ChildInfoScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ParentGateScreen from "./src/screens/ParentGateScreen";
import ParentMenuScreen from "./src/screens/ParentMenuScreen";
import AACScreen from "./src/screens/AACScreen";
import WordManagerScreen from "./src/screens/WordManagerScreen";
import WordFormScreen from "./src/screens/WordFormScreen";
import CategoryManagerScreen from "./src/screens/CategoryManagerScreen";
import CategoryFormScreen from "./src/screens/CategoryFormScreen";
import LearningScreen from "./src/screens/LearningScreen"; 
import ChildProfileScreen from "./src/screens/ChildProfileScreen";
import StoryReaderScreen from "./src/screens/StoryReaderScreen"; 
import QuizScreen from './src/screens/QuizScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';

const Stack = createNativeStackNavigator();
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="ChildInfo" component={ChildInfoScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ParentGate" component={ParentGateScreen} />
        <Stack.Screen name="ParentMenu" component={ParentMenuScreen} />
        <Stack.Screen name="AAC" component={AACScreen} />
        <Stack.Screen name="WordManager" component={WordManagerScreen} />
        <Stack.Screen name="WordForm" component={WordFormScreen} />
        <Stack.Screen name="CategoryManager" component={CategoryManagerScreen} />
        <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
        <Stack.Screen name="Learning" component={LearningScreen} /> 
        <Stack.Screen name="ChildProfile" component={ChildProfileScreen} />
        <Stack.Screen name="StoryReader" component={StoryReaderScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}