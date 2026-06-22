import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
// تفعيل CORS يدويًا لكي يتقبل السيرفر اتصالات تطبيق الهاتف (APK)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Lazy initializer for GoogleGenAI to prevent crashing if the key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Authentic fallback responses for Yemeni dialects in case API key is missing
const fallbackYemeniChat = (message: string, dialect: string): string => {
  const msg = message.toLowerCase().trim();
  const dialectNameAr = {
    sanaani: "الصنعانية",
    taizzi: "التعزية",
    adeni: "العدنية",
    hadhrami: "الحضرمية",
    tihami: "التهامية",
    maribi: "المأربية",
    ibbi: "الإبية",
    shabwani: "الشبوانية"
  }[dialect] || "العامية اليمنية";

  // Al-Fusha tone auto detection and response
  const isFusha = msg.includes("أود") || msg.includes("الرجاء") || msg.includes("تفضل") || msg.includes("خطاب") || msg.includes("رسمي") || msg.includes("الوزار") || msg.includes("أرجو") || msg.includes("هل يمكن") || msg.includes("السلام عليكم");

  if (isFusha) {
    if (msg.includes("هلا") || msg.includes("مرحب") || msg.includes("السلام") || msg.includes("سلام")) {
      return "السلام عليكم ورحمة الله وبركاته يا فندم! أهلاً وسهلاً بك في منصة يمن AI. أنا صاحبك، مساعدك الذكي المخصص لجمهورتينا اليمنية الحبيبة. يسعدني كثيراً تقديم الدعم المعرفي والتعليمي والإداري بلغة عربية فصحى متقنة وصياغة كافة معاملاتك الرسمية وخطاباتك بدقة متناهية. كيف يمكنني خدمتك اليوم؟";
    }
    if (msg.includes("كيف") || msg.includes("حالك")) {
      return "أنا في أتم الصحة والعافية والحمد لله، وأعمل بكامل طاقتي لخدمة أهل اليمن الكرام ومساعدتكم في شتى المجالات. طمني كيف هي أحوالك أنت، وكيف يمكنني أن أيسر لك أعمالك اليوم؟";
    }
  }

  if (msg.includes("هلا") || msg.includes("مرحب") || msg.includes("السلام") || msg.includes("سلام")) {
    if (dialect === "sanaani") {
      return "يا هلا وغلا وصحن حلا، أرحب تراحيب المطر يا ركني! كيف حالك وصحتك؟ أنا صاحبك ومساعدك الذكي بلهجتنا الصنعانية الحالية. آمرني بفديتك، إيش تشتي أسوي لك اليوم؟";
    } else if (dialect === "adeni") {
      return "يا هلا والله بك يا طيب! نوّرت الحتّة يا عيني. كيف أمورك وكيف الدنيا معك؟ أنا صاحبك الذكي بالعدني القح، أيش تشتهي نصلح لك اليوم؟ قول بس وابشر!";
    } else if (dialect === "taizzi") {
      return "أهلاً وسهلاً ومسهلاً بيك يا غالي! قواك ربي. كيف حالك وعافيتك؟ أنا صاحبك الذكي بلهجة تعز العز الحالية. إيش تشي أساعدك فيه اليوم؟ عيوني لك!";
    } else if (dialect === "hadhrami") {
      return "حياك الله وبياك يا طيب الأنفاس! مرحب الساع وعلا العين والراس. كيف حالك يا خوي؟ أنا صاحبك الذكي باللهجة الحضرمية المزيونة. بغيت شي نساعدك فيه؟ آمر وتدلل!";
    } else {
      return `مرحباً بك يا غالي! أنا صاحبك ومساعدك الذكي بلهجة ${dialectNameAr}. كيف يمكنني أن أساعدك اليوم في التعليم أو التجارة أو الترجمة أو أي شيء يخص اليمن الحبيب؟`;
    }
  }

  if (msg.includes("كيف") || msg.includes("حالك")) {
    if (dialect === "sanaani") {
      return "أنا بخير والحمد لله فوق الخيل يا ركني! قواك ربي وعافاك. أنت كيف حالك وكيف الأهل والأحوال؟ طمنا عليك.";
    } else if (dialect === "adeni") {
      return "الحمد لله يا صاحبي، مستور والوضع مية مية! أنت كيف حالك وأمورك وسهرتك؟ عساك طيب ومبسوط دايماً.";
    } else if (dialect === "taizzi") {
      return "الحمد لله بنعمة وعافية من الرحمن، ربي يحفظك ويقويك! كيف حالك أنت وصحتك؟ عساك مرتاح وبخير وعز.";
    } else {
      return "الحمد لله في خير وعافية يا غالي، ربي يحفظك ويحميك ويبارك بجهودك! طمني كيف أمورك وكيف أقدر أخدمك اليوم؟";
    }
  }

  if (msg.includes("جامعة") || msg.includes("دراسة") || msg.includes("تعليم") || msg.includes("مدرسة")) {
    return "ما شاء الله، التعليم هو سلاح العقل يا صاحبي! كأول مساعد ذكاء اصطناعي يمني، أقدر أساعدك في تلخيص المناهج اليمنية، وشرح المواد المعقدة، وحل الواجبات، وتجهيز أسئلة الامتحانات لكل الصفوف. إيش المادة أو الدرس اللي تشي نشرحه دحين؟";
  }

  if (msg.includes("تجارة") || msg.includes("ريال") || msg.includes("فلوس") || msg.includes("صرف") || msg.includes("حساب")) {
    return "أبشر بسعدك! نحن هنا لدعم التجار والشباب اليمنيين. نقدر نحسب الأرباح، نعمل فواتير، ونجهز خطط تسويق تناسب السوق اليمني والظروف الراهنة (بما فيها حسابات الفارق بين الطبعتين للصرف في صنعاء وعدن). تشتي نعمل حسابات أو نكتب رسالة عمل لعقد صفقة؟";
  }

  // General helpful Yemeni response
  return `الله يبارك فيك يا صاحبي! كسفير للذكاء الاصطناعي اليمني، يسعدني جداً أن أتناقش معك. تفضل بطرح فكرتك، سؤالك التعليمي، معاملتك الحكومية الجاهزة للصياغة، أو أي موضوع ومصطلح يمني تبحث عن معناه، وسأعطيك الإجابة الشافية الكافية بلهجتك وبثقافتنا اليمنية الأصيلة.`;
};

