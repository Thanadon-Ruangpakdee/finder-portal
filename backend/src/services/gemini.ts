import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from '../config/vault';

// Simplified local mapping fallback for offline/development mode
const LOCAL_KEYWORDS: { [key: string]: { category: string; tags: string[] } } = {
  macbook: { category: 'Electronics', tags: ['laptop', 'macbook', 'apple', 'device'] },
  iphone: { category: 'Electronics', tags: ['phone', 'iphone', 'apple', 'mobile'] },
  wallet: { category: 'Wallets & Bags', tags: ['leather', 'wallet', 'money', 'pocket'] },
  bag: { category: 'Wallets & Bags', tags: ['backpack', 'bag', 'carry'] },
  keys: { category: 'Keys', tags: ['metal', 'keychain', 'keys'] },
  key: { category: 'Keys', tags: ['metal', 'keychain', 'keys'] },
  bottle: { category: 'Bottles & Tumblers', tags: ['bottle', 'water', 'hydroflask', 'drink'] },
  card: { category: 'IDs & Cards', tags: ['id', 'card', 'license', 'university'] },
  book: { category: 'Books & Documents', tags: ['textbook', 'book', 'notebook', 'study'] }
};

export async function analyzeItemDescription(description: string): Promise<{ category: string; tags: string[] }> {
  const config = getConfig();
  const apiKey = config.GEMINI_API_KEY;

  if (apiKey) {
    console.log('[Gemini] Real API Key detected. Performing AI Auto-Categorization...');
    try {
      // In @google/generative-ai:
      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        You are FinderPortal's AI categorization assistant.
        Given the following lost & found item description: "${description}"
        Classify it into one of these exact categories:
        - Electronics
        - Wallets & Bags
        - IDs & Cards
        - Keys
        - Bottles & Tumblers
        - Books & Documents
        - Accessories
        - Other

        Also, generate a list of 3-5 clean keywords/tags describing the item.
        Respond ONLY in valid JSON format matching this schema:
        {
          "category": "Selected Category Name",
          "tags": ["tag1", "tag2", "tag3"]
        }
      `;

      const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
      const responseText = result.response.text().trim();
      
      // Clean JSON if Gemini wrapped it in markdown codeblocks
      const cleaned = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.category && Array.isArray(parsed.tags)) {
        return {
          category: parsed.category,
          tags: parsed.tags.map((t: string) => t.toLowerCase())
        };
      }
    } catch (err: any) {
      console.warn(`[Gemini Warning] Real AI analysis failed: ${err.message}. Falling back to local mapping.`);
    }
  }

  // Fallback Rule-Based Analyzer
  console.log('[Gemini Fallback] Simulating AI classification locally.');
  const descLower = description.toLowerCase();
  
  for (const [keyword, data] of Object.entries(LOCAL_KEYWORDS)) {
    if (descLower.includes(keyword)) {
      return data;
    }
  }

  // Generic fallback if no keyword matches
  return {
    category: 'Other',
    tags: ['item', 'campus', 'found']
  };
}
