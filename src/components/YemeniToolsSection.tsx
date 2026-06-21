import React, { useState } from "react";
import { AppSettings } from "../types";
import { 
  Languages, FileText, GraduationCap, Briefcase, Copy, Check, 
  Send, Calculator, FileCheck, Coins, RefreshCw, Sparkles, BookOpen, AlertCircle
} from "lucide-react";

interface YemeniToolsSectionProps {
  settings: AppSettings;
}

export default function YemeniToolsSection({ settings }: YemeniToolsSectionProps) {
  const [activeTab, setActiveTab] = useState<"dialect" | "letters" | "students" | "business">("dialect");
  const isAr = settings.language === "ar";

  // General state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // A. Dialect Converter values
  const [converterText, setConverterText] = useState("");
  const [fromDialect, setFromDialect] = useState("sanaani");
  const [toDialect, setToDialect] = useState("adeni");

  // B. Letter Writer values
  const [letterType, setLetterType] = useState("gov");
  const [senderName, setSenderName] = useState("");
  const [recipientTitle, setRecipientTitle] = useState("");
  const [letterDetails, setLetterDetails] = useState("");

  // C. Student Assistant values
  const [studentTask, setStudentTask] = useState("summary");
  const [gradeLevel, setGradeLevel] = useState("مرحلة أساسية (تاسع)");
  const [lessonMaterial, setLessonMaterial] = useState("");

  // D. Business Assistant values
  const [businessType, setBusinessType] = useState("");
  const [businessTask, setBusinessTask] = useState("plan");
  const [budgetLimit, setBudgetLimit] = useState("");
  // Rial Conversion Rates (State variables for simulated conversion)
  const [calcAmount, setCalcAmount] = useState<number | "">("");
  const [calcFrom, setCalcFrom] = useState<"sanaa" | "aden">("sanaa");
  const [calcOutput, setCalcOutput] = useState<string | null>(null);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Submit Dialect conversion
  const handleDialectConvert = async () => {
    if (!converterText.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/gemini/convert-dialect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: converterText,
          from: fromDialect,
          to: toDialect
        })
      });
      const data = await res.json();
      setResult(data.text);
    } catch (e: any) {
      setResult(isAr ? "فشل التحويل الصوتي. طالع إعدادات الاتصال." : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit formal letter template
  const handleLetterWrite = async () => {
    if (!senderName.trim() || !recipientTitle.trim() || !letterDetails.trim()) {
      alert(isAr ? "الرجاء تعبئة بيانات المرسل والمستلم والموضوع!" : "Please fill in all letter fields.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/gemini/write-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterType,
          sender: senderName,
          recipient: recipientTitle,
          details: letterDetails
        })
      });
      const data = await res.json();
      setResult(data.text);
    } catch (e: any) {
      setResult(isAr ? "لم نتمكن من صياغة المعاملة خطأ شبكة." : "Network writing error.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Student helper assistance
  const handleStudentHelp = async () => {
    if (!lessonMaterial.trim()) {
      alert(isAr ? "الرجاء تزويد المساعد بنص الدرس أو المسألة!" : "Please insert lesson or problem first.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/gemini/student-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: studentTask,
          materialText: lessonMaterial,
          gradeLevel: gradeLevel
        })
      });
      const data = await res.json();
      setResult(data.text);
    } catch (e: any) {
      setResult(isAr ? "حدث خطأ تعليمي. المحاولة لاحقاً." : "Study error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit Business planning strategy
  const handleBusinessGuide = async () => {
    if (!businessType.trim()) {
      alert(isAr ? "أدخل نوع مشروعك (مثل: تجارة بن وبهارات، بقالة)!" : "Enter product or business category.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/gemini/business-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: businessType,
          task: businessTask,
          budget: budgetLimit,
          language: "ar"
        })
      });
      const data = await res.json();
      setResult(data.text);
    } catch (e: any) {
      setResult(isAr ? "خطأ في معالجة دراسة الجدوى." : "Business guide error.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Exchange rates (Simulated real-time Yemen currencies)
  // Sana'a old rial is approx 535 YER per USD.
  // Aden new rial is approx 1820 YER per USD.
  // Let's implement active Yemeni exchange market logic!
  const calculateCurrencyGap = () => {
    if (!calcAmount || isNaN(Number(calcAmount))) return;
    const val = Number(calcAmount);
    
    // Formula for conversion old -> new or new -> old
    const sanaaSellValue = 530;
    const adenSellValue = 1800;
    
    if (calcFrom === "sanaa") {
      // Sana'a old notes conversions
      const equivalentAden = val * (adenSellValue / sanaaSellValue);
      const usdValue = val / sanaaSellValue;
      setCalcOutput(isAr 
        ? `${val.toLocaleString()} ريال قديم (صنعاء) يعادل حوالي ${Math.round(equivalentAden).toLocaleString()} ريال جديد (عدن)\nالمكافئ بالدولار: $${usdValue.toFixed(2)} USD`
        : `${val.toLocaleString()} Old YER (Sanaa) equals approx ${Math.round(equivalentAden).toLocaleString()} New YER (Aden)\n($${usdValue.toFixed(2)} USD USD equivalent)`);
    } else {
      // Aden new notes conversions
      const equivalentSanaa = val * (sanaaSellValue / adenSellValue);
      const usdValue = val / adenSellValue;
      setCalcOutput(isAr 
        ? `${val.toLocaleString()} ريال جديد (عدن) يعادل حوالي ${Math.round(equivalentSanaa).toLocaleString()} ريال قديم (صنعاء)\nالمكافئ بالدولار: $${usdValue.toFixed(2)} USD`
        : `${val.toLocaleString()} New YER (Aden) equals approx ${Math.round(equivalentSanaa).toLocaleString()} Old YER (Sanaa)\n($${usdValue.toFixed(2)} USD equivalent)`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#161616] rounded-2xl overflow-hidden border border-white/5 shadow-xl font-sans" dir="rtl">
      
      {/* Banner indicator */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#D71920]/15 to-transparent border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">الأدوات اليمنية 🇾🇪</h2>
          <p className="text-xs text-gray-400 mt-1">
            {isAr ? "مجموعة من الخدمات والمستندات الذكية لتناسب بيئتنا واحتياجاتنا المحلية." : "Yemeni custom-crafted AI assist tools."}
          </p>
        </div>
        <span className="px-3 py-1 bg-[#D71920]/10 border border-[#D71920]/30 text-[#D71920] rounded-xl text-xs font-bold">
          {isAr ? "حصرياً" : "Specialized"}
        </span>
      </div>

      {/* Grid structure: Left control panels / Right instant results display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[580px]">
        
        {/* Left Form column (Span 5) */}
        <div className="lg:col-span-5 border-l border-white/5 bg-[#121212] p-5 flex flex-col space-y-5">
          
          {/* Quick tab switcher headers */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/5 rounded-xl text-xs font-bold ring-1 ring-white/10">
            <button
              onClick={() => { setActiveTab("dialect"); setResult(""); }}
              className={`py-3.5 rounded-lg flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                activeTab === "dialect" ? "bg-[#D71920] text-white shadow-mdScale" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Languages className="w-5 h-5" />
              <span>{isAr ? "اللهجات" : "Dialects"}</span>
            </button>

            <button
              onClick={() => { setActiveTab("letters"); setResult(""); }}
              className={`py-3.5 rounded-lg flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                activeTab === "letters" ? "bg-[#D71920] text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileCheck className="w-5 h-5" />
              <span>{isAr ? "المعاملات" : "Letters"}</span>
            </button>

            <button
              onClick={() => { setActiveTab("students"); setResult(""); }}
              className={`py-3.5 rounded-lg flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                activeTab === "students" ? "bg-[#D71920] text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>{isAr ? "الطالب" : "Student"}</span>
            </button>

            <button
              onClick={() => { setActiveTab("business"); setResult(""); }}
              className={`py-3.5 rounded-lg flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                activeTab === "business" ? "bg-[#D71920] text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>{isAr ? "الأعمال" : "Business"}</span>
            </button>
          </div>

          <div className="flex-grow scrollbar-none overflow-y-auto max-h-[460px] pr-0.5">
            {/* CONTENT A: DIALECT CONVERTER */}
            {activeTab === "dialect" && (
              <div className="space-y-4">
                <span className="text-xs text-[#D9A14E] font-extrabold uppercase tracking-wide">🗣️ محول اللهجات والكلمات اليمنية القديمة</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">من لهجة:</label>
                    <select
                      value={fromDialect}
                      onChange={(e) => setFromDialect(e.target.value)}
                      className="w-full bg-[#1b1b1b] border border-white/10 text-xs text-white rounded-xl px-3 py-3"
                    >
                      <option value="sanaani">الصنعانية</option>
                      <option value="adeni">العدنية</option>
                      <option value="taizzi">التعزية</option>
                      <option value="hadhrami">الحضرمية</option>
                      <option value="standard">الفصحى (العربية الرسمية)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">إلى لهجة:</label>
                    <select
                      value={toDialect}
                      onChange={(e) => setToDialect(e.target.value)}
                      className="w-full bg-[#1b1b1b] border border-white/10 text-xs text-white rounded-xl px-3 py-3"
                    >
                      <option value="adeni">العدنية</option>
                      <option value="sanaani">الصنعانية</option>
                      <option value="taizzi">التعزية</option>
                      <option value="hadhrami">الحضرمية</option>
                      <option value="standard">الفصحى (العربية الرسمية)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1.5">اكتب العبارة للتحويل:</label>
                  <textarea
                    rows={4}
                    value={converterText}
                    onChange={(e) => setConverterText(e.target.value)}
                    placeholder={isAr ? "مثال: أيش تفرجون اليوم، أنا تالي سأجلس هانا أفتش كرت القهوة" : "Type phrase..."}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#D71920] px-4 py-3 rounded-xl text-xs text-white outline-none resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDialectConvert}
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#D71920] hover:bg-[#e3242c] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Languages className="w-4 h-4" />
                  <span>{loading ? "جاري الترجمة بلهجة اليمن..." : "تحويل اللهجة الآن"}</span>
                </button>
              </div>
            )}

            {/* CONTENT B: OFFICIAL LETTER WRITER */}
            {activeTab === "letters" && (
              <div className="space-y-4">
                <span className="text-xs text-[#D9A14E] font-extrabold uppercase tracking-wide">✍️ منسق المعاملات الحكومية والدواوين اليمنية</span>
                
                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1.5">نوع الطلب أو الخطاب:</label>
                  <select
                    value={letterType}
                    onChange={(e) => setLetterType(e.target.value)}
                    className="w-full bg-[#1b1b1b] border border-white/10 text-xs text-white rounded-xl px-3 py-3"
                  >
                    <option value="gov">طلب تيسير معاملة (بلدية، وزارة مصلحة)</option>
                    <option value="employment">معاملة وظيفة بجهة يمنية عامة/خاصة</option>
                    <option value="complaint">شكوى رسمية لعاقل الحارة أو المجلس المحلي</option>
                    <option value="formal">خطاب إداري لشركة اتصالات أو خدمات</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 font-bold mb-1">اسم مقدم المعاملة:</label>
                    <input
                      type="text"
                      placeholder="عبدالله محمد"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl text-xs px-3 py-3 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 font-bold mb-1">الجهة المرسل إليها:</label>
                    <input
                      type="text"
                      placeholder="مدير عام الأحوال المدنية"
                      value={recipientTitle}
                      onChange={(e) => setRecipientTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl text-xs px-3 py-3 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1.5">تفاصيل وسبب الطلب أو الشكوى:</label>
                  <textarea
                    rows={4}
                    value={letterDetails}
                    onChange={(e) => setLetterDetails(e.target.value)}
                    placeholder={isAr ? "مثال: استخراج جواز سفر بدل تالف ولم يتم العثور على الأرشيف القديم لشهادة الميلاد" : "Enter details..."}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#D71920] px-4 py-3 rounded-xl text-xs text-white outline-none resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLetterWrite}
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#D71920] hover:bg-[#e3242c] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>{loading ? "جاري إنشاء الصيغة الركينة..." : "توليد الخطاب الرسمي"}</span>
                </button>
              </div>
            )}

            {/* CONTENT C: STUDENT ASSISTANT */}
            {activeTab === "students" && (
              <div className="space-y-4">
                <span className="text-xs text-[#D9A14E] font-extrabold uppercase tracking-wide">🎓 مساعد الطالب وشرح الكتب الدراسية</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 font-bold mb-1">الخدمة الدراسية:</label>
                    <select
                      value={studentTask}
                      onChange={(e) => setStudentTask(e.target.value)}
                      className="w-full bg-[#1b1b1b] border border-white/10 text-xs text-white rounded-xl px-3 py-3"
                    >
                      <option value="summary">تلخيص الدرس والخرائط الذهنية</option>
                      <option value="quiz">توليد اختبارات قصيرة لمراجعة الحفظ</option>
                      <option value="homework">مساعد حل المسألة بالشرح</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 font-bold mb-1">المستهدف الدراسي:</label>
                    <select
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full bg-[#1b1b1b] border border-white/10 text-xs text-white rounded-xl px-3 py-3"
                    >
                      <option value="أساسي">الصف التاسع (وزاري يمن)</option>
                      <option value="ثانوي">الصف الثالث الثانوي (علمي/أدبي)</option>
                      <option value="جامعي">المستوى الجامعي والتقني</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1.5">نص المادة أو اسم الموضوع:</label>
                  <textarea
                    rows={4}
                    value={lessonMaterial}
                    onChange={(e) => setLessonMaterial(e.target.value)}
                    placeholder={isAr ? "مثال: شرح القواعد النحوية لجمع التكسير والفرق بين جموع القلة والكثرة مع أمثلة من الشعر والقرآن..." : "Enter lesson texts..."}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#D71920] px-4 py-3 rounded-xl text-xs text-white outline-none resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleStudentHelp}
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#D71920] hover:bg-[#e3242c] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{loading ? "جاري تجميع الملخص العلمي..." : "تحليل وتجهيز المادة"}</span>
                </button>
              </div>
            )}

            {/* CONTENT D: BUSINESS ASSISTANT & RIAL CONVERTER */}
            {activeTab === "business" && (
              <div className="space-y-4">
                <span className="text-xs text-[#D9A14E] font-extrabold uppercase tracking-wide">💼 مخطط المشاريع ومحول الريال اليمني</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 font-bold mb-1">نوع النشاط التجاري:</label>
                    <input
                      type="text"
                      placeholder="مثال: مطعم مندي، مغسلة سيارات"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 font-bold mb-1">رأس المال التقريبي:</label>
                    <input
                      type="text"
                      placeholder="مليون ريال يمني أو بالدولار"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1">الطلب الاستشاري:</label>
                  <select
                    value={businessTask}
                    onChange={(e) => setBusinessTask(e.target.value)}
                    className="w-full bg-[#1b1b1b] border border-white/10 text-xs text-white rounded-xl px-3 py-3"
                  >
                    <option value="plan">خطة عمل متكاملة متوافقة ومناسبة لليمن</option>
                    <option value="quote">عمل نموذج عرض سعر تجاري بالريال</option>
                    <option value="marketing">أفكار واستراتيجية تسويق في المجتمع</option>
                  </select>
                </div>

                <div className="p-3 bg-[#D9A14E]/5 border border-[#D9A14E]/20 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#D9A14E] font-bold flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5" />
                      فارق محول الصرف لليمن (صنعاء ↔ عدن)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="المبلغ بالريال"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      className="bg-black/30 border border-white/5 text-xs rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <select
                      value={calcFrom}
                      onChange={(e) => setCalcFrom(e.target.value as "sanaa" | "aden")}
                      className="bg-[#1b1b1b] border border-[#D9A14E]/20 text-xs text-white rounded-lg px-2 py-1"
                    >
                      <option value="sanaa">قديم (سعر صنعاء)</option>
                      <option value="aden">جديد (سعر عدن)</option>
                    </select>
                  </div>
                  
                  <button
                    type="button"
                    onClick={calculateCurrencyGap}
                    className="w-full py-1.5 bg-[#D9A14E]/20 text-[#D9A14E] hover:bg-[#D9A14E]/30 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    حساب فارق العملة سريعاً
                  </button>

                  {calcOutput && (
                    <div className="text-[10px] text-gray-300 font-mono leading-relaxed bg-[#121212] p-2.5 rounded border border-white/5 text-left dir-ltr">
                      {calcOutput}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleBusinessGuide}
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#D71920] hover:bg-[#e3242c] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{loading ? "جاري تشييد الخطة الاستراتيجية..." : "استشارة صاحبك للأعمال ومناقشتها"}</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Output board (Span 7) */}
        <div className="col-span-1 lg:col-span-7 bg-[#141414] p-6 flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? "الخطاب والأداة الناتجة من صاحبك الذكي" : "RESULT SHEET - SAHIBAK AI"}</span>
              {result && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-[#D9A14E] hover:text-white transition-colors cursor-pointer bg-white/5 px-2.5 py-1 rounded"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ الملف" : "Copy")}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="h-48 flex flex-col justify-center items-center gap-3">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-[#D71920]/20 animate-pulse" />
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-[#D9A14E] blur animate-spin scale-75" />
                </div>
                <p className="text-xs text-gray-400 font-bold animate-pulse">{isAr ? "صاحبك جالس يجهز الملف بلهجتنا وثقافتنا دحين..." : "Sahibak AI writing document..."}</p>
              </div>
            ) : result ? (
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-wrap select-text">
                {result}
              </div>
            ) : (
              <div className="h-64 flex flex-col justify-center items-center text-center max-w-sm mx-auto text-gray-500 py-6">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xl mb-3">
                  📄
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{isAr ? "لا يوجد تقرير تولّد بعد" : "No generated sheets yet"}</h4>
                <p className="text-[11px] leading-relaxed text-gray-400">
                  {isAr 
                    ? "اختر الأداة المناسبة لك من القائمة، املأ الشروط والبيانات البسيطة، واضغط على البدء لتنساب الخطة وصياغتها فوراً."
                    : "Configure data items from the left side and request generation to view outcomes here."}
                </p>
              </div>
            )}
          </div>

          {/* Quick note signoff */}
          <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 text-center flex items-center justify-center gap-1.5 mt-4">
            <Sparkles className="w-3 h-3 text-[#D9A14E]" />
            <span>{isAr ? "صاحبك الذكي مبني على أسس قانونية يمنية وتقاليد تجارية حرة." : "Designed to adhere to traditional Yemen business & administrative rules."}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
