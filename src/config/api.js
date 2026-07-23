const rawApiBaseUrl = import.meta.env.VITE_API_URL || "https://track-intern.onrender.com";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");