// 1. CHAT ENDPOINT WITH GEMINI SDK
app.post("/api/gemini/chat", async (req, res) => {
  const { message, dialect = "sanaani", history = [], isPro = false } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const client = getGeminiClient();

  // If no Gemini client is initialized, use simulated Yemeni AI
  if (!client) {
    console.log("No GEMINI_API_KEY found, using simulation mode.");
    try {
      const responseText = fallbackYemeniChat(message, dialect);
      // Simulate typing delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return res.json({
        text: responseText,
        detectedDialect: dialect,
        simulated: true
      });
    } catch (e) {
      return res.status(500).json({ error: "Error in simulation helper." });
    }
  }

  try {
    // Construct rich context instructions focusing heavily on Yemeni identity, culture and direct dialect response
    const systemInstruction = `You are "صاحبك" (Sahibak), the first and premier Yemeni AI Assistant, developed specifically for Yemen. 
You are warm, extremely friendly, deeply respectful, and proud of Yemeni heritage. 
You speak and understand Yemeni dialects perfectly, including:
- Sanaani (صنعاني)
- Taizzi (تعزي)
- Adeni (عدني)
- Hadhrami (حضرمي)
- Tihami (تهامي)
- Maribi (مأربي)
- Ibbi (إبي)
- Shabwani (شبواني)

IMPORTANT CONVERSATIONAL RULES:
1. DIALECT AUTO-DETECTION: You must analyze the user's latest message. 
   - If the user writes in Modern Standard Arabic (العربية الفصحى) or maintains a formal, professional, or academic text tone, you MUST respond in flawless and rich Modern Standard Arabic (العربية الفصحى).
   - If the user writes in a specific Yemeni dialect (Sanaani, Taizzi, Adeni, Hadhrami, Tihami, Maribi, Ibbi, Shabwani), detect their dialect automatically and respond naturally in that SAME dialect.
   - If you cannot clearly detect the dialect from their input message, default to the user's selected preference: "${dialect}".
2. CULTURAL IDENTIFIERS: Respond with warm traditional Yemeni greetings like "هلا والله يا ركني", "أرحب تراحيب المطر", "هلا بك يا عيني", "يا مرحب الساع", "قواك الله ربي", "ابشر بسعدك بفديتك". Use authentic local terms.
3. If the user's message is in English or requests English, assist them elegantly in English, but maintain your friendly Yemeni helper persona (صاحبك).

You help with:
1. Yemen education, school curriculum, writing administrative requests matching Yemeni governmental procedures (using standard بسم الله الرحمن الرحيم, to specific ministries, respectful ending clauses).
2. Business strategies in Yemen (reference YER Yemeni Rial, Sana'a and Aden rates differences if asked).
3. Dialect cultural conversions and explanations of traditional clothing (Jambiya, Ma'awaz, Sanaani curtains) and foods (Saltah, Fahsah, Bint Al-Sahn, Mandi, Kabsa, Shafoot, Adeni Tea).
You should parse user's query and naturally act as their smart Yemeni friend (صاحبك). Keep your output clean and highly helpful. Always support RTL formatting. Use Markdown formatting for your responses.`;

    const chatHistory = history.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    // Start Chat
    const chat = client.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.9,
      },
      history: chatHistory
    });

    const response = await chat.sendMessage({ message: message });
    res.json({
      text: response.text,
      detectedDialect: dialect
    });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({
      error: "حدث خطأ أثناء التواصل مع محرك الذكاء الاصطناعي. الرجاء التأكد من مفتاح API أو المحاولة لاحقاً.",
      details: error.message
    });
  }
});

