import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize the AI client only when needed
const getAiClient = () => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be simulated or fail.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMagicCaption = async (userPrompt: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "🚀 Experiencing Africa! #HappyAfrica (API Key Missing)";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a social media expert for a TikTok-like app called "Happy Africa".
      Generate a catchy, short, and engaging video caption based on this user input: "${userPrompt}".
      Include 3-4 relevant hashtags.
      Keep it under 150 characters.
      Do not include quotes around the output.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text ? response.text.trim() : "Just sharing good vibes! ✨ #HappyAfrica";
  } catch (error) {
    console.error("Error generating caption:", error);
    return "Just sharing good vibes! ✨ #HappyAfrica";
  }
};

export interface TrendingSong {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre?: string;
  audioUrl?: string; // Playable URL
}

// RELIABLE AUDIO SOURCES (hosted examples for demo purposes)
// These replace the previous temporary URLs to ensure playback works.
const AUDIO_LIBRARY = {
  // Simulating Bongo Flava (Rhythmic, Melodic)
  bongo1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
  bongo2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  // Simulating Amapiano (Deep House/Log Drum vibes)
  amapiano: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  // Simulating Afrobeats (Upbeat, Pop)
  afrobeat1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
  afrobeat2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  // General Pop
  pop: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
};

const SAMPLE_LIST = Object.values(AUDIO_LIBRARY);

export const getTrendingMusic = async (): Promise<TrendingSong[]> => {
  const ai = getAiClient();
  
  // FALLBACK DATA: Real Bongo Flava & East African Hits
  // Manually mapped to specific audio tracks to simulate "original" vibe difference
  const FALLBACK_HITS: TrendingSong[] = [
    { id: 'b1', title: 'Yatapita', artist: 'Diamond Platnumz', duration: '0:45', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.bongo1 },
    { id: 'b2', title: 'Single Again', artist: 'Harmonize', duration: '0:30', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.bongo2 },
    { id: 'b3', title: 'Sukari', artist: 'Zuchu', duration: '0:40', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.afrobeat1 },
    { id: 'b4', title: 'Mahaba', artist: 'Ali Kiba', duration: '0:50', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.bongo1 },
    { id: 'b5', title: 'Nitongoze', artist: 'Rayvanny ft. Diamond Platnumz', duration: '0:35', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.bongo2 },
    { id: 'b6', title: 'Mi Amor', artist: 'Marioo ft. Jovial', duration: '0:45', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.afrobeat2 },
    { id: 'b7', title: 'Enjoy', artist: 'Jux ft. Diamond Platnumz', duration: '0:40', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.pop },
    { id: 'b8', title: 'Nimekuzoea', artist: 'Nandy', duration: '0:30', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.bongo1 },
    { id: 'b9', title: 'Amelowa', artist: 'Mbosso', duration: '0:55', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.bongo2 },
    { id: 'b10', title: 'Puuh', artist: 'Billnass ft. Jay Melody', duration: '0:35', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.afrobeat1 },
    { id: 'f1', title: 'Water', artist: 'Tyla', duration: '0:30', genre: 'Amapiano', audioUrl: AUDIO_LIBRARY.amapiano },
    { id: 'f2', title: 'Unavailable', artist: 'Davido', duration: '0:45', genre: 'Afrobeats', audioUrl: AUDIO_LIBRARY.afrobeat2 },
    { id: 'f3', title: 'Kwangwaru', artist: 'Harmonize ft. Diamond Platnumz', duration: '0:50', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.bongo1 },
    { id: 'f4', title: 'Tetema', artist: 'Rayvanny ft. Diamond Platnumz', duration: '0:40', genre: 'Bongo Flava', audioUrl: AUDIO_LIBRARY.afrobeat2 }
  ];

  if (!ai) return FALLBACK_HITS;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "List 15 currently trending East African Bongo Flava songs, along with popular Afrobeats and Amapiano hits. Return a strictly valid JSON array.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              duration: { type: Type.STRING },
              genre: { type: Type.STRING },
            },
            required: ['id', 'title', 'artist', 'duration']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return FALLBACK_HITS;
    
    const parsed = JSON.parse(text);
    // Add fake audio URLs to AI data since it can't return real MP3s
    return parsed.map((song: any, index: number) => ({
       ...song,
       audioUrl: SAMPLE_LIST[index % SAMPLE_LIST.length]
    }));

  } catch (error) {
    console.error("Error fetching trending music:", error);
    return FALLBACK_HITS;
  }
};