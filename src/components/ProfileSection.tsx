import React, { useState } from "react";
import { UserProfile, AppSettings } from "../types";
import { 
  User, Award, Mail, Calendar, Key, Check, ArrowUpRight, ShieldCheck, 
  Settings, LogOut, Flame, Sparkles
} from "lucide-react";

interface ProfileSectionProps {
  user: UserProfile;
  settings: AppSettings;
  onLogout: () => void;
  onUpdateSubscription: (sub: "free" | "pro") => void;
}

export default function ProfileSection({
  user,
  settings,
  onLogout,
  onUpdateSubscription
}: ProfileSectionProps) {
  const [upgraded, setUpgraded] = useState(false);
  const isAr = settings.language === "ar";

  const handleUpgrade = () => {
    onUpdateSubscription("pro");
    setUpgraded(true);
    setTimeout(() => setUpgraded(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#161616] rounded-2xl overflow-hidden border border-white/5 shadow-xl font-sans text-right" dir="rtl">
      
      {/* Banner */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#D9A14E]/10 to-transparent border-b border-white/5">
        <h2 className="text-xl font-black text-white">{isAr ? "الملف الشخصي والحساب 👤" : "User Profile & Account 👤"}</h2>
        <p className="text-xs text-gray-400 mt-1">
          {isAr ? "إدارة اشتراكك، ومعرفة إحصائيات الاستعلامات المتاحة وحالة مزود الأمان سحابياً." : "Manage subscriptions, review quotas and settings."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 p-6 gap-6">
        
        {/* Left Column: Card Profile (Span 5) */}
        <div className="lg:col-span-5 bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#D9A14E]/30"
            />
            <span className="absolute bottom-1 right-1 bg-green-500 w-4.5 h-4.5 rounded-full border-2 border-[#121212]" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white">{user.name}</h3>
            <p className="text-xs text-[#D9A14E] font-mono mt-0.5">{user.email}</p>
          </div>

          {/* Subscription Label */}
          <div className={`px-4 py-1.5 rounded-full border text-xs font-bold ${
            user.subscription === "pro" 
              ? "bg-[#D9A14E]/15 border-[#D9A14E]/45 text-[#D9A14E]" 
              : "bg-white/5 border-white/15 text-gray-400"
          }`}>
            {user.subscription === "pro" ? (isAr ? "👑 العضوية الماسية (Pro)" : "👑 Pro Tier") : (isAr ? "🎁 الباقة المجانية (Free)" : "🎁 Free Plan")}
          </div>

          <div className="w-full border-t border-white/5 pt-4 space-y-3 text-right">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-bold">{isAr ? "طريقة تسجيل الدخول:" : "Auth method:"}</span>
              <span className="text-gray-300 font-mono">{user.isGuest ? (isAr ? "زاير كفيف" : "Guest Mode") : "Google / Email"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-bold">{isAr ? "المحادثات المفتوحة:" : "Active chats:"}</span>
              <span className="text-gray-300 font-mono font-bold">{user.numChats}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-bold">{isAr ? "تاريخ الالتحاق:" : "Joined date:"}</span>
              <span className="text-gray-300 font-mono">{user.joinedDate}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-500/20 mt-4"
          >
            <LogOut className="w-4 h-4" />
            <span>{isAr ? "تسجيل الخروج من الحساب" : "Logout Account"}</span>
          </button>
        </div>

        {/* Right Column: Plans and Subsystem (Span 7) */}
        <div className="lg:col-span-12 xl:col-span-7 bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-white pb-2 border-b border-white/5">
              {isAr ? "ترقية الحساب والاشتراك" : "Quotas & Subscription Tier Information"}
            </h4>

            {/* Simulated Quota usage bar */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#D71920]" />
                  {isAr ? "معدل استهلاك رسائل الاستعلام اليومية:" : "Daily message usage:"}
                </span>
                <span className="font-mono text-gray-400">{user.dailyMessageCount} / 20</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="bg-[#D71920] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((user.dailyMessageCount / 20) * 100, 100)}%` }} 
                />
              </div>
              <p className="text-[10px] text-gray-500 italic font-medium leading-relaxed">
                {isAr 
                  ? "تتجدد الاستعلامات المجانية تلقائياً كل 24 ساعة (الساعة 12 منتصف الليل بتوقيت اليمن الحبيب)."
                  : "Free queries reset daily at 12:00 AM Yemen Standard Time."}
              </p>
            </div>

            {/* Plan Display Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Free Plan */}
              <div className={`p-4 rounded-xl border relative flex flex-col justify-between ${
                user.subscription === "free" ? "border-white/20 bg-white/5" : "border-white/5 bg-transparent opacity-60"
              }`}>
                <div className="space-y-2">
                  <h5 className="text-xs font-black text-gray-400">{isAr ? "الباقة المجانية (الحالية)" : "Free Plan (Current)"}</h5>
                  <div className="text-xl font-bold text-white">0 YER <span className="text-xs text-gray-500">/ {isAr ? "لجميع الفترات" : "Forever"}</span></div>
                  <ul className="text-[10px] text-gray-400 space-y-1 pt-1.5 list-disc list-inside">
                    <li>20 {isAr ? "استفسار ودردشة يومية" : "daily chats"}</li>
                    <li>{isAr ? "الوصول للهجات اليمنية كاملة" : "all Yemen dialects support"}</li>
                    <li>{isAr ? "توليد محدود للصور (3 صور)" : "Limited image generator"}</li>
                  </ul>
                </div>
              </div>

              {/* Pro Plan */}
              <div className={`p-4 rounded-xl border relative flex flex-col justify-between bg-gradient-to-br from-[#D9A14E]/10 to-[#121212] overflow-hidden ${
                user.subscription === "pro" ? "border-[#D9A14E]/70" : "border-white/15"
              }`}>
                <div className="space-y-2">
                  <span className="absolute top-2 left-2 bg-[#D9A14E] text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Pro</span>
                  <h5 className="text-xs font-black text-[#D9A14E]">{isAr ? "العضوية الماسية (Pro)" : "Pro Plan Title"}</h5>
                  <div className="text-xl font-bold text-white">7,500 YER <span className="text-xs text-gray-500">/ {isAr ? "شهرياً" : "monthly"}</span></div>
                  <ul className="text-[10px] text-gray-400 space-y-1 pt-1.5 list-disc list-inside">
                    <li>{isAr ? "استفسارات ودردشات بلا حدود!" : "Unlimited premium chat assistance"}</li>
                    <li>{isAr ? "أولوية فائقة وسرعة متضاعفة" : "Priority model processing speed"}</li>
                    <li>{isAr ? "توليد صور غير محدود بجودة عالية" : "Unlimited high-res AI paintings"}</li>
                  </ul>
                </div>

                {user.subscription === "free" ? (
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    className="w-full py-2 bg-[#D9A14E] hover:bg-amber-600 text-black font-black text-xs rounded-lg transition-all mt-4 cursor-pointer text-center"
                  >
                    {isAr ? "الترقية والاشتراك الفوري" : "Subscribe Now"}
                  </button>
                ) : (
                  <div className="text-[10px] text-green-400 font-bold flex items-center gap-1.5 mt-4 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isAr ? "الأمان والاشتراك نشط ومحمي" : "Subscription Active & Protected"}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1.5 border-t border-white/5 pt-3">
            <Sparkles className="w-3 h-3 text-[#D9A14E]" />
            <span>{isAr ? "يتم تشفير وتأمين فواتير المعاملات والدفع من خلال شراكة مزود بوابات الدفع الوطنية." : "Invoices and transactions are processed in compliance with local regulations."}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
