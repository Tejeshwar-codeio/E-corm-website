const products = [
  {
    name: "ShopSphere Vision Pro Max",
    price: 999.00,
    discountPrice: 899.00,
    images: [
      { url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80" },
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80" }
    ],
    brand: "Apple",
    category: "Electronics",
    description: "Experience absolute audio and spatial clarity. Built with a custom dynamic driver and an active noise-cancellation system, our flagship headphones bring cinematic acoustics to your workspace. Includes custom mesh earcups and an ergonomic high-flex headband.",
    countInStock: 25,
    sizes: ["One Size"],
    colors: ["Space Gray", "Silver", "Sky Blue"],
    isFeatured: true,
    isNewArrival: true,
    isTrending: true,
    rating: 4.8,
    numReviews: 124,
    tags: ["headphones", "anc", "audio", "premium"]
  },
  {
    name: "AeroSwift Pro Run Series",
    price: 180.00,
    discountPrice: 155.00,
    images: [
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80" },
      { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80" }
    ],
    brand: "Nike",
    category: "Footwear",
    description: "Designed for champions. The AeroSwift Pro combines ultralight carbon plates and reactive foam midsoles to deliver unmatched cushioning and forward momentum. Engineered knit uppers optimize breathability during endurance sprints.",
    countInStock: 50,
    sizes: ["US 8", "US 9", "US 10", "US 11"],
    colors: ["Racer Red", "Volt Green", "Triple Black"],
    isFeatured: true,
    isNewArrival: false,
    isTrending: true,
    rating: 4.6,
    numReviews: 89,
    tags: ["shoes", "running", "sports", "sneakers"]
  },
  {
    name: "ShopSphere Echo Premium Hub",
    price: 120.00,
    discountPrice: 99.00,
    images: [
      { url: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80" }
    ],
    brand: "Amazon",
    category: "Electronics",
    description: "Smart, secure, and beautiful. The Echo Premium Hub combines high-fidelity omnidirectional speakers with an intuitive tactile touch control interface. Integrates effortlessly with smart thermostats, lights, and door locks to consolidate home automation.",
    countInStock: 80,
    sizes: ["Compact", "Standard"],
    colors: ["Charcoal", "Sandstone"],
    isFeatured: false,
    isNewArrival: true,
    isTrending: false,
    rating: 4.3,
    numReviews: 54,
    tags: ["smart home", "speaker", "assistant"]
  },
  {
    name: "Ultra-Fit Performance Tech Tee",
    price: 45.00,
    discountPrice: 0,
    images: [
      { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80" }
    ],
    brand: "Nike",
    category: "Apparel",
    description: "Premium moisture-wicking fabric that contours to your training regimen. Standard fit delivers structured elegance while active flat seams eliminate chafing during long workouts.",
    countInStock: 120,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Obsidian Navy", "Heather Gray", "Matte Black"],
    isFeatured: false,
    isNewArrival: false,
    isTrending: true,
    rating: 4.5,
    numReviews: 310,
    tags: ["shirt", "apparel", "activewear"]
  },
  {
    name: "ChronoTech Premium Watch",
    price: 399.00,
    discountPrice: 349.00,
    images: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80" }
    ],
    brand: "Apple",
    category: "Accessories",
    description: "Monitor your vitals, notifications, and navigation routines on an active always-on OLED screen. Machined from high-impact titanium and coupled with a sweat-resistant magnetic loop strap.",
    countInStock: 15,
    sizes: ["41mm", "45mm"],
    colors: ["Titanium Gold", "Space Black", "Natural Metal"],
    isFeatured: true,
    isNewArrival: true,
    isTrending: true,
    rating: 4.9,
    numReviews: 215,
    tags: ["watch", "smartwatch", "wearables"]
  },
  {
    name: "Minimalist Full-Grain Leather Wallet",
    price: 65.00,
    discountPrice: 0,
    images: [
      { url: "https://images.unsplash.com/photo-1627124765135-5667c7d19c54?w=800&auto=format&fit=crop&q=80" }
    ],
    brand: "ShopSphere Original",
    category: "Accessories",
    description: "Handcrafted from top-tier full grain leather, this RFID-blocking slim sleeve securely encapsulates up to 10 cards and cash notes. Patented quick-slide thumb ejection triggers cards automatically.",
    countInStock: 100,
    sizes: ["Slim Fit"],
    colors: ["Tan Brown", "Classic Black", "Olive Drab"],
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    rating: 4.7,
    numReviews: 83,
    tags: ["wallet", "leather", "accessories"]
  }
];

export default products;
