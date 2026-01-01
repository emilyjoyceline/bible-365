/**
 * Bible 365 - Configuration
 * Gemini AI API Configuration
 */

const geminiConfig = {
    apiKey: "AIzaSyAnC40-ZB3Fg1ucR-cUJcCy9vSECP_M5Oo",
    model: "gemini-3-flash-preview",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"
};

// App Settings
const appConfig = {
    appName: "Bible 365",
    cachePrefix: "bible365_ai_exegesis_",
    maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    passwordHash: "696840207d8dd9dec0694daecc6863e950c083576e0236901176682d53b1d08f"
};
