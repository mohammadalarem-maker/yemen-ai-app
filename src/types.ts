export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  audioUrl?: string; // TTS result if played
}

export interface Chat {
  id: string;
  title: string;
  dialect: string;
  messages: Message[];
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  profilePicture: string;
  numChats: number;
  subscription: "free" | "pro";
  dailyMessageCount: number;
  joinedDate: string;
  isGuest: boolean;
}

export interface AppSettings {
  language: "ar" | "en";
  theme: "dark" | "light";
  notificationsEnabled: boolean;
  activeDialect: string;
}
