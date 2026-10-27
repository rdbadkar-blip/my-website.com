import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// AI Copywriter endpoint powered by Gemini 3.8 Flash
app.post('/api/ai-writer', async (req: Request, res: Response) => {
  try {
    const { businessType = 'hotel', businessName = '', tone = 'friendly' } = req.body;
    const name = (businessName || '').trim() || 'Our Small Business';

    const fallbacks: Record<string, { tagline: string; about: string; items: Array<{ name: string; desc: string; price: string }> }> = {
      hotel: {
        tagline: 'Quiet stays, peaceful mornings, and heartfelt hospitality.',
        about: `${name} is an intimate sanctuary designed for rest, slow mornings, and genuine connection. Every room is prepared with thoughtful detail to make you feel completely at home.`,
        items: [
          { name: 'Garden Suite', desc: 'King bed, leafy terrace, walk-in shower & artisanal breakfast', price: '$85 / night' },
          { name: 'Loft Studio', desc: 'High ceilings, dedicated work nook & panoramic sunrise views', price: '$110 / night' },
          { name: 'Family Veranda', desc: 'Two bedrooms, lounge corner & direct garden courtyard access', price: '$145 / night' },
        ],
      },
      food: {
        tagline: 'Farm-fresh ingredients cooked with patience and fire.',
        about: `At ${name}, we celebrate local producers and authentic flavors. From slow-simmered sauces to hand-baked crusts, every dish is crafted to bring people together around the table.`,
        items: [
          { name: 'Chef’s Tasting Board', desc: 'Artisanal cheeses, seasonal preserves & house sourdough', price: '$18' },
          { name: 'Wood-Fired Signature', desc: 'Slow-roasted seasonal vegetables with hand-pulled burrata', price: '$22' },
          { name: 'Honey Glazed Tart', desc: 'Wild blossom honey, toasted pistachios & vanilla bean cream', price: '$9' },
        ],
      },
      company: {
        tagline: 'Modern craftsmanship for forward-thinking organizations.',
        about: `${name} partners with ambitious brands to solve complex problems with clarity and design. We build high-impact digital experiences and lasting software foundations.`,
        items: [
          { name: 'Strategic Advisory', desc: 'Deep architecture audit, technology roadmap & scaling plan', price: 'Fixed Project' },
          { name: 'Full-Cycle Build', desc: 'End-to-end design, engineering and production delivery', price: 'Monthly Retainer' },
          { name: 'Dedicated Support', desc: '24/7 reliability monitoring, performance tuning & evolution', price: 'Custom' },
        ],
      },
      shop: {
        tagline: 'Curated goods made to last a lifetime.',
        about: `Welcome to ${name}. We handpick ethical goods crafted by independent artisans who cherish quality materials, honest aesthetics, and conscious living.`,
        items: [
          { name: 'Ceramic Pour-Over Vessel', desc: 'Stoneware wheel-thrown with speckled matte glaze', price: '$36' },
          { name: 'Organic Linen Throw', desc: 'Pre-washed Belgian flax in earthy terra-cotta hues', price: '$64' },
          { name: 'Cedar & Vetiver Candle', desc: 'Pure soy wax with natural essential botanicals', price: '$28' },
        ],
      },
      clinic: {
        tagline: 'Compassionate care that listens to your whole story.',
        about: `At ${name}, your health and comfort are at the center of every conversation. Our practitioners provide evidence-based care in a calm, welcoming environment.`,
        items: [
          { name: 'Comprehensive Initial Visit', desc: '60-minute in-depth consultation and wellness baseline', price: '$95' },
          { name: 'Targeted Therapy Session', desc: 'Custom hands-on treatment and guided rehabilitation', price: '$75' },
          { name: 'Quarterly Check-In', desc: 'Progress assessment, preventive screening & habit review', price: '$50' },
        ],
      },
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallback = fallbacks[businessType] || fallbacks.company;
      res.json({
        success: true,
        source: 'curated_preset',
        tagline: fallback.tagline,
        about: fallback.about,
        items: fallback.items,
      });
      return;
    }

    const ai = new GoogleGenAI();
    const prompt = `You are a world-class copywriter for independent small businesses.
Create concise, evocative, authentic website copy for a business with:
- Business Name: "${name}"
- Business Category: "${businessType}" (e.g. hotel/homestay, restaurant/cafe, agency/company, boutique/shop, clinic/services)
- Tone: ${tone}

Respond with strictly valid JSON matching this schema:
{
  "tagline": "one punchy, evocative sentence under 9 words",
  "about": "2 to 3 warm, natural sentences telling who they are, what makes them special, and why customers love them. Avoid corporate buzzwords or artificial fluff.",
  "items": [
    { "name": "Item or Service 1", "desc": "1 crisp, enticing sentence", "price": "realistic price with currency or label like 'From $45' or '$22'" },
    { "name": "Item or Service 2", "desc": "1 crisp, enticing sentence", "price": "realistic price" },
    { "name": "Item or Service 3", "desc": "1 crisp, enticing sentence", "price": "realistic price" }
  ]
}
Only output the JSON object, with no markdown code fence or extra text.`;

    let parsed;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      try {
        parsed = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      }
    } catch (apiErr) {
      console.warn('Gemini API call warning, using curated artisanal copy:', apiErr);
    }

    if (parsed && parsed.tagline && parsed.about) {
      res.json({
        success: true,
        source: 'gemini-3.8-flash',
        tagline: parsed.tagline,
        about: parsed.about,
        items: parsed.items || [],
      });
      return;
    }

    // High quality tailored fallback if model is unavailable
    const fallback = fallbacks[businessType] || fallbacks.company;
    res.json({
      success: true,
      source: 'curated_fallback',
      tagline: fallback.tagline,
      about: fallback.about,
      items: fallback.items,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Server error in /api/ai-writer:', error);
    res.json({
      success: true,
      source: 'offline_preset',
      tagline: 'Quiet stays, peaceful mornings, and heartfelt hospitality.',
      about: 'Welcome to our home away from home. Every detail is prepared to make you feel completely welcomed.',
      items: [
        { name: 'Standard Suite', desc: 'Comfortable bed, private bath & morning breakfast', price: 'From $65' },
        { name: 'Deluxe Suite', desc: 'Balcony with garden views & afternoon tea', price: 'From $95' }
      ]
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Whub Site Maker server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
