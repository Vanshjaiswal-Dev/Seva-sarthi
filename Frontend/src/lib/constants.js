// src/lib/constants.js
// Maps UI categories → actual DB categories for strong filtering

export const heroCategories = [
  {
    id: 'salon-spa',
    title: "Women's Salon & Spa",
    icon: "face",
    modal: [
      {
        subtitle: null,
        items: [
          { name: "Salon for Women", icon: "face", dbCategory: "Professional Cleaning", keywords: ["salon", "women", "hair", "facial", "waxing", "beauty", "makeup", "bridal"] },
          { name: "Spa for Women", icon: "spa", dbCategory: "Professional Cleaning", keywords: ["spa", "women", "massage", "relax", "therapy", "body"] },
        ]
      }
    ]
  },
  {
    id: 'massage-men',
    title: "Massage for Men",
    icon: "self_improvement",
    modal: [
      {
        subtitle: null,
        items: [
          { name: "Massage for Men", icon: "self_improvement", dbCategory: "Home Maintenance", keywords: ["massage", "men", "relax", "body", "therapy"] },
        ]
      }
    ]
  },
  {
    id: 'cleaning',
    title: "Cleaning",
    icon: "cleaning_services",
    modal: [
      {
        subtitle: null,
        items: [
          { name: "Bathroom & Kitchen Cleaning", icon: "countertops", dbCategory: "Professional Cleaning", keywords: ["bathroom", "kitchen", "cleaning", "deep", "scrub", "toilet"] },
          { name: "Sofa & Carpet Cleaning", icon: "weekend", dbCategory: "Professional Cleaning", keywords: ["sofa", "carpet", "cleaning", "upholstery", "fabric", "steam"] },
          { name: "Full Home Cleaning", icon: "home", dbCategory: "Professional Cleaning", keywords: ["home", "full", "cleaning", "deep", "complete"] },
        ]
      }
    ]
  },
  {
    id: 'appliance',
    title: "AC & Appliance Repair",
    icon: "ac_unit",
    modal: [
      {
        subtitle: "Large appliances",
        items: [
          { name: "AC", icon: "ac_unit", dbCategory: "Appliance Repair", keywords: ["ac", "air conditioner", "air conditioning", "cooling", "split", "window ac"] },
          { name: "Washing Machine", icon: "local_laundry_service", dbCategory: "Appliance Repair", keywords: ["washing", "machine", "washer", "laundry"] },
          { name: "Refrigerator Repair", icon: "kitchen", dbCategory: "Appliance Repair", keywords: ["fridge", "refrigerator", "cooling", "freezer"] },
        ]
      },
      {
        subtitle: "Other appliances",
        items: [
          { name: "Microwave", icon: "microwave", dbCategory: "Appliance Repair", keywords: ["microwave", "oven"] },
          { name: "RO/Water Purifier", icon: "water_drop", dbCategory: "Appliance Repair", keywords: ["ro", "water", "purifier", "filter"] },
          { name: "Geyser", icon: "hot_tub", dbCategory: "Appliance Repair", keywords: ["geyser", "water heater", "heater"] },
        ]
      }
    ]
  },
  {
    id: 'repairs',
    title: "Electrician, Plumber & Carpenter",
    icon: "construction",
    modal: [
      {
        subtitle: "Home repairs",
        items: [
          { name: "Electrician", icon: "electrical_services", dbCategory: "Electrical Works", keywords: ["electrician", "wire", "switch", "fan", "light", "electrical", "wiring", "mcb"] },
          { name: "Plumber", icon: "plumbing", dbCategory: "Plumbing", keywords: ["plumber", "pipe", "leak", "tap", "sink", "water", "plumbing", "drain"] },
          { name: "Carpenter", icon: "carpenter", dbCategory: "Carpentry", keywords: ["carpenter", "wood", "furniture", "door", "cabinet", "carpentry"] },
        ]
      },
      {
        subtitle: "Home installation",
        items: [
          { name: "Furniture Assembly", icon: "table_restaurant", dbCategory: "Carpentry", keywords: ["furniture", "assembly", "install", "setup", "table", "bed"] },
          { name: "Painting", icon: "format_paint", dbCategory: "Painting", keywords: ["paint", "painting", "wall", "color", "whitewash", "distemper"] },
        ]
      }
    ]
  },
];

// Extra categories shown only in "All services" modal
export const extraCategories = [
  {
    id: 'pest-control',
    title: "Pest Control",
    icon: "pest_control",
    modal: [
      {
        subtitle: null,
        items: [
          { name: "Cockroach Control", icon: "pest_control", dbCategory: "Pest Control", keywords: ["cockroach", "pest", "bug", "insect", "spray"] },
          { name: "Termite Control", icon: "bug_report", dbCategory: "Pest Control", keywords: ["termite", "pest", "wood", "anti-termite"] },
          { name: "General Pest Control", icon: "pest_control", dbCategory: "Pest Control", keywords: ["pest", "control", "bug", "insect", "mosquito"] },
        ]
      }
    ]
  },
  {
    id: 'painting',
    title: "Painting",
    icon: "format_paint",
    modal: [
      {
        subtitle: null,
        items: [
          { name: "Full Home Painting", icon: "format_paint", dbCategory: "Painting", keywords: ["paint", "home", "wall", "full", "room"] },
          { name: "Waterproofing", icon: "water_damage", dbCategory: "Painting", keywords: ["waterproof", "seepage", "leak", "wall", "terrace"] },
        ]
      }
    ]
  },
  {
    id: 'gardening',
    title: "Gardening & Landscaping",
    icon: "yard",
    modal: [
      {
        subtitle: null,
        items: [
          { name: "Garden Maintenance", icon: "yard", dbCategory: "Gardening & Landscaping", keywords: ["garden", "plant", "lawn", "grass", "landscaping", "trim"] },
        ]
      }
    ]
  },
  {
    id: 'home-maintenance',
    title: "Home Maintenance",
    icon: "home_repair_service",
    modal: [
      {
        subtitle: null,
        items: [
          { name: "General Maintenance", icon: "home_repair_service", dbCategory: "Home Maintenance", keywords: ["home", "maintenance", "repair", "handyman", "general"] },
        ]
      }
    ]
  },
];

