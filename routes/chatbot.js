const express = require('express');
const router = express.Router();

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const AURAPC_API = 'https://aurapc-backend.onrender.com/api';

// Get latest model version hash
async function getModelVersion(token) {
  try {
    const response = await fetch('https://api.replicate.com/v1/models/google/gemini-2.5-flash', {
      headers: { 'Authorization': `Token ${token}` }
    });
    const data = await response.json();
    return data.latest_version?.id;
  } catch (e) {
    console.error('Error getting model version:', e.message);
    return null;
  }
}

// Fetch products from AuraPC API
async function fetchAuraPCProducts() {
  try {
    const response = await Promise.race([
      fetch(`${AURAPC_API}/products?page=1&limit=100`, {
        headers: { 'Content-Type': 'application/json' }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AuraPC timeout')), 10000)
      )
    ]);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Extract products from various response formats
    let products = [];
    
    if (data.products && Array.isArray(data.products)) {
      products = data.products;
    } else if (data.items && Array.isArray(data.items)) {
      products = data.items;
    } else if (Array.isArray(data)) {
      products = data;
    }
    
    return products.map(p => ({
      id: p.id || p._id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      image: p.image || p.thumbnail || p.images?.[0],
      category: p.category?.name || p.category || 'San pham',
      brand: p.brand,
      rating: p.rating || p.rate || 0,
      reviewCount: p.reviewCount || p.reviews || 0,
      inStock: p.inStock !== false && p.stock > 0
    }));
  } catch (e) {
    console.error('Error fetching AuraPC products:', e.message);
    return null;
  }
}

// Product catalog from AuraPC API
let auraProductsCache = null;
let auraProductsCacheTime = 0;
const CACHE_TTL = 3600000; // 1 hour

async function getAuraProducts() {
  const now = Date.now();
  if (auraProductsCache && (now - auraProductsCacheTime) < CACHE_TTL) {
    return auraProductsCache;
  }
  
  const products = await fetchAuraPCProducts();
  if (products) {
    auraProductsCache = products;
    auraProductsCacheTime = now;
    console.log(`Loaded ${products.length} AuraPC products`);
  }
  
  return products;
}

// Search products by name
async function searchProducts(query, limit = 10) {
  try {
    const response = await Promise.race([
      fetch(`${AURAPC_API}/products?search=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: { 'Content-Type': 'application/json' }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Search timeout')), 8000)
      )
    ]);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    let products = [];
    if (data.products && Array.isArray(data.products)) {
      products = data.products;
    } else if (data.items && Array.isArray(data.items)) {
      products = data.items;
    } else if (Array.isArray(data)) {
      products = data;
    }
    
    return products.slice(0, limit).map(p => ({
      id: p.id || p._id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      image: p.image || p.thumbnail || p.images?.[0],
      category: p.category?.name || p.category || 'San pham',
      brand: p.brand,
      rating: p.rating || p.rate || 0,
      reviewCount: p.reviewCount || p.reviews || 0,
      inStock: p.inStock !== false && p.stock > 0
    }));
  } catch (e) {
    console.error('Search error:', e.message);
    return [];
  }
}

// Product catalog for AI context
const SYSTEM_PROMPT_BASE = `Ban la AruBot - tro ly AI chuyen sach cua AuraPC Vietnam.

NHIEM VU:
1. Tra loi khach hang ve san pham, dich vu cua AuraPC
2. Tim va goi y san pham phu hop dua tren yeu cau cua khach
3. Huong dan mua hang, tra cuu don hang

QUY TAC:
1. Tra loi NGAN GON, THIEN TAI, DUNG CHUNG
2. Khi goi y san pham, DUNG endpoint /api/search-products de tim san pham THAT
3. Chi goi y san pham CO MAT TREN HETHONG (da duoc load tu API AuraPC)
4. Neu khong tim duoc san pham, thong bao va goi y san pham tuong tu

DANH MUC SAN PHAM (AuraPC):
- PC Gaming & Office
- CPU: Intel, AMD
- GPU: NVIDIA GeForce, AMD Radeon
- RAM: DDR4, DDR5
- SSD/HDD: NVMe, SATA
- Mainboard: Intel Z790/B760, AMD X670E/B650
- Case: Lian Li, NZXT, Fractal Design
- PSU: Corsair, Seasonic, be quiet!
- Cooling: AIO, Air Cooler
- Monitor: ASUS, LG, Samsung, Dell
- Laptop: Gaming, Office, Mac alternatives
- Phu kien: Ban phim, Chuot, Tai nghe, Webcam

VI DU TRA LOI TOT:
Hoi: "Toi can PC 20 trieu"
Tra loi: "Voi 20 trieu, minh goi y:\n[SEARCH:PC gaming 20 trieu]\n\nBan co the tham khao cac cau hinh nay, hoac cho biet them yeu cau de minh goi y chinh xac hon nhe!"

Hoi: "Tai nghe choi game nao tot"
Tra loi: "[SEARCH:Tai nghe gaming]\n\nTai nghe gaming tot hien nay:\n- HyperX Cloud III\n- SteelSeries Arctis 7+\n- Razer BlackShark V2\n\nBan muon tim them khong?"

Hoi: "Man hinh 27 inch tot"
Tra loi: "[SEARCH:Man hinh 27 inch]\n\nVoi 27 inch, goi y:\n- ASUS ProArt PA278QV (WQHD, IPS)\n- LG 27GP850-B (2K, 165Hz, NanoIPS)\n- Samsung Odyssey G7 (QLED, 240Hz)\n\nBan can loai nao - van phong hay gaming?"

## XU LY GOI Y SAN PHAM:
Khi can goi y san pham cu the, tra ve cau tra loi chua:
"[SEARCH:<tu khoa tim kiem>]"

VD: [SEARCH:RTX 4070 gaming] se tim cac san pham RTX 4070
`;

// Parse search queries from AI response
function extractSearchQueries(text) {
  const queries = [];
  const regex = /\[SEARCH:([^\]]+)\]/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    queries.push(match[1].trim());
  }
  return queries;
}

// Remove search markers from text
function cleanResponse(text) {
  return text.replace(/\[SEARCH:[^\]]+\]/gi, '').trim();
}

// Fallback responses
function generateFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('chao') || lowerMsg.includes('xin chao') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return 'Xin chao! 👋 Toi la AruBot, tro ly AI cua AuraPC. Ban can toi tu van gi hom nay? Toi co the giup ban tim san pham, tu van cau hinh PC, hoac huong dan mua hang!';
  }
  
  if (lowerMsg.includes('pc') || lowerMsg.includes('máy') || lowerMsg.includes('cấu hình') || lowerMsg.includes('may tinh')) {
    if (lowerMsg.includes('15') || lowerMsg.includes('10')) {
      return '[SEARCH:PC van phong 10 trieu]\n\nVoi 10-15 trieu, PC van phong tot:\n- Intel i3-14100, 8GB RAM, 256GB SSD\n- AMD Ryzen 5 5600G (co GPU tich hop)\n\nBan muon tim them khong?';
    } else if (lowerMsg.includes('20') || lowerMsg.includes('25')) {
      return '[SEARCH:PC gaming 20 trieu]\n\nVoi 20-25 trieu, PC gaming 1080p:\n- Intel i5-14400 + RTX 4060\n- AMD Ryzen 5 7600X + RTX 4060\n\nBan muon tu van them khong?';
    } else if (lowerMsg.includes('30') || lowerMsg.includes('35') || lowerMsg.includes('40')) {
      return '[SEARCH:PC gaming 30 trieu]\n\nVoi 30-40 trieu, PC manh:\n- Intel i7-14700K + RTX 4070 SUPER\n- AMD Ryzen 7 7800X3D + RTX 4070 Ti\n\nBan muon cau hinh nao hon?';
    }
    return '[SEARCH:PC gaming]\n\nDe tu van tot nhat, ban cho biet ngan sach va muc dich su dung nhe?';
  }
  
  if (lowerMsg.includes('cpu') || lowerMsg.includes('vi xử lý') || lowerMsg.includes('chip')) {
    return '[SEARCH:CPU Intel AMD]\n\nBan muon tu van CPU Intel hay AMD? CPU nao phu hop cho gaming, cong viec hay ca hai?';
  }
  
  if (lowerMsg.includes('gpu') || lowerMsg.includes('card') || lowerMsg.includes('đồ họa') || lowerMsg.includes('vidia') || lowerMsg.includes('rtx') || lowerMsg.includes('geforce')) {
    return '[SEARCH:GPU RTX]\n\nBan can card cho muc dich gi?\n- Gaming 1080p: RTX 4060, RTX 3060\n- Gaming 1440p: RTX 4070 SUPER, RTX 4070 Ti SUPER\n- Gaming 4K: RTX 4080 SUPER, RTX 4090';
  }
  
  if (lowerMsg.includes('ram') || lowerMsg.includes('bo nho')) {
    return '[SEARCH:RAM DDR4 DDR5]\n\nBan can bao nhieu RAM?\n- 16GB DDR4: Du cho gaming 1080p\n- 32GB DDR5: Cho content creation, gaming 4K\n\nBan thich DDR4 hay DDR5?';
  }
  
  if (lowerMsg.includes('ssd') || lowerMsg.includes('o cung')) {
    return '[SEARCH:SSD NVMe]\n\nSSD NVMe hien nay rat pho bien:\n- Samsung 990 PRO (toc do cao nhat)\n- WD Black SN850X\n- Kingston Fury Renegade\n\nBan can dung luong nao - 512GB, 1TB hay 2TB?';
  }
  
  if (lowerMsg.includes('case') || lowerMsg.includes('vỏ') || lowerMsg.includes('thùng máy')) {
    return '[SEARCH:Case PC]\n\nCase dep va pho bien:\n- Lian Li O11 Dynamic EVO (tempered glass)\n- NZXT H7 Flow (airflow tot)\n- Fractal Torrent (nhiet doi)\n\nBan thich loai nao?';
  }
  
  if (lowerMsg.includes('nguồn') || lowerMsg.includes('psu') || lowerMsg.includes('nguon')) {
    return '[SEARCH:PSU Corsair Seasonic]\n\nPSU tot:\n- Corsair RM850x (850W, Gold)\n- Seasonic Focus GX (750W, Gold)\n- be quiet! Straight Power (800W, Platinum)\n\nBan dung card nao de minh tu van cong suat phu hop?';
  }
  
  if (lowerMsg.includes('tản nhiệt') || lowerMsg.includes('cooler') || lowerMsg.includes('quạt')) {
    return '[SEARCH:CPU Cooler]\n\nTan nhiet cho CPU:\n- AIO: NZXT Kraken X73, Corsair iCUE H150i\n- Air: Noctua NH-D15, be quiet! Dark Rock Pro 4\n\nBan dung CPU nao?';
  }
  
  if (lowerMsg.includes('màn hình') || lowerMsg.includes('monitor') || lowerMsg.includes('man hinh')) {
    if (lowerMsg.includes('27')) {
      return '[SEARCH:Man hinh 27 inch]\n\nMan hinh 27 inch tot:\n- ASUS ProArt PA278QV (van phong)\n- LG 27GP850-B (gaming 165Hz)\n- Samsung Odyssey G7 (gaming 240Hz)';
    } else if (lowerMsg.includes('32')) {
      return '[SEARCH:Man hinh 32 inch]\n\nMan hinh 32 inch tot:\n- Samsung Odyssey G7 32 (QLED, 240Hz)\n- ASUS ROG Swift PG329Q (IPS, 175Hz)\n- Dell U3223QE (4K, USB-C)';
    }
    return '[SEARCH:Man hinh gaming]\n\nBan can man hinh cho van phong hay gaming? Kich thuoc bao nhieu inch?';
  }
  
  if (lowerMsg.includes('laptop')) {
    if (lowerMsg.includes('gaming')) {
      return '[SEARCH:Laptop gaming]\n\nLaptop gaming tot:\n- ASUS ROG Zephyrus G16\n- MSI Raider GE78\n- Lenovo Legion Pro 7\n- Dell Alienware x16\n\nBan co ngan sach nao?';
    } else if (lowerMsg.includes('van phong') || lowerMsg.includes('office') || lowerMsg.includes('sinh vien')) {
      return '[SEARCH:Laptop van phong]\n\nLaptop van phong tot:\n- ASUS ZenBook 14 OLED (nhe, dep)\n- Dell XPS 13\n- Lenovo Yoga Slim 7\n- HP Pavilion 15\n\nBan thich loai nao?';
    }
    return '[SEARCH:Laptop]\n\nBan can laptop cho muc dich gi? Gaming, van phong, hay do hoa?';
  }
  
  if (lowerMsg.includes('tai nghe') || lowerMsg.includes('headphone') || lowerMsg.includes('tai nghe')) {
    return '[SEARCH:Tai nghe gaming]\n\nTai nghe gaming tot:\n- HyperX Cloud III\n- SteelSeries Arctis 7+\n- Razer BlackShark V2 Pro\n- Corsair Virtuoso RGB\n\nBan thich over-ear hay in-ear?';
  }
  
  if (lowerMsg.includes('chuot') || lowerMsg.includes('mouse')) {
    return '[SEARCH:Chuot gaming]\n\nChuot gaming tot:\n- Logitech G502 HERO\n- Razer DeathAdder V3\n- Corsair Harpoon RGB\n- SteelSeries Rival 3\n\nBan thich chuot day hay khong day?';
  }
  
  if (lowerMsg.includes('ban phim') || lowerMsg.includes('keyboard')) {
    return '[SEARCH:Ban phim gaming]\n\nBan phim gaming tot:\n- Keychron K2 (wireless, hot-swap)\n- Corsair K70 RGB\n- Razer Huntsman V3\n- Logitech G Pro X\n\nBan thich switch nao - Red, Blue hay Brown?';
  }
  
  if (lowerMsg.includes('gia') || lowerMsg.includes('price') || lowerMsg.includes('bao nhieu') || lowerMsg.includes('giá')) {
    return '[SEARCH:san pham]\n\nGia san pham thay doi lien tuc. Ban kiem tra tren app AuraPC de biet gia chinh xac nhat nhe!\n\nHoac ban cho biet san pham cu the, minh se tim gia cho ban ngay!';
  }
  
  if (lowerMsg.includes('mua') && (lowerMsg.includes('cach') || lowerMsg.includes('huong dan') || lowerMsg.includes('lam sao'))) {
    return 'De mua hang tren AuraPC:\n\n1️⃣ Chon san pham ban muon\n2️⃣ Nhan nut "Them vao gio hang"\n3️⃣ Ra gio hang, kiem tra san pham\n4️⃣ Chon dia chi giao hang\n5️⃣ Chon phuong thuc thanh toan\n6️⃣ Nhan "Dat hang"\n\nBan co the thanh toan qua:\n- ATM / Internet Banking\n- MoMo / ZaloPay\n- The tin dung (COD)\n\nCan gi them khong?';
  }
  
  if (lowerMsg.includes('theo doi') || lowerMsg.includes('don hang') || lowerMsg.includes('tracking')) {
    return 'De theo doi don hang:\n\n1️⃣ Vao trang "Don hang cua toi" (o Profile)\n2️⃣ Chon don hang ban muon xem\n3️⃣ Ban se thay trang thai: \n   - Cho xac nhan\n   - Dang chuan bi\n   - Dang giao\n   - Da giao\n\nNeu co van de, ban co the lien he ho tro qua:\n- Hotline: 1900 xxxx\n- Zalo: AuraPC Official';
  }
  
  if (lowerMsg.includes('doi') || lowerMsg.includes('tra') || lowerMsg.includes('bao hanh')) {
    return 'Chinh sach doi tra / bao hanh AuraPC:\n\n🔄 DOI TRA: 7 ngay dau tien (neu san pham loi tu nha san xuat)\n\n🛡️ BAO HANH:\n- CPU: 36 thang\n- GPU: 36 thang\n- Mainboard: 36 thang\n- RAM: Lifetime\n- SSD: 5 nam\n- Case: 12-24 thang\n- PSU: 5-10 nam\n\nBan co van de gi can ho tro?';
  }
  
  return 'Cam on ban da hoi! Toi chua hieu ro yeu cau cua ban.\n\nBan co the hoi ve:\n- San pham cu the (CPU, GPU, RAM...)\n- Cau hinh PC theo ngan sach\n- Huong dan mua hang\n- Theo doi don hang\n- Chinh sach doi tra / bao hanh\n\nBan muon hoi gi?';
}

// Chat endpoint
router.post('/chat', async (req, res) => {
  req.setTimeout(60000);
  
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    // Generate response (fallback first)
    let reply = generateFallbackResponse(message);
    let searchResults = [];
    
    // Extract and process search queries
    const searchQueries = extractSearchQueries(reply);
    
    // Clean reply
    reply = cleanResponse(reply);
    
    // Search for products
    for (const query of searchQueries) {
      const results = await searchProducts(query, 5);
      if (results.length > 0) {
        searchResults = searchResults.concat(results);
      }
    }
    
    // Remove duplicates
    const uniqueProducts = [];
    const seenIds = new Set();
    for (const p of searchResults) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        uniqueProducts.push(p);
      }
    }
    
    return res.json({
      success: true,
      reply,
      products: uniqueProducts.slice(0, 10),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Search products endpoint
router.get('/search-products', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query required' });
    }
    
    const products = await searchProducts(q, parseInt(limit));
    
    return res.json({
      success: true,
      query: q,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search error' });
  }
});

// Get all products (cached)
router.get('/products', async (req, res) => {
  try {
    const products = await getAuraProducts();
    
    return res.json({
      success: true,
      products: products || [],
      count: products?.length || 0
    });
  } catch (error) {
    console.error('Products error:', error);
    return res.status(500).json({ error: 'Products error' });
  }
});

// Get categories from AuraPC
router.get('/categories', async (req, res) => {
  try {
    const response = await Promise.race([
      fetch(`${AURAPC_API}/categories`),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      )
    ]);
    
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    
    return res.json({
      success: true,
      categories: data
    });
  } catch (error) {
    console.error('Categories error:', error);
    return res.status(500).json({ error: 'Categories error' });
  }
});

module.exports = router;
