/**
 * Bible 365 - Configuration
 * Gemini AI API Configuration
 */

const geminiConfig = {
    apiKey: "AIzaSyCd1NUS1TQXAezBg05edi_PrMOF1Xe2cQc",
    model: "gemini-3-flash-preview",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"
};

// App Settings
const appConfig = {
    appName: "Bible 365",
    appName: "Bible 365",
    cachePrefix: "bible365_ai_exegesis_",
    maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    passwordHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4" // SHA-256 for "1234"
};
