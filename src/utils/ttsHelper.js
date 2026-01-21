/* =============================================
   🎙️ مساعد TTS محسّن (بصوت أنثوي واضح)
   ============================================= */

import * as Speech from "expo-speech";

/* =============================================
   🔍 الحصول على الأصوات المتاحة
   ============================================= */

export const getAvailableVoices = async () => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    
    // ✅ فلترة الأصوات العربية فقط
    const arabicVoices = voices.filter(voice => 
      voice.language.startsWith('ar')
    );
    
    console.log('Arabic Voices:', arabicVoices);
    return arabicVoices;
  } catch (error) {
    console.error('Error getting voices:', error);
    return [];
  }
};

/* =============================================
   🎵 تشغيل الكلام بصوت أنثوي
   ============================================= */

export const speakWithFemaleVoice = async (text, options = {}) => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    
    // ✅ البحث عن صوت عربي أنثوي
    // الأسماء الشائعة للأصوات العربية الأنثوية:
    const femaleVoiceNames = [
      'Laila',      // iOS Arabic Female
      'Maged',      // قد يكون متاح
      'ar-SA',      // Saudi Female
      'ar-EG',      // Egyptian Female
      'Amelie',     // بديل فرنسي (يمكن يكون واضح)
    ];
    
    // ✅ محاولة إيجاد صوت أنثوي
    let selectedVoice = voices.find(voice => 
      voice.language.startsWith('ar') && 
      (voice.name.includes('female') || 
       voice.name.includes('Laila') ||
       femaleVoiceNames.some(name => voice.name.includes(name)))
    );
    
    // ✅ إذا ما لقينا، نستخدم أول صوت عربي متاح
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.language.startsWith('ar'));
    }
    
    // ✅ إعدادات محسّنة للصوت
    const speechOptions = {
      language: selectedVoice?.language || 'ar-SA',
      voice: selectedVoice?.identifier,
      pitch: 1.2,        // أعلى قليلاً (أنثوي)
      rate: 1.00,       
      volume: 1.0,       // صوت كامل
      ...options,
    };
    
    await Speech.speak(text, speechOptions);
    
  } catch (error) {
    console.error('Error speaking:', error);
    // ✅ fallback للصوت الافتراضي
    Speech.speak(text, {
      language: 'ar',
      pitch: 1.2,
      rate: 1.00,
    });
  }
};

/* =============================================
   🎯 تشغيل بإعدادات مخصصة للأطفال
   ============================================= */

export const speakForChild = async (text) => {
  await speakWithFemaleVoice(text, {
    pitch: 1.3,    // صوت أعلى (أطفالي)
    rate: 0.8,     // أبطأ (واضح للأطفال)
  });
};

/* =============================================
   🛑 إيقاف الكلام
   ============================================= */

export const stopSpeaking = () => {
  Speech.stop();
};