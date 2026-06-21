import React, { useState, useEffect } from "react";
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
  const [isMobileView, setIsMobileView] = useState<boolean>(true); // Frame simulator state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // Mobile response drawer

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

  // Safe wrapper trigger for custom sidebar clicks
  const triggerTabChange = (tab: "chat" | "tools" | "images" | "profile" | "settings") => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // If user is not logged in, present the premium onboarding screen
  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} settings={settings} />;
  }

  // Active view router panel helper
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

  // Theme support
  const appBg = settings.theme === "dark" ? "bg-[#0b0b0b] text-white" : "bg-[#f5f3ef] text-gray-900";
  const mainPanelBg = settings.theme === "dark" ? "bg-[#121212] border-white/5" : "bg-white border-gray-200/50";
  const textTitleColor = settings.theme === "dark" ? "text-white" : "text-gray-900";
  const textSubColor = settings.theme === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${appBg} transition-colors duration-500 flex flex-col font-sans select-none relative pb-12`}>
      
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(215,25,32,0.06),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(217,161,78,0.04),transparent_50%)] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="px-6 py-4 border-b border-white/5 backdrop-blur bg-black/10 z-20 flex justify-between items-center relative select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#D71920]/15 flex items-center justify-center text-xl font-bold border border-[#D71920]/40 shadow-sm animate-pulse">
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
          
          {/* Theme custom toggle */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-gray-400 hover:text-white cursor-pointer border border-white/5"
            title={isAr ? "تبديل المظهر" : "Toggle theme"}
          >
            {settings.theme === "dark" ? <Sun className="w-4 h-4 text-amber-500 " /> : <Moon className="w-4 h-4 text-purple-400" />}
          </button>

          {/* Desktop/Tablet Simulator view slider */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            <button
              onClick={() => setIsMobileView(true)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-extrabold transition-all cursor-pointer ${
                isMobileView ? "bg-[#D71920] text-white shadow-sm" : "text-gray-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isAr ? "محاكي الهاتف" : "Smartphone"}</span>
            </button>
            <button
              onClick={() => setIsMobileView(false)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-extrabold transition-all cursor-pointer ${
                !isMobileView ? "bg-[#D71920] text-white shadow-sm" : "text-gray-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isAr ? "شاشة كاملة" : "Dashboard"}</span>
            </button>
          </div>

          <span className="hidden sm:inline text-xs text-gray-500 px-1 border-r border-white/10 h-4"></span>

          {/* User profile brief */}
          <div className="flex items-center gap-2">
            <div className="text-left font-mono hidden md:block">
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

      {/* CORE WRAPPER STAGE: SIMULATOR DREAMS */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 select-none z-10">
        
        {isMobileView ? (
          /* GORGEOUS HIGH-FIDELITY MOBILE SIMULATOR FRAME */
          <div className="relative w-[375px] h-[780px] bg-[#000000] rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-3 border-[10px] border-[#202020] ring-1 ring-white/15 flex flex-col overflow-hidden select-none">
            
            {/* Smartphone Notch / Dynamic Bar */}
            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-32 h-[26px] bg-black rounded-[18px] z-50 flex items-center justify-center gap-1 px-3">
              <div className="w-2 h-2 rounded-full bg-blue-500/40 animate-pulse" /> {/* Camera lens */}
              <div className="w-[45px] h-1.5 bg-zinc-800 rounded-full my-auto" /> {/* Speaker */}
            </div>

            {/* Simulated Smartphone Status Bar inside screen */}
            <div className="px-6 pt-3.5 pb-2 bg-[#121212] flex justify-between items-center text-[10px] font-sans text-gray-400 font-bold select-none z-40 relative">
              <span>9:21 AM</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3" />
                <span>4G 🇾🇪</span>
                <span className="text-[8px]">88%</span>
                <Battery className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* Micro tactile inner header */}
            <div className="flex justify-between items-center px-4 py-2.5 bg-[#171717] border-b border-white/5 relative z-40">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5"
              >
                <Menu className="w-4 h-4 text-white" />
              </button>
              <span className="text-xs font-black text-rose-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D9A14E]" />
                {activeTab === "chat" ? (isAr ? "دردشة صاحبك" : "Sahibak Chat") : activeTab === "tools" ? (isAr ? "الأدوات اليمانية" : "Yemeni Tools") : (isAr ? "تجهيز الصور" : "Creative Arts")}
              </span>
              <div className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-xs">🧔</div>
            </div>

            {/* Sim Mobile Sidebar Drawer */}
            <AnimatePresence>
              {sidebarOpen && (
                <div 
                  className="absolute inset-0 bg-black/60 z-50 flex justify-start select-none font-sans"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div 
                    className="w-3/4 h-full bg-[#121212] p-5 border-l border-white/15 flex flex-col justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-sm font-black text-white">{isAr ? "تصفح يمن AI" : "Yemen AI Guide"}</span>
                        <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {/* Navigation selections */}
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
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Inner Simulator view body */}
            <div className="flex-1 flex flex-col overflow-hidden relative rounded-b-[40px] bg-[#121212]">
              {renderActiveSection()}
            </div>

          </div>
        ) : (
          /* IMPOSSIBLY BEAUTIFUL FULL-SCREEN BENTO DASHBOARD VIEW */
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative select-none z-10">
            
            {/* Side Navigation Control menu (Span 3) */}
            <div className={`lg:col-span-3 p-5 rounded-2xl ${mainPanelBg} border flex flex-col justify-between space-y-6 h-[720px]`}>
              <div className="space-y-6">
                
                {/* Section header brand */}
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

              {/* Traditional decorative card snippet (Gingerbread Sanaa motifs) */}
              <div className="p-4 bg-gradient-to-tr from-[#D71920]/10 to-transparent border border-[#D71920]/20 rounded-2xl space-y-2 relative overflow-hidden text-center select-none">
                <span className="relative z-10 text-[10px] text-[#D9A14E] uppercase font-black tracking-wider block">فخر التراث اليمني الاصيل</span>
                <p className="relative z-10 text-[11px] text-gray-300 leading-normal font-sans">
                  {isAr ? "مساعدك الخاص يثق بقوتنا ويبني معك مستقبلاً يمنياً ذكياً." : "Sahibak trusts in our future, building digital solutions."}
                </p>
              </div>
            </div>

            {/* Active Render Area (Span 9) */}
            <div className="lg:col-span-9 flex flex-col h-[720px]">
              {renderActiveSection()}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
