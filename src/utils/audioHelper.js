/* =============================================
   🔊 مساعد تشغيل الأصوات المحلية
   ملف: src/utils/audioHelper.js
   ============================================= */

import { Audio } from "expo-av";
import * as Speech from "expo-speech";

let currentSound = null;

/* =============================================
   🎵 أصوات التشجيع المحلية
   ============================================= */

const ENCOURAGEMENT_SOUNDS = {
  correct: require("../../assets/sounds/encouragement/correct.mp3"),
  try_again: require("../../assets/sounds/encouragement/try_again.mp3"),
};

/* =============================================
   ▶️ تشغيل صوت تشجيعي
   ============================================= */

export const playEncouragementSound = async (soundKey) => {
  try {
    // إيقاف أي صوت سابق
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }
    Speech.stop();

    // التحقق من وجود الصوت
    if (!ENCOURAGEMENT_SOUNDS[soundKey]) {
      console.warn(`Encouragement sound "${soundKey}" not found`);
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      ENCOURAGEMENT_SOUNDS[soundKey],
      { shouldPlay: true }
    );

    currentSound = sound;

    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          currentSound = null;
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Error playing encouragement sound:", error);
  }
};

/* =============================================
   🎲 تشغيل صوت عشوائي من مجموعة
   ============================================= */

export const playRandomEncouragement = async (soundKeys = ['correct']) => {
  const randomKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
  await playEncouragementSound(randomKey);
};

/* =============================================
   🛑 إيقاف أي صوت
   ============================================= */

export const stopAllSounds = async () => {
  if (currentSound) {
    await currentSound.unloadAsync();
    currentSound = null;
  }
  Speech.stop();
};

/* =============================================
   🎯 تشغيل صوت كلمة (محلي أو TTS)
   ============================================= */

export const playWordAudio = async (word) => {
  try {
    // إيقاف أي صوت سابق
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }
    Speech.stop();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    // ✅ إذا الكلمة تستخدم TTS
    if (word.useTTS) {
      Speech.speak(word.text, { 
        language: "ar", 
        rate: 0.55, 
        pitch: 1.2 
      });
      return;
    }

    // ✅ إذا فيه صوت محلي
    if (word.audioUri) {
      const { sound } = await Audio.Sound.createAsync(
        typeof word.audioUri === "string"
          ? { uri: word.audioUri }
          : word.audioUri,
        { shouldPlay: true }
      );

      currentSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          currentSound = null;
        }
      });
    } else {
      // ✅ fallback للـ TTS
      Speech.speak(word.text, { 
        language: "ar", 
        rate: 0.55, 
        pitch: 1.2 
      });
    }
  } catch (error) {
    console.error("Error playing word audio:", error);
    // fallback للـ TTS
    Speech.speak(word.text, { 
      language: "ar", 
      rate: 0.55, 
      pitch: 1.2 
    });
  }
};