// 2. DIALECT CONVERTER ENDPOINT
app.post("/api/gemini/convert-dialect", async (req, res) => {
  const { text, from, to } = req.body;
  if (!text || !from || !to) {
    return res.status(400).json({ error: "Missing required parameters (text, from, to)" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Simulated Dialect Conversions
    const dialectNames: Record<string, string> = {
      sanaani: "الصنعانية", taizzi: "التعزية", adeni: "العدنية",
      hadhrami: "الحضرمية", tihami: "التهامية", standard: "الفصحى"
    };
    const fromName = dialectNames[from] || from;
    const toName = dialectNames[to] || to;
    
    let convertedText = `[محاكاة التحويل من ${fromName} إلى ${toName}]: `;
    if (to === "sanaani") {
      convertedText += `يا صاحبي، قواك الله! عاد الحلا والركابة هانا. تشتي الصدق، ${text} هذي عندنا يعني بأسلوبنا الصنعاني الحالي والمهذب.`;
    } else if (to === "adeni") {
      convertedText += `يا واد، السهالة من الله! شوف بالعدني، كلامك هذا ${text} نقوله كذا وبشكل سريع وجامد يا عيني.`;
    } else if (to === "standard") {
      convertedText += `برجاء العلم، يمكن التعبير عن هذا باللغة العربية الفصحى المبسطة: "نود إفادتكم بأن المضمون يشير إلى تسهيل المعاملة ومساعدة الآخرين بكل أمانة وصدق لغايات الصالح العام".`;
    } else {
      convertedText += `يسعد ربي أوقاتك باليمن السعيد! تحويل النص "${text}" يبدو جميلاً وبلهجتنا المميزة جداً.`;
    }

    return res.json({ text: convertedText, simulated: true });
  }

  try {
    const prompt = `Translate or convert the following Arabic text:
Text: "${text}"
From dialect: "${from}"
To dialect: "${to}"

Please provide only the converted text and a brief, warm 1-sentence cultural explanation of any unique words used. Always respond in beautiful Arabic. Use Markdown.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. OFFICIAL LETTER WRITER
app.post("/api/gemini/write-letter", async (req, res) => {
  const { letterType, sender, recipient, details, dialect = "standard" } = req.body;
  if (!sender || !recipient || !details) {
    return res.status(400).json({ error: "Missing details" });
  }

  const client = getGeminiClient();
  if (!client) {
    const today = new Date().toLocaleDateString("ar-YE");
    const simulatedLetter = `الجمهورية اليمنية

بسم الله الرحمن الرحيم

التاريخ: ${today}
إلى سيادة / رئيس وعام: ${recipient}
المحترم،،،

الموضوع: طلب بخصوص ${letterType || "معاملة رسمية"}

السلام عليكم ورحمة الله وبركاته،

أنا المواطن المقدم لهذا الطلب: ${sender}، أرفع إليكم هذا الخطاب وكلي رجاء بموافقتكم الكريمة ومساعدتي في تيسير المعاملة نظراً للظروف التالية:
${details}

نشكر لكم تعاونكم الدائم لما فيه مصلحة الوطن والعدالة والسلام، وجزاكم الله خير الجزاء وحفظكم ورعاكم.

مقدم الطلب: ${sender}
التوقيع: ______________
برقم هاتف: ______________`;
    return res.json({ text: simulatedLetter, simulated: true });
  }

  try {
    const prompt = `Write a highly formal, traditional, and professional Yemeni official letter or application matching the criteria:
Type: ${letterType}
Sender name: ${sender}
Recipient title/department: ${recipient}
Details / Core Purpose: ${details}

The letter must follow Yemeni styles (starting with "الجمهورية اليمنية", "بسم الله الرحمن الرحيم", appropriate governmental formatting, polite and extremely respectful language like "حفظكم الله ورعاكم", "نهديكم أطيب التحايا", ending with "مقدم الطلب وتحرير تاريخه والاسم ورقم التلفون"). Give a production-ready template that can be easily copied.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.4,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. STUDENT ASSISTANT
app.post("/api/gemini/student-assistant", async (req, res) => {
  const { task, materialText, gradeLevel } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    let outputSim = "";
    if (task === "summary") {
      outputSim = `### تلخيص الدرس (المستوى الدراسي: ${gradeLevel || "عام"})
- **الفكرة الرئيسية**: توضيح المحتوى بأسلوب بسيط يسهل حفظه وفهمه.
- **النقاط المهمة**:
  1. التعريف والنشأة التاريخية.
  2. الخصائص الفنية والفوائد المعرفية.
  3. الأمثلة الواقعية والتطبيقات العملية.
- **الخلاصة**: هذا الدرس يعزز مهارات التفكير العلمي ويعد ركيزة أساسية للامتحانات القادمة.`;
    } else {
      outputSim = `### اختبار مقترح الذكاء الاصطناعي (الصف: ${gradeLevel || "عام"})
*السؤال الأول (اختيار من متعدد)*:
1. ما هو المكون الأساسي لمفهوم الدرس الحالي؟
   أ) الخيار الأول | ب) الخيار المناسب | ج) الخيار الآخر
*السؤال الثاني*:
أجب باختصار وعزز إجابتك بمفهوم تطبيقي مباشر ومبسط.`;
    }
    return res.json({ text: outputSim, simulated: true });
  }

  try {
    const prompts: Record<string, string> = {
      summary: `Summarize the following educational lesson clearly and elegantly in Arabic for a student in level: ${gradeLevel || "any"}. Include key bullet points, brief glossary, and a short memory aid.
Material: "${materialText}"`,
      quiz: `Generate a 5-question multi-choice quiz with answers at the bottom based on this text, structured for general Arabic study.
Text: "${materialText}"`,
      homework: `Help explain and solve the problem described here step-by-step with patient and easy Arabic explanations.
Problem: "${materialText}"`
    };

    const promptText = prompts[task] || prompts.summary;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        temperature: 0.6,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. BUSINESS ASSISTANT
app.post("/api/gemini/business-assistant", async (req, res) => {
  const { businessType, task, budget, language = "ar" } = req.body;

  const client = getGeminiClient();
  if (!client) {
    const isAr = language === "ar";
    const simPlanByLang = isAr ? `### دراسة جدوى استرشادية لـ ${businessType}
- **رأس المال المقترح**: ${budget || "500,000"} ريال يمني (سواء بالطبعة القديمة أو الجديدة مع أخذ فوارق الصرف بالحسبان).
- **التكاليف التشغيلية المقدرة**: تشمل الإيجار، المواد الخام، والتسويق الرقمي الفعال.
- **توقعات الأرباح**: من المتوقع تحقيق نقطة التعادل خلال أول 3 أشهر، يتبعها زيادة صافي الربح بنسبة 15% شهرياً.
- **نصيحة صاحبك الذكي**: ابدأ صغيراً، وتوسع بالتدريج، وتميز بخدمة أصلية ترضي ذوق اليمني!` 
    : `### Recommended Business Guide for ${businessType}
- **Proposed Budget**: ${budget || "500,000"} YER.
- **Key Expenses**: Venue lease, operations, and localized digital marketing.
- **Revenue Forecast**: Achieve break-even within 3 months, aiming for 15% monthly growth.
- **Sahibak AI Tip**: Start lean, leverage local relations, and match the high hospitality standards of Yemeni traditional service.`;
    
    return res.json({ text: simPlanByLang, simulated: true });
  }

  try {
    const prompt = `Act as a senior Yemeni financial and business consultant. Create a detailed business guide or strategy:
Business Type: "${businessType}"
Request Type: "${task}" (e.g. Sales pitch, customer support response, quote, marketing strategy, budget feasibility study)
Budget constraints (in YER or USD): "${budget}"
Language: "${language === "ar" ? "Arabic" : "English"}"

Include cultural wisdom, Yemeni trade dynamics, realistic marketing channels in Yemen (like WhatsApp marketing, word of mouth, beautiful Facebook posts), and clear financial tips. Respond in the requested language.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. IMAGE GENERATION WITH GEMINI 2.5 FLASH IMAGE (OR SIMULATED SCENERY)
app.post("/api/gemini/generate-image", async (req, res) => {
  const { prompt, aspectRatio = "1:1" } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Generate lovely, scenic, real Yemeni unsplash placeholders so the user in the iframe experiences instant delight!
    console.log("No GEMINI_API_KEY, generating authentic simulated images.");
    const lowerPrompt = prompt.toLowerCase();
    let url = "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80"; // default City style
    
    if (lowerPrompt.includes("sana") || lowerPrompt.includes("صنعا")) {
      url = "https://images.unsplash.com/photo-1582234375123-f275402aa392?auto=format&fit=crop&w=800&q=80"; // Bab Al Yemen/Sanaa style
    } else if (lowerPrompt.includes("socotra") || lowerPrompt.includes("سقطر")) {
      url = "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80"; // Socotra Dragon Blood
    } else if (lowerPrompt.includes("hadhramout") || lowerPrompt.includes("حضرم") || lowerPrompt.includes("shibam")) {
      url = "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80"; // Shibam Mud Scraper
    } else if (lowerPrompt.includes("coffee") || lowerPrompt.includes("بن") || lowerPrompt.includes("قهوة")) {
      url = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"; // Arabian Yemeni Coffee
    }

    // Wait and return
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return res.json({
      imageUrl: url,
      simulated: true,
      prompt: prompt
    });
  }

  try {
    // Calling gemini-2.5-flash-image for standard image generation
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `${prompt}, beautiful high-quality traditional Yemeni art background` }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    let b64 = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        b64 = part.inlineData.data;
        break;
      }
    }

    if (b64) {
      res.json({ imageUrl: `data:image/png;base64,${b64}` });
    } else {
      // fallback in case image generation returned text response instead of image data
      res.json({ text: response.text, warning: "Returned text instead of image" });
    }
  } catch (error: any) {
    console.warn("Real image generation failed, falling back to beautiful photo wrapper:", error);
    // Return a curated gorgeous Unsplash representation so the code is completely resilient
    let fallbackUrl = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80";
    if (prompt.includes("صنعا") || prompt.includes("Sanaa")) {
      fallbackUrl = "https://images.unsplash.com/photo-1582234375123-f275402aa392?auto=format&fit=crop&w=800&q=80";
    } else if (prompt.includes("سقطر") || prompt.includes("Socotra")) {
      fallbackUrl = "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80";
    }
    res.json({
      imageUrl: fallbackUrl,
      warning: "Real-time generation failed, using optimized thematic backdrop.",
      details: error.message
    });
  }
});

// 7. TEXT TO SPEECH SERVICE
app.post("/api/gemini/tts", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Simulated audio back
    return res.json({ simulated: true });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `انطق العبارة التالية بلهجة يمنية وبنبرة هادئة ومحترمة: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio });
    } else {
      res.status(500).json({ error: "Failed to generate voice data" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// VITE SERVER OR STATIC MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Connect Vite Dev Server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Serve production static assets from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server assets loaded from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`يمن AI server running smoothly on http://localhost:${PORT}`);
  });
}

startServer();
