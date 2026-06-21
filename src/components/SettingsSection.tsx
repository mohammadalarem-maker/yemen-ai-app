import React from "react";
import { AppSettings, UserProfile } from "../types";
import { 
  Settings, Globe, Moon, Sun, Bell, Shield, Info, Landmark, Users, Check, ExternalLink
} from "lucide-react";

interface SettingsSectionProps {
  settings: AppSettings;
  user: UserProfile;
  onChangeSettings: (settings: AppSettings) => void;
}

export default function SettingsSection({
  settings,
  user,
  onChangeSettings
}: SettingsSectionProps) {
  const isAr = settings.language === "ar";

  const handleLanguageToggle = (lang: "ar" | "en") => {
    onChangeSettings({
      ...settings,
      language: lang
    });
  };

  const handleThemeToggle = (theme: "dark" | "light") => {
    onChangeSettings({
      ...settings,
      theme: theme
    });
  };

  const handleNotificationToggle = () => {
    onChangeSettings({
      ...settings,
      notificationsEnabled: !settings.notificationsEnabled
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#161616] rounded-2xl overflow-hidden border border-white/5 shadow-xl font-sans text-right" dir="rtl">
      
      {/* Banner */}
      <div className="px-6 py-5 bg-gradient-to-r from-white/5 to-transparent border-b border-white/5">
        <h2 className="text-xl font-black text-white">{isAr ? "الإعدادات والنظام ⚙️" : "Settings & System ⚙️"}</h2>
        <p className="text-xs text-gray-400 mt-1">
          {isAr ? "تخصيص لغة الواجهة، شكل السطوع، تفعيل التنبيهات، وقراءة قصة ورؤية تطبيق يمن AI." : "Customize preferences, language styles, and review specifications."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 p-6 gap-6">
        
        {/* Left Column: Preferences panel (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1 mb-2">
            {isAr ? "خيارات التجهيز والمظهر" : "Appearance Preferences"}
          </h4>

          {/* 1. Language preference card */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D71920]" />
                {isAr ? "لغة واجهة التطبيق:" : "Application Language:"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLanguageToggle("ar")}
                className={`py-2 rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                  settings.language === "ar" ? "bg-[#D71920]/20 border border-[#D71920]/45 text-white" : "bg-transparent border border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                العربية (العام والاقليمي)
              </button>
              <button
                type="button"
                onClick={() => handleLanguageToggle("en")}
                className={`py-2 rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                  settings.language === "en" ? "bg-[#D71920]/20 border border-[#D71920]/45 text-white" : "bg-transparent border border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                English (USD mode)
              </button>
            </div>
          </div>

          {/* 2. Theme adjustment card */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                {settings.theme === "dark" ? <Moon className="w-4 h-4 text-rose-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                {isAr ? "مظهر السطوع (الثيم):" : "Visual Theme:"}
              </span>
              <span className="text-[10px] text-gray-500 font-bold">{settings.theme === "dark" ? (isAr ? "الوضع المظلم العتيق" : "Heritage Dark") : (isAr ? "وضع النهار" : "Daylight")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleThemeToggle("dark")}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settings.theme === "dark" ? "bg-white/10 text-white border border-white/20" : "bg-transparent text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {isAr ? "الوضع الليلي (موصى به)" : "Midnight Dark"}
              </button>
              <button
                type="button"
                onClick={() => handleThemeToggle("light")}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settings.theme === "light" ? "bg-white/10 text-white border border-white/20" : "bg-transparent text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {isAr ? "الوضع المشرق" : "Classic Light"}
              </button>
            </div>
          </div>

          {/* 3. Notification switches */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-500" />
              <div className="text-right">
                <span className="text-xs font-semibold text-white block">{isAr ? "تلقي تذكيرات وتنبيهات هامة:" : "Push System Notifications:"}</span>
                <span className="text-[9px] text-gray-500 font-medium leading-tight block mt-0.5">{isAr ? "مثل إشعارات التحديث للمناهج وأسعار الصرف" : "Yemen school notes & fx shifts updates"}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNotificationToggle}
              className={`w-11 h-6 rounded-full transition-all relative ${
                settings.notificationsEnabled ? "bg-[#D71920]" : "bg-gray-700"
              }`}
            >
              <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                settings.notificationsEnabled ? "left-1" : "left-6"
              }`} />
            </button>
          </div>

          {/* 4. Privacy Shield notes */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-xl flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500 shrink-0" />
            <div className="text-right leading-relaxed">
              <span className="text-xs font-bold text-white block">{isAr ? "سياسة الخصوصية وحماية البيانات" : "Zero-Trust Security Active"}</span>
              <p className="text-[9/px] text-gray-400 text-[10px]">
                {isAr 
                  ? "جميع محادثات المساعد مشفرة تماماً. يمن AI لا يشارك معلومات المشاريع أو البيانات الشخصية مع أي أطراف ثالثة."
                  : "Database states are encrypted server-side."}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: About Section (Span 7) */}
        <div className="lg:col-span-12 xl:col-span-7 bg-[#121212] border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="w-10 h-10 rounded-full bg-[#D71920]/15 flex items-center justify-center text-xl">
                🇾🇪
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">{isAr ? "يمن AI - أول مساعد ذكي يمني" : "Yemen AI - Companion Project"}</h4>
                <span className="text-[10px] text-gray-500 font-bold">{isAr ? "الإصدار 1.0.2 - بيتا مخصصة" : "Version 1.0.2 Beta"}</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-gray-300 leading-relaxed font-sans">
              <p>
                {isAr 
                  ? "تم ابتكار وتطوير تطبيق يمن AI ليكون الجسر المعرفي الذكي الأول المخصص بامتياز لتفادي العوائق للمستخدم اليمني. بطلنا يتمتع بالوعي التام لخصوصية بيئتنا اليمنية الصامدة."
                  : "Yemen AI was constructed specifically to empower Yemeni students, workers, and entrepreneurs in navigating daily challenges."}
              </p>
              
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-2">
                <span className="text-xs font-bold text-[#D9A14E] block">{isAr ? "🌟 ما جعل يمن AI استثنائياً وسابقاً لغيره:" : "Core Pillars:"}</span>
                <ul className="space-y-1.5 list-disc list-inside text-[11px] text-gray-400">
                  <li>{isAr ? "الفهم التلقائي المتقن لكل اللهجات اليمانية (صنعاني، عدني، تعزي، حضرمي...)." : "Understand unique local expressions."}</li>
                  <li>{isAr ? "أداة كتابة وصياغة الشكاوى والمعاملات الرسمية متطابقة للوائح الوطنية." : "Format templates matching Yemen directories."}</li>
                  <li>{isAr ? "قسم مستشار الأعمال اليمني وحاسبة الصرف (صنعاء والجنوب)." : "Local dollar exchanges calculator (Sanaa/Aden)."}</li>
                  <li>{isAr ? "مساعد الطالب لشروح المناهج وتلخيص الدروس الوزارية بأسلوب تفاعلي." : "Yemen school material summarizer."}</li>
                </ul>
              </div>

              <p>
                {isAr 
                  ? "يجمع تطبيق يمن AI بين متانة نماذج Gemini 3.5 الفائقة وبين دفء المعرفة الثقافية المحلية. نأمل أن يكون 'صاحبك' السند المتين والذكي لك دايماً في دراستك وأعمالك وتوليد إلهامك الفني."
                  : "We aim to make Sahibak AI a trusted friend supporting your daily business and growth."}
              </p>
            </div>

          </div>

          {/* Partners and links */}
          <div className="border-t border-white/5 pt-4 text-center">
            <span className="text-[10px] text-gray-500 font-bold block">
              {isAr ? "صنع بحب وتقدير في اليمن ولجميع اليمنيين في الداخل والخارج." : "Crafted with respect for Yemen community."}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
