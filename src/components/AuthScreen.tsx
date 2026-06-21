import React, { useState } from "react";
import { UserProfile, AppSettings } from "../types";
import { Sparkles, Mail, ShieldAlert, LogIn, ChevronRight, User } from "lucide-react";
import { motion } from "motion/react";

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  settings: AppSettings;
}

export default function AuthScreen({ onLoginSuccess, settings }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(0); // 0 = welcome carousel, 1 = credentials screen
  const isAr = settings.language === "ar";

  const handleGuestMode = () => {
    onLoginSuccess({
      name: isAr ? "زائر كريم" : "Honored Guest",
      email: "guest@yemenai.ly",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      numChats: 0,
      subscription: "free",
      dailyMessageCount: 0,
      joinedDate: new Date().toLocaleDateString(isAr ? "ar-YE" : "en-US"),
      isGuest: true,
    });
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLoginSuccess({
      name: name || (isAr ? "مستخدم جديد" : "Yemeni User"),
      email: email,
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      numChats: 1,
      subscription: "free",
      dailyMessageCount: 0,
      joinedDate: new Date().toLocaleDateString(isAr ? "ar-YE" : "en-US"),
      isGuest: false,
    });
  };

  const handleGoogleSignIn = () => {
    onLoginSuccess({
      name: isAr ? "حسام العنسي" : "Hosam Al-Ansi",
      email: "hosamamar522@gmail.com",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      numChats: 4,
      subscription: "pro", // Default to Pro for Google simulated flow to let them test everything!
      dailyMessageCount: 5,
      joinedDate: new Date().toLocaleDateString(isAr ? "ar-YE" : "en-US"),
      isGuest: false,
    });
  };

  const onboardingSlides = [
    {
      titleAr: "يمن AI: مستشارك الذكي",
      titleEn: "Yemen AI: Your Smart Advisor",
      descAr: "أول ذكاء اصطناعي يفهم خصوصيتنا، لهجاتنا المتعددة، وتراثنا اليمني الأصيل.",
      descEn: "The first AI that understands our privacy, custom dialects, and authentic Azerbaijani & Yemeni culture.",
      accent: "من صنعاء القديمة إلى شواطئ عدن"
    },
    {
      titleAr: "يفهم كل لهجات اليمن",
      titleEn: "Speaks All Yemeni Dialects",
      descAr: "تحدث بطبيعتك وبراحتك! صاحبك يفهم (الصنعاني، التعزي، العدني، الحضرمي، التهامي.. وكل لهجة).",
      descEn: "Speak naturally! Your companion understands Sanaani, Taizzi, Adeni, Hadhrami, Tihami, and more.",
      accent: "مرحباً بك يا صاحبي"
    },
    {
      titleAr: "أدوات مخصصة لحياتك اليومية",
      titleEn: "Tailored Tools for Your Life",
      descAr: "صياغة المعاملات والخطابات الرسمية لليمن، مساعد الطالب للمناهج، ومستشار الحسابات بالريال اليمني.",
      descEn: "Draft government letters, student study aids for curriculums, and Rial business solutions.",
      accent: "سهل، بسيط وسريع"
    }
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#121212] py-8 px-4 font-sans text-white">
      {/* Dynamic Traditional Sanaani Window Architectural Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,25,32,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(217,161,78,0.1),transparent_40%)]" />
      
      {/* Decorative Sana'a Window Gingerbread patterns (simulated via glowing curves) */}
      <div className="absolute -top-10 -left-10 w-96 h-96 border-4 border-dashed border-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 border-4 border-dashed border-white/5 rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col min-h-[580px]">
        
        {/* Red, White, Black indicator strip matching Yemeni Flag */}
        <div className="flex h-1.5 w-full">
          <div className="bg-[#D71920] w-1/3" />
          <div className="bg-white w-1/3" />
          <div className="bg-black w-1/3" />
        </div>

        {/* Top Header Card Info */}
        <div className="p-8 text-center border-b border-white/5 bg-[#171717]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D71920]/10 border border-[#D71920]/30 text-[#D71920] text-3xl font-bold mb-4">
            🇾🇪
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            {isAr ? "يمن AI" : "Yemen AI"}
          </h1>
          <p className="text-xs text-[#D9A14E] tracking-widest font-mono">
            {isAr ? "صاحبك الذكي - أول مساعد يمني" : "Sahibak - Your Smart Companion"}
          </p>
        </div>

        {/* Dynamic Content switching based on step state */}
        <div className="p-8 flex-1 flex flex-col justify-between">
          {step === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div className="my-auto space-y-6 text-center">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/5 text-[#D9A14E] border border-white/10">
                  {onboardingSlides[0].accent}
                </span>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-white">
                    {isAr ? onboardingSlides[0].titleAr : onboardingSlides[0].titleEn}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
                    {isAr ? onboardingSlides[0].descAr : onboardingSlides[0].descEn}
                  </p>
                </div>

                <div className="flex justify-center gap-1.5 pt-2">
                  <div className="w-6 h-1.5 bg-[#D71920] rounded-full" />
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="space-y-3 pt-6 w-full mt-auto">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#D71920] to-[#b3141a] hover:from-[#e3242c] hover:to-[#c4161d] text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>{isAr ? "البدء والاتصال بمزود الخدمة" : "Get Started"}</span>
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={handleGuestMode}
                  className="w-full py-3 px-4 bg-transparent hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>{isAr ? "دخول سريع كزائر (بدون تسجيل)" : "Quick Guest Access"}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold text-white">
                  {isAr ? (isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول") : (isSignUp ? "Create Account" : "Sign In")}
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
                >
                  {isAr ? "رجوع" : "Back"}
                </button>
              </div>

              {/* Login/Signup credentials form */}
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      {isAr ? "الاسم الكريم" : "Your Name"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isAr ? "مثال: عبدالله اليماني" : "e.g. Abdullah"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 focus:border-[#D71920] px-4 py-3 rounded-xl text-white outline-none transition-colors align-middle"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    {isAr ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@yemeni.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-[#D71920] px-4 py-3 rounded-xl text-white outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    {isAr ? "كلمة المرور" : "Password"}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-[#D71920] px-4 py-3 rounded-xl text-white outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D71920] hover:bg-[#e3242c] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{isAr ? (isSignUp ? "إنشاء حساب" : "تسجيل دخول") : (isSignUp ? "Sign Up" : "Sign In")}</span>
                </button>
              </form>

              {/* Provider Separator */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-500 uppercase">
                  {isAr ? "أو سجل عبر" : "or connect with"}
                </span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* Google Sign-In button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {/* Custom Google logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.19-5.136 4.19A5.69 5.69 0 0 1 8.24 12.9a5.69 5.69 0 0 1 5.751-5.69c2.14 0 3.978 1.25 4.8 3.07l3.414-2.651A11.39 11.39 0 0 0 13.99 3c-6.19 0-11.24 5.05-11.24 11.24s5.05 11.24 11.24 11.24c6.19 0 11.24-5.05 11.24-11.24 0-.82-.082-1.616-.242-2.39H12.24Z"
                  />
                </svg>
                <span>{isAr ? "تسجيل دخول آمن بجوجل" : "Google Secure Sign-in"}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-[#D9A14E] hover:underline cursor-pointer"
                >
                  {isAr
                    ? (isSignUp ? "لديك حساب بالفعل؟ سجل دخولك" : "لا تملك حساب؟ أنشئ حساباً جديداً بنقرة")
                    : (isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up now")}
                </button>
              </div>

              {/* Footer regulatory alert */}
              <div className="text-center text-[10px] text-gray-500 pt-6 mt-auto">
                {isAr
                  ? "يمن AI يحمي خصوصية مستخدميه بالكامل ويقوم بتشفير جميع مراسلات المساعد ومزود الأمان."
                  : "Yemen AI secures and encrypts all communications with the server-side assistant module."}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