// Combined list for "All services" modal
export const allCategories = [...heroCategories, ...extraCategories];

// Helper: get all flat items from a category
export function getCategoryItems(cat) {
  const items = [];
  cat.modal.forEach(section => {
    section.items.forEach(item => items.push(item));
  });
  return items;
}

// Kept for backward compat with ToolRentalPage
export const toolCategoriesMap = [
  {
    title: "Power Tools",
    items: [
      { name: "Drills & Drivers", icon: "construction", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=200&auto=format&fit=crop" },
      { name: "Saws & Grinders", icon: "carpenter", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=200&auto=format&fit=crop" }
    ]
  },
  {
    title: "Hand Tools",
    items: [
      { name: "Wrenches & Pliers", icon: "build", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?q=80&w=200&auto=format&fit=crop" },
      { name: "Hammers & Mallets", icon: "hardware", image: "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?q=80&w=200&auto=format&fit=crop" }
    ]
  },
  {
    title: "Construction & Outdoor",
    items: [
      { name: "Ladders", icon: "stairs", image: "https://images.unsplash.com/photo-1416879598555-fa7dc51375d8?q=80&w=200&auto=format&fit=crop" },
      { name: "Gardening Tools", icon: "yard", image: "https://images.unsplash.com/photo-1416879598555-fa7dc51375d8?q=80&w=200&auto=format&fit=crop" }
    ]
  }
];

// ─────────────────────────────────────────────────────────
// NEW MOCK DATA FOR HOMEPAGE REDESIGN (Urban Company Style)
// ─────────────────────────────────────────────────────────

export const mostBookedServices = [
  { id: 1, title: "Intense Cleaning (2 Bathrooms)", rating: "4.8", reviews: "12K", price: "₹899", originalPrice: "₹1299", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=500&auto=format&fit=crop", category: "Cleaning" },
  { id: 2, title: "AC Service & Repair (Split/Window)", rating: "4.7", reviews: "25K", price: "₹499", originalPrice: "₹699", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=500&auto=format&fit=crop", category: "Appliance Repair" },
  { id: 3, title: "Classic Salon Package for Women", rating: "4.9", reviews: "30K", price: "₹1,249", originalPrice: "₹1899", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=500&auto=format&fit=crop", category: "Salon" },
  { id: 4, title: "Deep Tissue Massage for Men", rating: "4.8", reviews: "10K", price: "₹999", originalPrice: "₹1499", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=500&auto=format&fit=crop", category: "Massage" },
  { id: 5, title: "Sofa Deep Cleaning (3 Seater)", rating: "4.6", reviews: "8K", price: "₹749", originalPrice: "₹999", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=500&auto=format&fit=crop", category: "Cleaning" },
  { id: 6, title: "Plumbing Minor Repairs", rating: "4.7", reviews: "18K", price: "₹199", originalPrice: "₹299", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=500&auto=format&fit=crop", category: "Plumbing" },
];

export const categoryShowcases = [
  {
    id: "salon",
    title: "Salon for Women",
    subtitle: "Premium beauty services at home",
    items: [
      { id: 101, title: "Waxing & Threading", price: "₹499", image: "https://images.unsplash.com/photo-1540555627-84a1e9447bd1?q=80&w=400&auto=format&fit=crop" },
      { id: 102, title: "Facial & Cleanup", price: "₹899", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop" },
      { id: 103, title: "Manicure & Pedicure", price: "₹699", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=400&auto=format&fit=crop" },
      { id: 104, title: "Haircut & Styling", price: "₹599", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&auto=format&fit=crop" },
    ]
  },
  {
    id: "cleaning",
    title: "Cleaning & Pest Control",
    subtitle: "Make your home shine like new",
    items: [
      { id: 201, title: "Full Home Deep Cleaning", price: "₹2,499", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop" },
      { id: 202, title: "Bathroom Cleaning", price: "₹499", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop" },
      { id: 203, title: "Sofa Cleaning", price: "₹749", image: "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=400&auto=format&fit=crop" },
      { id: 204, title: "General Pest Control", price: "₹899", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=400&auto=format&fit=crop" },
    ]
  },
  {
    id: "appliance",
    title: "Appliance Repair & Service",
    subtitle: "Expert technicians at your doorstep",
    items: [
      { id: 301, title: "AC Service & Repair", price: "₹499", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop" },
      { id: 302, title: "Washing Machine Repair", price: "₹349", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop" },
      { id: 303, title: "Refrigerator Repair", price: "₹299", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop" },
      { id: 304, title: "Water Purifier Service", price: "₹249", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=400&auto=format&fit=crop" },
    ]
  }
];

export const newAndNoteworthy = [
  { id: 1, title: "Native Water Purifier", badge: "NEW LAUNCH", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop", color: "bg-teal-900", textColor: "text-white" },
  { id: 2, title: "Smart Locks Installation", badge: "POPULAR", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop", color: "bg-slate-900", textColor: "text-white" },
  { id: 3, title: "Festive Home Painting", badge: "OFFER", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop", color: "bg-rose-900", textColor: "text-white" },
];
