import { useState, useEffect } from "react";
import { Chat, UserProfile, AppSettings } from "./types";
import AuthScreen from "./components/AuthScreen";
import ChatSection from "./components/ChatSection";
import YemeniToolsSection from "./components/YemeniToolsSection";
import ImageGenSection from "./components/ImageGenSection";
import ProfileSection from "./components/ProfileSection";
import SettingsSection from "./components/SettingsSection";
import {
  MessageSquare, Languages, Image, User, Settings, Info,
  Smartphone, Monitor, Sparkles, Moon, Sun, Bell, Battery, Wifi, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "tools" | "images" | "profile" | "settings">("chat");
  const [chats, setChats] = useState<Chat[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<AppSettings>({
    language: "ar",
    theme: "dark",
    notificationsEnabled: true,
    activeDialect: "sanaani"
  });

  const isAr = settings.language === "ar";

  // Initial mock chats for a warm start
  useEffect(() => {
    const initialChats: Chat[] = [
      {
        id: "chat-1",
        title: isAr ? "ترحيب صاحبك الذكي 👋" : "Welcome Chat 👋",
        dialect: "sanaani",
        messages: [
          {
            id: "msg-1",
            role: "model",
            text: isAr
              ? `يا هلا والله وغلا بالغالين، أنا صاحبك الذكي المساعد اليمني الوفي. أرحب تراحيب المطر يا ركني! 🇾🇪\n\nكيف أقدر أساعدك اليوم؟ نقدر نتناقش بلهجتنا الصنعانية الحالية واللبقة، أو نصلح معاملة رسمية للوزارات، أو حتى نحسب ميزانيتك بالريال ونحلل فرق الصرف!`
              : `Hello and a very warm welcome! I am Sahibak, your tailored Yemeni companion.\n\nHow can I help you today? We can talk in traditional Sanaani, Adeni, or write professional administrative letters.`,
            timestamp: new Date()
          }
        ],
        createdAt: new Date()
      }
    ];
    setChats(initialChats);
  }, [settings.language]);

  // Read local profile from storage for quick reload state
  useEffect(() => {
    const localProfile = localStorage.getItem("yemen_ai_user_profile");
    if (localProfile) {
      try {
        setUser(JSON.parse(localProfile));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem("yemen_ai_user_profile", JSON.stringify(profile));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("yemen_ai_user_profile");
  };

  const handleUpdateSubscription = (sub: "free" | "pro") => {
    if (!user) return;
    const updated = { ...user, subscription: sub };
    setUser(updated);
    localStorage.setItem("yemen_ai_user_profile", JSON.stringify(updated));
  };

  const handleIncrementMessages = () => {
    if (!user) return;
    const updated = { ...user, dailyMessageCount: user.dailyMessageCount + 1 };
    setUser(updated);
    localStorage.setItem("yemen_ai_user_profile", JSON.stringify(updated));
  };

  const handleToggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark"
    }));
  };

  const triggerTabChange = (tab: "chat" | "tools" | "images" | "profile" | "settings") => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} settings={settings} />;
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case "chat":
        return (
          <ChatSection
            user={user}
            settings={settings}
            chats={chats}
            onChatsChange={setChats}
            onIncrementMessages={handleIncrementMessages}
          />
        );
      case "tools":
        return <YemeniToolsSection settings={settings} />;
      case "images":
        return (
          <ImageGenSection
            settings={settings}
            user={user}
            onIncrementMessages={handleIncrementMessages}
          />
        );
      case "profile":
        return (
          <ProfileSection
            user={user}
            settings={settings}
            onLogout={handleLogout}
            onUpdateSubscription={handleUpdateSubscription}
          />
        );
      case "settings":
        return (
          <SettingsSection
            settings={settings}
            user={user}
            onChangeSettings={setSettings}
          />
        );
      default:
        return null;
    }
  };

  const appBg = settings.theme === "dark" ? "bg-[#0b0b0b] text-white" : "bg-[#f5f3ef] text-gray-900";
  const mainPanelBg = settings.theme === "dark" ? "bg-[#121212] border-white/5" : "bg-white border-gray-200/50";

  return (
    <div className={`min-h-screen ${appBg} transition-colors duration-500 flex flex-col font-sans select-none relative pb-6`} dir="rtl">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(215,25,32,0.06),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(217,161,78,0.04),transparent_50%)] pointer-events-none" />

      {/* HEADER BAR (Visible everywhere) */}
      <header className="px-4 sm:px-6 py-4 border-b border-white/5 backdrop-blur bg-black/10 z-20 flex justify-between items-center relative select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#D71920]/15 flex items-center justify-center text-xl font-bold border border-[#D71920]/40 shadow-sm">
            🇾🇪
          </div>
          <div className="text-right">
            <h1 className="text-base font-black tracking-tight flex items-center gap-1.5 text-white">
              <span>يمن AI</span>
              <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">نظام صاحبك</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{isAr ? "المساعد الذكي الأول لليمن" : "Sahibak Intelligent System"}</p>
          </div>
        </div>

        {/* UTILITIES AND VIEWS SELECTORS PANEL */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-gray-400 hover:text-white cursor-pointer border border-white/5"
            title={isAr ? "تبديل المظهر" : "Toggle theme"}
          >
            {settings.theme === "dark" ? <Sun className="w-4 h-4 text-amber-500 " /> : <Moon className="w-4 h-4 text-purple-400" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="text-right font-mono hidden md:block">
              <span className="text-[10px] text-gray-400 block font-bold truncate max-w-[120px]">{user.name}</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-[#D9A14E]/20 text-[#D9A14E] border border-[#D9A14E]/30 rounded-full font-black uppercase">
                {user.subscription === "pro" ? "PRO" : "FREE"}
              </span>
            </div>
            <img
              src={user.profilePicture}
              alt={user.name}
              onClick={() => triggerTabChange("profile")}
              className="w-8.5 h-8.5 rounded-full object-cover border border-white/20 hover:border-[#D71920] transition-colors cursor-pointer"
            />
          </div>
        </div>
      </header>

      {/* CORE CONTENT AREA */}
      <main className="flex-grow flex items-stretch justify-center p-2 sm:p-4 lg:p-8 select-none z-10 w-full max-w-7xl mx-auto">
        <div className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-6">
          
          {/* 1. MOBILE VIEW (Visible on Actual Smartphone screens) */}
          <div className="flex lg:hidden flex-col w-full flex-grow relative">
            {/* Clean Native Mobile Navbar */}
            <div className="flex justify-between items-center px-4 py-3 bg-[#171717] border border-white/5 rounded-xl mb-3 shadow-md">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl bg-white/5 border border-white/5 active:scale-95 transition-all"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <span className="text-xs font-black text-rose-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D9A14E]" />
                {activeTab === "chat" ? (isAr ? "دردشة صاحبك" : "Sahibak Chat") :
                 activeTab === "tools" ? (isAr ? "الأدوات اليمانية" : "Yemeni Tools") :
                 activeTab === "images" ? (isAr ? "تجهيز الصور" : "Creative Arts") :
                 activeTab === "profile" ? (isAr ? "الملف الشخصي" : "Profile") : 
                 (isAr ? "الإعدادات" : "Settings")}
              </span>
              <div className="w-8 h-8 bg-[#D71920]/10 border border-[#D71920]/20 rounded-full flex items-center justify-center text-xs">🇾🇪</div>
            </div>

            {/* Responsive Content Container */}
            <div className="flex-1 w-full flex flex-col bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl min-h-[500px]">
              {renderActiveSection()}
            </div>
          </div>

          {/* 2. DESKTOP BENTO VIEW (Visible on PC / Tablets) */}
          <div className="hidden lg:flex lg:col-span-3 p-5 rounded-2xl h-[720px] border flex-col justify-between space-y-6 bg-[#121212] border-white/5">
            <div className="space-y-6">
              <div className="pb-4 border-b border-white/5">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">{isAr ? "البوابات الذكية" : "DASHBOARD SATELLITE"}</h3>
              </div>

              <nav className="space-y-1.5">
                {[
                  { id: "chat", label: isAr ? "دردشة صاحبك الوفي" : "Sahibak Dialogues", tagline: isAr ? "دردشة واستشارات" : "Real-time AI", icon: MessageSquare },
                  { id: "tools", label: isAr ? "الأدوات اليمنية" : "الأدوات اليمنية", tagline: isAr ? "معاملات ودراسات" : "Yemeni Tools", icon: Languages },
                  { id: "images", label: isAr ? "توليد الصور الفنية" : "AI Art Studio", tagline: isAr ? "تراث وخيال رسم" : "Digital Paintings", icon: Image },
                  { id: "profile", label: isAr ? "الملف والاشتراك" : "My Profile", tagline: isAr ? "إدارة باقتك الماسية" : "Balance & plan", icon: User },
                  { id: "settings", label: isAr ? "الإعدادات والنظام" : "Settings Panel", tagline: isAr ? "لغات وثيم السطوع" : "System preferences", icon: Settings }
                ].map((menu) => {
                  const IconComp = menu.icon;
                  return (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => triggerTabChange(menu.id as any)}
                      className={`w-full text-right p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-sm font-extrabold cursor-pointer hover:translate-x-[-4px] ${
                        activeTab === menu.id
                          ? "bg-[#D71920]/15 border border-[#D71920]/30 text-white shadow-sm"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${activeTab === menu.id ? "bg-[#D71920]/20 text-[#D71920]" : "bg-white/5 text-gray-400"}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex-grow select-none">
                        <span className="block text-xs font-black">{menu.label}</span>
                        <span className="block text-[9.5px] text-gray-500 font-semibold mt-0.5">{menu.tagline}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 bg-gradient-to-tr from-[#D71920]/10 to-transparent border border-[#D71920]/20 rounded-2xl space-y-2 relative overflow-hidden text-center select-none">
              <span className="relative z-10 text-[10px] text-[#D9A14E] uppercase font-black tracking-wider block">فخر التراث اليمني الاصيل</span>
              <p className="relative z-10 text-[11px] text-gray-300 leading-normal font-sans">
                {isAr ? "مساعدك الخاص يثق بقوتنا ويبني معك مستقبلاً يمنياً ذكياً." : "Sahibak trusts in our future, building digital solutions."}
              </p>
            </div>
          </div>

          {/* Desktop Content Panel */}
          <div className="hidden lg:flex lg:col-span-9 flex-col h-[720px]">
            {renderActiveSection()}
          </div>

        </div>
      </main>

      {/* NATIVE DRAWER OVERLAY FOR MOBILE NAVIGATION */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex justify-start select-none font-sans"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="w-3/4 max-w-xs h-full bg-[#121212] p-5 border-l border-white/5 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-sm font-black text-white">{isAr ? "تصفح يمن AI" : "Yemen AI Guide"}</span>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {[
                    { id: "chat", label: isAr ? "دردشة صاحبك" : "Chat", icon: MessageSquare },
                    { id: "tools", label: isAr ? "الأدوات اليمنية" : "Yemeni Tools", icon: Languages },
                    { id: "images", label: isAr ? "توليد الصور" : "Draw Images", icon: Image },
                    { id: "profile", label: isAr ? "الملف الشخصي" : "Profile", icon: User },
                    { id: "settings", label: isAr ? "الإعدادات" : "Settings", icon: Settings }
                  ].map((m) => {
                    const IconComp = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => triggerTabChange(m.id as any)}
                        className={`w-full text-right py-3 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                          activeTab === m.id ? "bg-[#D71920]/20 border border-[#D71920]/30 text-white" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <IconComp className="w-4.5 h-4.5 shrink-0 text-[#D9A14E]" />
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="text-center text-[10px] text-gray-600 font-bold border-t border-white/5 pt-3">
                🇸🇾 يمن الذكاء الاصطناعي 🇾🇪
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
