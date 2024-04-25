import dotenv from "dotenv";

dotenv.config();

interface Config {
  JWT_SECRET: string;
  PORT: number;
  FAST2SMS_API: string;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_DATABASE_URL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID: string;
}

const config: Config = {
  JWT_SECRET: process.env.JWT_SECRET || "",
  PORT: Number(process.env.PORT) || 3000,
  FAST2SMS_API: process.env.FAST2SMS_API || "",
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || "",
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || "",
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || "",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "",
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || "",
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || "",
};

export default config;
