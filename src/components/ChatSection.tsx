import React, { useState, useRef, useEffect } from "react";
import { Chat, Message, UserProfile, AppSettings } from "../types";
// @ts-ignore
import avatarImg from "../assets/images/yemeni_avatar_1782059854676.jpg";
import { 
  Send, Mic, Volume2, Copy, Share2, RefreshCw, Square, Plus, Trash2, 
  Search, Edit3, Sparkles, MessageCircle, AlertCircle, Play, Check, CheckCheck,
  X, Headphones
} from "lucide-react";
import { MarkdownSimple } from "./MarkdownSimple";
import { motion, AnimatePresence } from "framer-motion";

interface ChatSectionProps {
  user: UserProfile;
  settings: AppSettings;
  chats: Chat[];
  onChatsChange: (chats: Chat[]) => void;
  onIncrementMessages: () => void;
}

export default function ChatSection({
  user,
  settings,
  chats,
  onChatsChange,
  onIncrementMessages
}: ChatSectionProps) {
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialect, setDialect] = useState("sanaani");
  const [isGenerating, setIsGenerating] = useState(false);
  const [speechRecognizing, setSpeechRecognizing] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [streamingStates, setStreamingStates] = useState<Record<string, { currentText: string; isComplete: boolean }>>({});
  
  // Immersive continuous ChatGPT-like Voice Mode states
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");

  const voiceRecognitionRef = useRef<any>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isAr = settings.language === "ar";

  // Sana'a dynamic loading facts to make generation wait periods warm and authentic!
  const yemeniFacts = [
    "صنعاء القديمة مأهولة من أكثر من 2500 عام وتعتبر جوهرة العمارة الطينية.",
    "موانئ عدن كانت تصنف تاريخياً كثاني أهم موانئ العالم بعد نيويورك.",
    "القهوة اليمنية (الموكا) تمت تسميتها نسبة إلى ميناء المخاء اليمني الشهير.",
    "جزيرة سقطرة تحتوي على أكثر من 700 نوع من النباتات التي لا توجد في أي مكان آخر على كوكب الأرض.",
    "عرش بلقيس في مأرب شيده السبئيون منذ آلاف السنين كأحد أعظم معالم حضارة سبأ."
  ];
  const [currentFactIdx, setCurrentFactIdx] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentFactIdx((prev) => (prev + 1) % yemeniFacts.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Set default active chat
  useEffect(() => {
    if (chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [chats, activeChatId, isGenerating]);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "ar-YE"; // Yemeni Arabic preset
      rec.interimResults = false;

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInputText((prev) => (prev ? prev + " " + transcript : transcript));
        setSpeechRecognizing(false);
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setSpeechRecognizing(false);
      };

      rec.onend = () => {
        setSpeechRecognizing(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Message Limit Check
  const isUsageLimitReached = () => {
    if (user.subscription === "free" && user.dailyMessageCount >= 20) {
      return true;
    }
    return false;
  };

  // Toggle Speech to Text
  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert(isAr ? "عذراً، محرك المايك المتطور لا يدعم متصفحك دحين." : "Mic speech recognition not supported by browser.");
      return;
    }

    if (speechRecognizing) {
      recognitionRef.current.stop();
      setSpeechRecognizing(false);
    } else {
      setSpeechRecognizing(true);
      recognitionRef.current.start();
    }
  };

  // Create a New Conversation thread
  const handleCreateNewChat = () => {
    const defaultTitle = isAr ? `محادثة جديدة ${chats.length + 1}` : `New Conversation ${chats.length + 1}`;
    const newChat: Chat = {
      id: Math.random().toString(36).substring(7),
      title: defaultTitle,
      dialect: dialect,
      messages: [],
      createdAt: new Date(),
    };
    onChatsChange([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  // Send message to Express API
  const handleSendMessage = async (textToSend: string, isRegeneration = false) => {
    if (!textToSend.trim() || isGenerating) return;

    if (isUsageLimitReached()) {
      alert(isAr 
        ? "يا غالي لقد استنفدت الـ 20 رسالة المجانية لليوم. يرجى الترقية إلى الباقة الماسية (Pro) للتمتع بمراسلات غير محدودة وسرعة أعلى!" 
        : "Free tier daily limit of 20 messages reached! Upgrade to Pro for unlimited chat access.");
      return;
    }

    let targetChatId = activeChatId;
    
    // Auto create chat if none exists
    if (!targetChatId) {
      const defaultTitle = isAr ? `محادثة جديدة` : `New Chat`;
      const freshChat: Chat = {
        id: Math.random().toString(36).substring(7),
        title: defaultTitle,
        dialect: dialect,
        messages: [],
        createdAt: new Date(),
      };
      onChatsChange([freshChat]);
      setActiveChatId(freshChat.id);
      targetChatId = freshChat.id;
    }

    const newUserMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    // Update state with user's message
    let updatedChats = chats.map((c) => {
      if (c.id === targetChatId) {
        // Auto rename chat title based on first query
        const newTitle = c.messages.length === 0 ? textToSend.substring(0, 24) + "..." : c.title;
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, newUserMessage],
        };
      }
      return c;
    });

    onChatsChange(updatedChats);
    setInputText("");
    setIsGenerating(true);
    onIncrementMessages();

    // Prepare history payload for API (last 6 messages to stay fast and cheap)
    const currentConversation = updatedChats.find((c) => c.id === targetChatId);
    const historyPayload = currentConversation?.messages?.slice(-6).map((m) => ({
      role: m.role,
      text: m.text
    })) || [];

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          dialect: dialect,
          history: historyPayload,
          isPro: user.subscription === "pro"
        }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        throw new Error(isAr ? "فشل الاتصال بخادم يمن AI" : "Failed to connect to Yemen AI server");
      }

      const data = await res.json();

      const modelMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        text: data.text,
        timestamp: new Date()
      };

      updatedChats = updatedChats.map((c) => {
        if (c.id === targetChatId) {
          return {
            ...c,
            messages: [...c.messages, modelMessage],
          };
        }
        return c;
      });

      onChatsChange(updatedChats);

      // Initialize streaming state
      setStreamingStates(prev => ({
        ...prev,
        [modelMessage.id]: { currentText: "", isComplete: false }
      }));

      // Stream the words smoothly onto the UI to look exactly like ChatGPT
      const words = data.text.split(" ");
      let wordIdx = 0;
      let currentAccumulator = "";
      
      const streamTimer = setInterval(() => {
        if (wordIdx < words.length) {
          currentAccumulator += (wordIdx === 0 ? "" : " ") + words[wordIdx];
          setStreamingStates(prev => ({
            ...prev,
            [modelMessage.id]: { currentText: currentAccumulator, isComplete: false }
          }));
          wordIdx++;
          // scroll to bottom while streaming
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
          clearInterval(streamTimer);
          setStreamingStates(prev => ({
            ...prev,
            [modelMessage.id]: { currentText: data.text, isComplete: true }
          }));
        }
      }, 40);

      // Automatically speak the response aloud
      handleSpeakText(data.text, modelMessage.id);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Generation stopped by the user.");
      } else {
        const errorMsg: Message = {
          id: Math.random().toString(36).substring(7),
          role: "model",
          text: isAr 
            ? "وقع مشكلة أثناء استدعاء صاحبك الذكي. يرجى مراجعة ضبط مفتاح API في الإعدادات أو الاتصال بالدعم."
            : "An error occurred while summoning Sahibak AI. Please verify the API settings.",
          timestamp: new Date()
        };
        updatedChats = updatedChats.map((c) => {
          if (c.id === targetChatId) {
            return { ...c, messages: [...c.messages, errorMsg] };
          }
          return c;
        });
        onChatsChange(updatedChats);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Stop current stream/generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  // ==========================================
  // CHATGPT/GEMINI LIVE STYLE VOICE ASSISTANT
  // ==========================================

  // Initiate continuous multi-turn Voice Mode
  const startVoiceMode = () => {
    // Stop ordinary TTS playbacks
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
    }

    setIsVoiceModeActive(true);
    setVoiceTranscript("");
    setVoiceResponse("");
    setVoiceState("listening");

    // Start listening
    setTimeout(() => {
      initiateVoiceListening(true);
    }, 100);
  };

  // Mute / Halt continuous Voice Mode
  const stopVoiceMode = () => {
    setIsVoiceModeActive(false);
    setVoiceState("idle");
    setVoiceTranscript("");
    setVoiceResponse("");

    try {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.onend = null;
        voiceRecognitionRef.current.onerror = null;
        voiceRecognitionRef.current.stop();
      }
    } catch (e) {
      console.log("Error turning off speech recognizer:", e);
    }

    window.speechSynthesis.cancel();
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
    }
  };

  // Fire up speech recognition continuously
  const initiateVoiceListening = (forceActivate = false) => {
    if (!forceActivate && !isVoiceModeActive) return;

    window.speechSynthesis.cancel();
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
    }

    setVoiceState("listening");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isAr ? "عذراً، متصفحك لا يدعم نظام المايك المتطور والاستماع المستمر." : "Live continuous speech recognition not supported in this browser.");
      return;
    }

    try {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.onend = null;
        voiceRecognitionRef.current.onerror = null;
        voiceRecognitionRef.current.abort();
      }
    } catch (e) {
      console.log(e);
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "ar-YE"; // Target Yemeni dialect speech-to-text natively

    rec.onstart = () => {
      console.log("Continuous voice mode listening started...");
    };

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        setVoiceTranscript(transcript);
        // Dispatch to AI
        handleVoiceSubmit(transcript);
      }
    };

    rec.onerror = (err: any) => {
      console.error("Continuous Speech Error:", err.error);
      if (err.error === "no-speech") {
        // Safe to wait for restart
      } else {
        // Keep resilient by restarting with buffer
        setTimeout(() => {
          if (isVoiceModeActive && voiceState === "listening") {
            initiateVoiceListening();
          }
        }, 1200);
      }
    };

    rec.onend = () => {
      // Loop: restart listening if no words were caught but voice mode is still listening state
      setTimeout(() => {
        if (isVoiceModeActive && voiceState === "listening") {
          try {
            rec.start();
          } catch (e) {
            console.log("Error looping recognition:", e);
          }
        }
      }, 300);
    };

    voiceRecognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.error("Error launching recognition stream:", e);
    }
  };

  // Process human audio transcript to backend and get response
  const handleVoiceSubmit = async (speechText: string) => {
    setVoiceState("thinking");
    setVoiceResponse("");

    // Stop current recognition ends first
    try {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.onend = null;
        voiceRecognitionRef.current.stop();
      }
    } catch (e) {}

    let targetChatId = activeChatId;

    // Create chat flow if user doesn't have active chat
    if (!targetChatId) {
      const defaultTitle = isAr ? `محادثة صوتية لايف` : `Live Voice Chat`;
      const freshChat: Chat = {
        id: Math.random().toString(36).substring(7),
        title: defaultTitle,
        dialect: dialect,
        messages: [],
        createdAt: new Date(),
      };
      onChatsChange([freshChat]);
      setActiveChatId(freshChat.id);
      targetChatId = freshChat.id;
    }

    const newUserMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      text: speechText,
      timestamp: new Date(),
    };

    let updatedChats = chats.map((c) => {
      if (c.id === targetChatId) {
        const newTitle = c.messages.length === 0 ? speechText.substring(0, 24) + "..." : c.title;
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, newUserMessage],
        };
      }
      return c;
    });

    onChatsChange(updatedChats);
    onIncrementMessages();

    // Context windows
    const currentConversation = updatedChats.find((c) => c.id === targetChatId);
    const historyPayload = currentConversation?.messages?.slice(-6).map((m) => ({
      role: m.role,
      text: m.text
    })) || [];

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: speechText,
          dialect: dialect,
          history: historyPayload,
          isPro: user.subscription === "pro"
        })
      });

      if (!res.ok) {
        throw new Error("Chat response returned failure status code");
      }

      const data = await res.json();
      
      const modelMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        text: data.text,
        timestamp: new Date()
      };

      updatedChats = updatedChats.map((c) => {
        if (c.id === targetChatId) {
          return {
            ...c,
            messages: [...c.messages, modelMessage],
          };
        }
        return c;
      });
      onChatsChange(updatedChats);

      setVoiceResponse(data.text);
      setVoiceState("speaking");

      // Auto read AI response aloud
      speakVoiceModeResponse(data.text);
    } catch (e: any) {
      console.error("Voice interaction processing error:", e);
      const fallbackResponse = isAr 
        ? "تعذر على الخادم معالجة طلبك الصوتي حالياً يا غالي. هل يمكنك تكراره؟" 
        : "I ran into a connection error processing that. Could you repeat?";
      
      setVoiceResponse(fallbackResponse);
      setVoiceState("speaking");
      speakVoiceModeResponse(fallbackResponse);
    }
  };

  // Standard Voice Mode Speech Player
  const speakVoiceModeResponse = async (textToSpeak: string) => {
    try {
      const res = await fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak.substring(0, 400) })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const snd = new Audio(`data:audio/wav;base64,${data.audio}`);
          voiceAudioRef.current = snd;

          snd.onended = () => {
            if (isVoiceModeActive) {
              setVoiceTranscript("");
              setVoiceResponse("");
              initiateVoiceListening();
            }
          };

          snd.onerror = () => {
            speakVoiceBrowserFallback(textToSpeak);
          };

          snd.play();
          return;
        }
      }
    } catch (err) {
      console.warn("API voice synthesizer issue, using offline web native speech:", err);
    }

    speakVoiceBrowserFallback(textToSpeak);
  };

  // Fallback offline browser Speech Synthesizer
  const speakVoiceBrowserFallback = (rawText: string) => {
    window.speechSynthesis.cancel();
    const cleanText = rawText.replace(/[*#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ar-YE"; // Yemen Locale Accent

    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find((v) => v.lang.includes("ar"));
    if (arVoice) {
      utterance.voice = arVoice;
    }

    utterance.onend = () => {
      if (isVoiceModeActive) {
        setVoiceTranscript("");
        setVoiceResponse("");
        initiateVoiceListening();
      }
    };

    utterance.onerror = () => {
      if (isVoiceModeActive) {
        setVoiceTranscript("");
        setVoiceResponse("");
        initiateVoiceListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
      try {
        if (voiceRecognitionRef.current) {
          voiceRecognitionRef.current.onend = null;
          voiceRecognitionRef.current.onerror = null;
          voiceRecognitionRef.current.stop();
        }
      } catch (e) {}
    };
  }, []);

  // Delete message item
  const handleDeleteMessage = (msgId: string) => {
    if (!activeChatId) return;
    const updated = chats.map((c) => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: c.messages.filter((m) => m.id !== msgId)
        };
      }
      return c;
    });
    onChatsChange(updated);
  };

  // Save changes block after user edits their message
  const handleSaveEdit = (msgId: string) => {
    if (!activeChatId || !editBuffer.trim()) return;
    
    // Find message rank
    const currentMsgs = activeChat?.messages || [];
    const idx = currentMsgs.findIndex((m) => m.id === msgId);
    if (idx !== -1) {
      // slice and regenerate
      const clippedMessages = currentMsgs.slice(0, idx);
      const updatedChats = chats.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: clippedMessages
          };
        }
        return c;
      });
      onChatsChange(updatedChats);
      setEditingMessageId(null);
      handleSendMessage(editBuffer);
    }
  };

  // Copy text helper
  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Share text placeholder
  const handleShareText = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: "يمن AI",
        text: text,
      }).catch(console.error);
    } else {
      alert(isAr ? "تم محاكاة مشاركة النص بنجاح!" : "Simulated content share!");
    }
  };

  // Arabic Client-Side text to speech
  const handleSpeakText = async (text: string, msgId: string) => {
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msgId);

    // Try standard server-side Gemini TTS first
    try {
      const res = await fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.substring(0, 400) }) // Limit size for speed
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const snd = new Audio(`data:audio/wav;base64,${data.audio}`);
          snd.onended = () => {
            setSpeakingMessageId(null);
          };
          snd.play();
          return;
        }
      }
    } catch (e) {
      console.warn("Server TTS failed, sliding to browser offline speech synthesis:", e);
    }

    // Client-side alternative
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`]/g, ""));
    utterance.lang = "ar-YE"; // Yemen locale prefix

    // Look for Arabic audio voices
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find((v) => v.lang.includes("ar"));
    if (arVoice) {
      utterance.voice = arVoice;
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Search filter
  const filteredChats = chats.filter((c) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[720px] bg-[#161616] rounded-2xl overflow-hidden border border-white/5 shadow-xl font-sans text-right relative" dir="rtl">
      
      {/* SIDEBAR: History / Dialogues tracker */}
      <div className="w-full md:w-80 border-l border-white/5 bg-[#121212] p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-4 flex-1 overflow-y-auto">
          
          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleCreateNewChat}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#D71920] to-[#b3141a] hover:from-[#e3242c] hover:to-[#c4161d] text-white rounded-xl font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "محادثة جديدة مع المساعد" : "New Chat"}</span>
          </button>

          {/* Search bar inside conversation histories */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute right-3 top-3" />
            <input
              type="text"
              placeholder={isAr ? "ابحث في محادثاتك..." : "Search history..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2.5 bg-white/5 border border-white/5 focus:border-[#D71920] rounded-xl text-xs text-white outline-none transition-colors"
            />
          </div>

          {/* Conversations feed list */}
          <div className="space-y-1 pt-1.5">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pr-1 mb-2">
              {isAr ? "المحادثات الأخيرة" : "Recent chats"}
            </p>
            {filteredChats.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">
                {isAr ? "لا توجد محادثات سابقة" : "No chats available"}
              </div>
            ) : (
              filteredChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveChatId(c.id)}
                  className={`w-full text-right p-3 rounded-xl flex items-center justify-between group cursor-pointer transition-colors ${
                    activeChatId === c.id ? "bg-[#D71920]/10 border border-[#D71920]/20 text-white" : "hover:bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate ml-2">
                    <MessageCircle className={`w-4 h-4 shrink-0 ${activeChatId === c.id ? "text-[#D71920]" : "text-gray-500"}`} />
                    <span className="text-xs font-medium truncate">{c.title}</span>
                  </div>
                  
                  {/* Delete conversation session icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatsChange(chats.filter((item) => item.id !== c.id));
                      if (activeChatId === c.id) {
                        setActiveChatId("");
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 text-gray-500 hover:text-red-400 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Dialect Config Segment */}
        <div className="pt-4 border-t border-white/5 mt-auto">
          <label className="block text-[11px] text-gray-400 font-bold mb-1.5">
            {isAr ? "لهجة صاحبك الذكي حالياً:" : "Companion selected dialect:"}
          </label>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            className="w-full bg-[#1b1b1b] border border-white/10 text-xs text-white rounded-xl px-3 py-2.5 focus:border-[#D71920] outline-none"
          >
            <option value="sanaani">🗣️ الصنعانية (يا ركني، ها عيس)</option>
            <option value="adeni">🗣️ العدنية (يا عيني، والسهالة)</option>
            <option value="taizzi">🗣️ التعزية (إيش تبي، يا غالي)</option>
            <option value="hadhrami">🗣️ الحضرمية (مرحب الساع، بغيت)</option>
            <option value="tihami">🗣️ التهامية (تشا، معجلي)</option>
            <option value="maribi">🗣️ المأربية (يا رفيقي)</option>
            <option value="ibbi">🗣️ الإبية (إيش حالك)</option>
            <option value="shabwani">🗣️ الشبوانية (الحاشية)</option>
          </select>
        </div>
      </div>

      {/* MAIN SCREEN: Real-time dynamic messages board */}
      <div className="flex-grow flex flex-col justify-between bg-[#141414] relative">
        
        {/* Banner metadata of active conversation */}
        <div className="px-6 py-4 border-b border-white/5 bg-[#171717] flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={avatarImg}
                alt="صاحبك"
                className={`w-10 h-10 rounded-full object-cover border-2 ${
                  speakingMessageId ? "border-green-400 ring-4 ring-green-400/20 scale-105 animate-[pulse_1.5s_infinite]" : "border-[#D71920]/30"
                } transition-all duration-300`}
                style={{ contentReferrerPolicy: "no-referrer" }}
              />
              {speakingMessageId && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border border-[#141414] w-3.5 h-3.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">صاحبك</span>
                {speakingMessageId ? (
                  <span className="flex items-end gap-0.5 h-3.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-full text-[9px]">
                    <span className="text-[8px] ml-1">{isAr ? "يتحدث" : "Speaking"}</span>
                    <span className="w-0.5 bg-green-400 rounded-full animate-[bounce_1s_infinite_100ms] h-2"></span>
                    <span className="w-0.5 bg-green-400 rounded-full animate-[bounce_1s_infinite_300ms] h-3"></span>
                    <span className="w-0.5 bg-green-400 rounded-full animate-[bounce_1s_infinite_200ms] h-1.5"></span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] bg-[#D9A14E]/10 border border-[#D9A14E]/30 text-[#D9A14E] font-medium rounded-full">
                    {isAr ? "متصل - متاح" : "Online"}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500">
                {isAr ? `يتحدث ويكتب بلهجة: ${
                  dialect === "sanaani" ? "الصنعانية" : 
                  dialect === "adeni" ? "العدنية" : 
                  dialect === "taizzi" ? "التعزية" : 
                  dialect === "hadhrami" ? "الحضرمية" : 
                  dialect === "tihami" ? "التهامية" : 
                  dialect === "maribi" ? "المأربية" : 
                  dialect === "ibbi" ? "الإبية" : 
                  dialect === "shabwani" ? "الشبوانية" : "العامية"
                }` : `Active dialect: ${dialect}`}
              </span>
            </div>
          </div>

          {/* ChatGPT Style Live Voice Interactive Session Trigger */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={startVoiceMode}
              className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-[#b3141a] text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer relative overflow-hidden group border border-[#D71920]/30"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <Headphones className="w-4 h-4 text-white" />
              <span>{isAr ? "المحادثة الصوتية اللايف (ChatGPT Mode)" : "Live Voice Mode"}</span>
            </button>

            {/* Quick specs for subscription limits */}
            <div className="text-left font-mono shrink-0">
              <span className="text-xs text-gray-400">
                {user.subscription === "free" ? `${user.dailyMessageCount} / 20 حرة` : "باقة بيزنس مفتوحة"}
              </span>
            </div>
          </div>
        </div>

        {/* FEED: Messages section scrollable */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {(!activeChat || activeChat.messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 py-12">
              <div className="w-16 h-16 rounded-3xl bg-[#D71920]/5 flex items-center justify-center text-3xl border border-[#D71920]/20 animate-pulse">
                🤝
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "أرحب يا غالي! أنا صاحبك ومستشارك" : "Welcome, I am Sahibak!"}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {isAr 
                    ? "هلا والله، أنا صاحبك الذكي ومساعدك اليمني الوفي. اسألني في التاريخ، اللهجات، كتب المناهج، الحسابات، أو الفواتير بلهجتنا الحالية وسأساعدك فوراً!"
                    : "I am ready. Ask me cultural terms, dialect translations, homework explainers, or local Rial finances."}
                </p>
              </div>

              {/* Quick action helper prompts */}
              <div className="grid grid-cols-2 gap-2.5 w-full pt-4">
                {[
                  { text: "أيش معنى 'يا ركني' وصحبته؟", icon: "💬" },
                  { text: "تشتي أكتب معاملة حكومية رسمية؟", icon: "✍️" },
                  { text: "اشرح لي فكرة 'سلّطة' يمنية قيسية", icon: "🍲" },
                  { text: "احسب لي تسعيرة الشاي العدني الأصيل", icon: "☕" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.text)}
                    className="p-3 bg-white/5 border border-white/5 hover:border-[#D71920]/40 text-right rounded-xl hover:bg-white/10 transition-all text-[11px] text-gray-300 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeChat.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "mr-auto flex-row-reverse text-left" : "ml-auto"}`}
                >
                  {/* Avatar containing professional cartoon avatarImg */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden border ${
                    m.role === "user" ? "bg-white/10 border-white/10 text-[10px]" : "bg-[#D71920]/10 border-[#D71920]/20"
                  }`}>
                    {m.role === "user" ? (
                      "👤"
                    ) : (
                      <img src={avatarImg} alt="صاحبك" className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Message Bubble Column */}
                  <div className="space-y-1.5 flex-grow">
                    
                    {/* User name indicator */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 px-1">
                      <span>{m.role === "user" ? user.name : "صاحبك"}</span>
                      <span>•</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString(isAr ? "ar-YE" : "en-US", { hour: "numeric", minute: "2-digit" })}</span>
                    </div>

                    <div className={`p-4 rounded-2xl relative group ${
                      m.role === "user" 
                        ? "bg-gradient-to-br from-[#D71920] to-[#b3141a] text-white rounded-tl-none font-medium shadow-md"
                        : "bg-[#1d1d1d] text-gray-100 rounded-tr-none border border-white/5 shadow-sm"
                    }`}>
                      {editingMessageId === m.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editBuffer}
                            onChange={(e) => setEditBuffer(e.target.value)}
                            className="w-full bg-[#2a2a2a] text-white p-2 rounded-lg border border-white/20 text-xs focus:border-[#D71920] outline-none"
                            rows={3}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingMessageId(null)}
                              className="px-2.5 py-1 text-[10px] bg-white/5 hover:bg-white/10 rounded font-medium"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(m.id)}
                              className="px-2.5 py-1 text-[10px] bg-[#D71920] rounded font-bold"
                            >
                              تعديل وإرسال
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <MarkdownSimple content={streamingStates[m.id] ? streamingStates[m.id].currentText : m.text} />
                          {streamingStates[m.id] && !streamingStates[m.id].isComplete && (
                            <span className="inline-block w-2 h-3.5 bg-[#D71920] rounded-sm animate-pulse mr-1 align-middle" />
                          )}
                        </div>
                      )}

                      {/* Tool Actions overlay bar inside bubbles */}
                      {editingMessageId !== m.id && (
                        <div className={`flex items-center gap-1 mt-2.5 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity justify-end`}>
                          <button
                            type="button"
                            onClick={() => handleSpeakText(m.text, m.id)}
                            className={`p-1 hover:bg-white/10 rounded transition-colors ${
                              speakingMessageId === m.id ? "text-green-400 animate-pulse" : "text-gray-400 hover:text-white"
                            }`}
                            title={isAr ? "قراءة صوتية" : "Listen Speak"}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyText(m.text, m.id)}
                            className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors"
                            title={isAr ? "نسخ" : "Copy"}
                          >
                            {copiedMessageId === m.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShareText(m.text)}
                            className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors"
                            title={isAr ? "مشاركة" : "Share"}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {m.role === "user" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMessageId(m.id);
                                setEditBuffer(m.text);
                              }}
                              className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors"
                              title={isAr ? "تعديل" : "Edit"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            // Regenerate response
                            <button
                              type="button"
                              onClick={() => {
                                // Find previous rank user message
                                const currentMsgs = activeChat?.messages || [];
                                const idx = currentMsgs.findIndex((msg) => msg.id === m.id);
                                if (idx > 0) {
                                  const lastUserText = currentMsgs[idx - 1].text;
                                  // delete user + current model msg
                                  const clipped = currentMsgs.slice(0, idx - 1);
                                  onChatsChange(chats.map((c) => {
                                    if (c.id === activeChatId) {
                                      return { ...c, messages: clipped };
                                    }
                                    return c;
                                  }));
                                  handleSendMessage(lastUserText);
                                }
                              }}
                              className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors"
                              title={isAr ? "إعادة توليد" : "Regenerate"}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(m.id)}
                            className="p-1 hover:bg-white/10 text-gray-400 hover:text-red-400 rounded transition-colors"
                            title={isAr ? "حذف" : "Delete"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming AI Generating feedback card */}
              {isGenerating && (
                <div className="flex gap-3 max-w-[85%] ml-auto">
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden border border-[#D71920]/20 relative animate-pulse">
                    <img src={avatarImg} alt="صاحبك" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 bg-[#1b1b1b] p-4 rounded-2xl rounded-tr-none border border-white/5 shadow-sm max-w-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white pr-1">صاحبك يفكر ويكتب...</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[#D71920] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 bg-[#D71920] rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                        <div className="w-1.5 h-1.5 bg-[#D71920] rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
                      </div>
                    </div>
                    {/* Authentic helpful local fact or wisdom to improve premium perception */}
                    <p className="text-[10px] text-gray-500 leading-normal italic">
                      💡 {yemeniFacts[currentFactIdx]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT: Keyboard text, file upload triggers, speech recordings */}
        <div className="p-4 border-t border-white/5 bg-[#171717] z-10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2.5 relative"
          >
            {/* Micron/Mic Speech recording indicator button */}
            <button
              type="button"
              onClick={toggleSpeech}
              className={`p-3.5 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                speechRecognizing 
                  ? "bg-red-600 border-red-500 text-white animate-pulse" 
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white"
              }`}
              title={isAr ? "إدخال صوتي باللهجة اليمنية" : "Voice Dialect Input"}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Main Input area */}
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder={
                  speechRecognizing 
                    ? (isAr ? "تكلم الآن بفديتك، أنا جالس أسمعك..." : "Listening...") 
                    : (isAr ? "اكتب رسالتك لصاحبك، يا غالي..." : "Type text...")
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full pr-4 pl-12 py-3.5 bg-white/5 border border-white/10 focus:border-[#D71920] rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-colors"
                disabled={speechRecognizing}
              />

              {/* Stop generation button floats inside */}
              {isGenerating && (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="absolute left-3 top-3.5 p-1 bg-[#D71920] hover:bg-red-700 text-white rounded transition-colors flex items-center justify-center cursor-pointer"
                  title={isAr ? "إيقاف التوليد" : "Stop"}
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
            </div>

            {/* Submit Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className="p-3.5 bg-gradient-to-r from-[#D71920] to-[#b3141a] hover:from-[#e3242c] hover:to-[#c4161d] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer shrink-0"
            >
              <Send className="w-5 h-5 rotate-180" />
            </button>
          </form>
          
          <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 px-1">
            <span>{isAr ? "اضغط Enter للإرسال مباشرة" : "Press Enter to transmit"}</span>
            <span>{isAr ? "مدعوم بنظام أمان وحفظ سحابي" : "Powered by Gemini 3.5 & Secure Sync"}</span>
          </div>
        </div>
      </div>

      {/* IMMERSIVE LIVE VOICE ASSISTANT OVERLAY (ChatGPT / Gemini Live Mode) */}
      <AnimatePresence>
        {isVoiceModeActive && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 bg-[#0A0A0A]/98 backdrop-blur-xl z-50 flex flex-col items-center justify-between p-6 md:p-12 text-center"
            dir="rtl"
          >
            {/* Inject Custom Audio Bouncing Wave CSS Styles */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes bounceBar {
                0%, 100% { height: 16px; transform: scaleY(1); opacity: 0.5; }
                50% { height: 72px; transform: scaleY(1.2); opacity: 1; }
              }
              .audio-bar-1 { animation: bounceBar 0.9s infinite ease-in-out; }
              .audio-bar-2 { animation: bounceBar 0.7s infinite ease-in-out 0.15s; }
              .audio-bar-3 { animation: bounceBar 1.1s infinite ease-in-out 0.3s; }
              .audio-bar-4 { animation: bounceBar 0.6s infinite ease-in-out 0.05s; }
              .audio-bar-5 { animation: bounceBar 0.8s infinite ease-in-out 0.25s; }
              .audio-bar-6 { animation: bounceBar 1.0s infinite ease-in-out 0.4s; }
              .audio-bar-7 { animation: bounceBar 0.7s infinite ease-in-out 0.2s; }
              .audio-bar-8 { animation: bounceBar 0.9s infinite ease-in-out 0.1s; }
            `}} />

            {/* Header: Brand and Dialect state indicators */}
            <div className="w-full max-w-4xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                  {isAr ? "المحادثة الصوتية المباشرة (Yemen AI Live)" : "YEMEN AI VOICE LIVE"}
                </span>
              </div>
              <button
                type="button"
                onClick={stopVoiceMode}
                className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer border border-white/5 shadow-md"
                title={isAr ? "إغلاق الجلسة الصوتية" : "Exit Voice Session"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Middle: Cosmic Animated Sound Waves and Avatar Box */}
            <div className="flex flex-col items-center justify-center my-auto space-y-10 relative">
              <div className="relative flex items-center justify-center w-80 h-80">
                
                {/* Visualizer Circle Wave 1 (For LISTENING STATE) */}
                {voiceState === "listening" && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-green-500/5 border border-green-500/20 animate-[ping_3s_infinite]" />
                    <div className="absolute -inset-4 rounded-full bg-green-500/10 border border-green-500/30 animate-[ping_2s_infinite_500ms]" />
                    <div className="absolute -inset-10 rounded-full bg-green-500/5 text-transparent select-none animate-pulse">●</div>
                  </>
                )}

                {/* Visualizer Circle Wave 2 (For THINKING STATE) */}
                {voiceState === "thinking" && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D71920]/40 animate-spin" style={{ animationDuration: '6s' }} />
                    <div className="absolute -inset-6 rounded-full border border-dashed border-amber-500/30 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                  </>
                )}

                {/* Visualizer Circle Wave 3 (For SPEAKING STATE) */}
                {voiceState === "speaking" && (
                  <>
                    <div className="absolute inset-x-0 bottom-[-10px] flex items-end justify-center gap-1.5 h-24 z-10">
                      <div className="w-2.5 bg-gradient-to-t from-red-600 to-amber-500 rounded-full audio-bar-1" />
                      <div className="w-2.5 bg-gradient-to-t from-red-600 to-amber-500 rounded-full audio-bar-2" />
                      <div className="w-2.5 bg-gradient-to-t from-red-600 to-amber-500 rounded-full audio-bar-3" />
                      <div className="w-2.5 bg-gradient-to-t from-red-600 to-amber-500 rounded-full audio-bar-4" />
                      <div className="w-2.5 bg-gradient-to-t from-red-600 to-amber-500 rounded-full audio-bar-5" />
                      <div className="w-2.5 bg-gradient-to-t from-red-600 to-amber-500 rounded-full audio-bar-6" />
                      <div className="w-2.5 bg-gradient-to-t from-red-600 to-amber-500 rounded-full audio-bar-7" />
                      <div className="w-2.5 bg-gradient-to-t from-red-600 to-amber-500 rounded-full audio-bar-8" />
                    </div>
                    {/* Pulsing red halo */}
                    <div className="absolute inset-0 rounded-full bg-[#D71920]/5 ring-8 ring-[#D71920]/10 animate-[pulse_1.5s_infinite]" />
                  </>
                )}

                {/* Absolute Avatar Frame */}
                <div className={`w-44 h-44 rounded-full overflow-hidden border-4 ${
                  voiceState === "listening" ? "border-green-400/80 shadow-green-400/10" :
                  voiceState === "thinking" ? "border-amber-400/80 shadow-amber-400/10" :
                  voiceState === "speaking" ? "border-red-500/80 shadow-red-500/10" : "border-white/10"
                } transition-all duration-500 shadow-2xl relative z-20`}>
                  <img
                    src={avatarImg}
                    alt="صاحبك"
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      voiceState === "speaking" ? "scale-105" : "scale-100"
                    }`}
                  />
                  {voiceState === "listening" && (
                    <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                      <Mic className="w-8 h-8 text-green-300 animate-bounce" />
                    </div>
                  )}
                </div>

              </div>

              {/* Status information & captions */}
              <div className="space-y-3">
                <h2 className={`text-2xl font-black transition-all ${
                  voiceState === "listening" ? "text-green-400" :
                  voiceState === "thinking" ? "text-amber-400" :
                  voiceState === "speaking" ? "text-red-500" : "text-white"
                }`}>
                  {voiceState === "listening" && (isAr ? "صاحبك يستمع إليك الآن..." : "Listening...")}
                  {voiceState === "thinking" && (isAr ? "صاحبك يفكر في الرد..." : "Thinking...")}
                  {voiceState === "speaking" && (isAr ? "صاحبك يتحدث إليك دحين..." : "Speaking...")}
                </h2>
                
                <p className="text-xs text-gray-400">
                  {isAr ? `تتحدث بلهجة: ${
                    dialect === "sanaani" ? "الصنعانية" : 
                    dialect === "adeni" ? "العدنية" : 
                    dialect === "taizzi" ? "التعزية" : 
                    dialect === "hadhrami" ? "الحضرمية" : 
                    dialect === "tihami" ? "التهامية" : 
                    dialect === "maribi" ? "المأربية" : 
                    dialect === "ibbi" ? "الإبية" : 
                    dialect === "shabwani" ? "الشبوانية" : "العامية"
                  }` : `Continuous Accent: ${dialect}`}
                </p>
              </div>

              {/* Live subtitling/transcripts containers */}
              <div className="w-full max-w-xl space-y-6 pt-4">
                {/* Spoken Text from User */}
                {voiceTranscript && (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-sm max-w-md mx-auto">
                    <span className="text-[10px] text-gray-500 block mb-1 font-bold">{isAr ? "ما قلته أنت:" : "You said:"}</span>
                    <p className="text-sm font-medium text-gray-300 leading-normal">
                      &quot;{voiceTranscript}&quot;
                    </p>
                  </div>
                )}

                {/* AI Reply Preview Text inside bubbles */}
                {voiceResponse && (
                  <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-5 shadow-lg max-w-lg mx-auto">
                    <span className="text-[10px] text-[#D71920] block mb-1 font-bold">{isAr ? "صاحبك يقول:" : "Sahibak responds:"}</span>
                    <p className="text-base text-gray-200 font-extrabold leading-relaxed text-right">
                      {voiceResponse}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Footer Control bar: Mute or exit session */}
            <div className="flex flex-col items-center justify-center space-y-4 pb-4">
              <button
                type="button"
                onClick={stopVoiceMode}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-[#b3141a] hover:from-red-700 hover:to-red-800 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer text-sm border border-red-500/20 ring-4 ring-red-600/10"
              >
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                <span>{isAr ? "إنهاء الجلسة الصوتية" : "Disconnect Session"}</span>
              </button>
              
              <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed">
                {isAr 
                  ? "تواصل مستمر بدون استخدام اليدين. بمجرد انتهاء كلام صاحبك، سيبدأ الميكروفون بالاستماع لك تلقائياً."
                  : "Hands-free conversational state. Microphone opens up automatically once Sahibak ceases to talk."}
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
