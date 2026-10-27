import { BusinessPreset, BusinessType } from '../types';

export const BUSINESS_PRESETS: Record<BusinessType, BusinessPreset> = {
  hotel: {
    name: 'Maple House Homestay',
    label: 'Rooms & Suites',
    cta: 'Book your stay',
    tag: 'A comfortable stay with a warm, peaceful welcome',
    about: 'Welcome to our intimate home away from home. Enjoy clean, sunlit rooms, garden-fresh breakfasts, and a peaceful rest just moments from the historic downtown.',
    items: `Standard Queen Room | Plush mattress, AC, en-suite rain shower & high-speed Wi-Fi | From $65 / night
Deluxe Garden Suite | Balcony with courtyard views, artisan tea corner & bath robes | From $95 / night
Family Loft | Two bedrooms, open seating area, kitchenette & reading nook | From $130 / night`,
  },
  food: {
    name: 'The Copper Kettle Bistro',
    label: 'Menu Highlights',
    cta: 'Reserve a table',
    tag: 'Fresh local food cooked with fire and patience',
    about: 'We cook seasonal ingredients harvested from nearby family farms. Every dish is seasoned with care, meant to be shared with laughter and good company.',
    items: `House Smoked Burrata | Heirloom tomatoes, basil oil & toasted sourdough | $14
Wood-Fired Roast Chicken | Rosemary potatoes, charred lemon & thyme jus | $24
Warm Almond Plum Tart | Handcrafted daily with vanilla bean mascarpone | $9`,
  },
  company: {
    name: 'Northstar Digital Studio',
    label: 'Our Services',
    cta: 'Start a project',
    tag: 'Modern software and design built to last',
    about: 'We are a boutique team that listens deeply and delivers on schedule. We transform ideas into intuitive products and reliable digital foundations.',
    items: `Product Strategy & Discovery | Architecture roadmaps, user research & prototype validation | Project-Based
Full-Stack Web Development | Fast, accessible applications crafted with modern tech stacks | Retainer / Fixed
Brand & Interface Design | High-fidelity UI systems, responsive design & design tokens | Fixed Scope`,
  },
  shop: {
    name: 'Atelier Earth & Thread',
    label: 'Curated Goods',
    cta: 'Explore collection',
    tag: 'Handcrafted wares and goods made for conscious living',
    about: 'We handpick every item from independent makers who cherish sustainable materials, tactile beauty, and honest craftsmanship.',
    items: `Speckled Stoneware Teapot | Hand-thrown ceramic with bamboo handle | $48
Woven Organic Linen Throw | Soft washed flax in natural oatmeal tint | $72
Hand-Dipped Beeswax Candles | Set of four clean-burning botanical tapers | $26`,
  },
  clinic: {
    name: 'Cedar Grove Wellness',
    label: 'Treatments & Care',
    cta: 'Book an appointment',
    tag: 'Gentle, attentive healthcare centered around you',
    about: 'Our practitioners take the time to hear your whole story. We provide evidence-guided treatments in a restorative, respectful sanctuary.',
    items: `Initial Comprehensive Health Visit | 60-minute intake, holistic assessment & custom care plan | $120
Acupuncture & Restorative Therapy | 45-minute balancing session in private relaxation room | $85
Family Health Check-In | Preventive screenings, pediatric care & ongoing wellness guidance | $90`,
  },
  portfolio: {
    name: 'Elena Rostova',
    label: 'Featured Projects',
    cta: 'View portfolio',
    tag: 'Architectural photography and visual storytelling',
    about: 'Capturing spaces where light, texture, and silence meet. Working across editorial assignments, monograph publications, and contemporary architecture firms worldwide.',
    items: `The Nordic Pavilion Series | Monograph feature published in Arkitektur Review | Editorial
Highland Concrete Residence | Complete exterior & interior dawn light survey | Commercial
Urban Sanctuary Exhibition | Limited edition archival pigment prints | In Gallery`,
  },
};

export const COLOR_PALETTE = [
  '#d6a486', // Warm Amber
  '#2f8f83', // Forest Mint Teal
  '#c2465a', // Crimson Rose
  '#3b6fd1', // Mediterranean Azure
  '#6b4fbb', // Iris Violet
  '#3a332a', // Deep Espresso
  '#a37c44', // Antique Ochre
  '#1b5e4b', // Botanical Pine
];

export const TEMPLATE_METADATA = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, crisp typography with rounded aesthetic and airy rhythm.',
    bg: '#ffffff',
    previewGradient: 'linear-gradient(135deg, #d98b3a, #5a3a14)',
  },
  {
    id: 'classic',
    name: 'Classic Editorial',
    description: 'Warm, timeless serif typography with soft paper background.',
    bg: '#faf6ee',
    previewGradient: 'linear-gradient(135deg, #7a5a3a, #2b2118)',
  },
  {
    id: 'bold',
    name: 'Bold Swiss',
    description: 'Striking dark canvas with high-impact uppercase display hierarchy.',
    bg: '#0d0d0f',
    previewGradient: 'linear-gradient(135deg, #222226, #09090b)',
  },
  {
    id: 'artisan',
    name: 'Warm Artisan',
    description: 'Organic earthy tones with refined borders and artisanal grace.',
    bg: '#f5f0e8',
    previewGradient: 'linear-gradient(135deg, #8c684d, #3c2a1c)',
  },
] as const;
