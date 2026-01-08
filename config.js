/**
 * Bible 365 - Configuration
 * Gemini AI API Configuration
 */

const geminiConfig = {
    workerUrl: "https://gemini-proxy.emilyjoyceline.workers.dev/",
    model: "gemini-2.0-flash"
};

// App Settings
const appConfig = {
    appName: "Bible 365",
    cachePrefix: "bible365_ai_exegesis_",
    maxCacheAge: 7 * 24 * 60 * 60 * 1000, 
    passwordHash: "696840207d8dd9dec0694daecc6863e950c083576e0236901176682d53b1d08f"
};
