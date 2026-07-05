const express = require('express');
const router = express.Router();

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

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

// Product catalog - concise version
const PRODUCT_CATALOG = `
CPU: Intel i3-14100, i5-14400/14600K, i7-14700K, i9-14900K | AMD Ryzen 5 5600X/7600X, Ryzen 7 7700X/7800X3D, Ryzen 9 7900X/7950X
GPU: NVIDIA RTX 3050, 3060, 4060, 4070/4070S, 4080S, 4090 | AMD RX 6600, 6700, 6800, 6900, 7800XT, 7900XT/XTX
RAM: DDR4 16-32GB (Kingston/Corsair/G.Skill 3200-3600MHz) | DDR5 32-64GB (Kingston/Corsair/G.Skill 5600-6000MHz)
SSD: Samsung 990 PRO, 980 PRO, 870 EVO | WD Black SN850X | Kingston Fury | Crucial P5 Plus
Mainboard: Intel Z790/B760, B660 | AMD X670E/B650, X570/B550
PSU: Corsair RM650/750/850/1000x | Seasonic Focus/PRIME | be quiet! | MSI MAG | 550-1000W, 80+ Bronze/Gold/Platinum
Case: Lian Li O11, Lancool II | NZXT H7/H9 | Fractal Torrent/Pop | be quiet! Pure Base | Corsair 4000D/5000D
Cooling: AIO 240/280/360mm (NZXT Kraken, Corsair iCUE, ASUS ROG) | Air: Noctua NH-D15/U12A, be quiet! Dark Rock
Monitor: 24-34", 1080p-4K, 60-240Hz | ASUS ROG/TUF, LG UltraGear, Samsung Odyssey, Dell Alienware
Laptop: Gaming (ASUS ROG, MSI Raider, Lenovo Legion) | Office (ASUS ZenBook, Dell XPS, Lenovo Yoga) | Mac alternatives
`;

// Compact system prompt
const SYSTEM_PROMPT = `Ban la AruBot - tro ly AI chuyen ve PC va linh kien tai AuraPC Vietnam.

QUY TAC:
1. Tra loi NGAN GON (toi da 1-2 cau)
2. Chi neu ten san pham CU THE khi go y
3. Neu hoi gia -> "Gia thay doi, kiem tra tren app AuraPC"
4. Neu hoi cau hinh -> hoi ngan sach truoc

CATALOG:
${PRODUCT_CATALOG}

VI DU:
Hoi: "PC 20 trieu"
Tra loi: "Voi 20 trieu, toi go y:\n• CPU: i5-14400\n• GPU: RTX 4060\n• RAM: 16GB DDR4\n\nBan muon tim hieu them khong?"

Hoi: "Tan nhiet i9"
Tra loi: "Cho i9, ban nen dung NZXT Kraken X73 360mm hoac Noctua NH-D15. Ban thich AIO hay air cooler?"

Hoi: "RTX 4070 gia bao nhieu"
Tra loi: "Gia thay doi lien tuc, ban kiem tra tren app AuraPC de biet gia chinh xac nhat nhe!"
`;

// Parse products from AI response
function parseProductsFromResponse(text) {
  const products = [];
  
  const patterns = [
    /RTX\s*40[3-9]0(\s*Ti|\s*S)?/gi,
    /GTX\s*16[5-6]0/gi,
    /RX\s*[67][0-9]{3}(\s*XT)?/gi,
    /Ryzen\s*[579]\s*\d{4}[X]?/gi,
    /Core\s*i[3579][-_]?\d{4}[K]?/gi,
    /Samsung\s*(990\s*PRO|980\s*PRO|870\s*EVO)/gi,
    /Kingston\s*Fury/gi,
    /NZXT\s*Kraken/gi,
    /Noctua\s*NH-[DUL]/gi,
    /Corsair\s*(RM\d{3,4}|iCUE)/gi,
  ];
  
  const categories = {
    'RTX': 'GPU', 'GTX': 'GPU', 'RX': 'GPU',
    'Ryzen': 'CPU', 'Core': 'CPU',
    'Samsung': 'SSD', 'Kingston': 'RAM',
    'NZXT': 'Cooling', 'Noctua': 'Cooling', 'Corsair': 'PSU'
  };
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[0].trim();
      if (name.length > 3) {
        let category = 'SAN PHAM';
        for (const [key, val] of Object.entries(categories)) {
          if (name.includes(key)) { category = val; break; }
        }
        if (!products.some(p => p.name.includes(name.split(' ')[0]))) {
          products.push({ name, category, image: null });
        }
      }
    }
  }
  
  return products.slice(0, 4);
}

// Fallback response generator - always works
function generateFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('chao') || lowerMsg.includes('xin chao') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return 'Xin chao! 👋 Toi la AruBot, tro ly AI cua AuraPC. Ban can toi tu van gi hom nay?';
  }
  
  if (lowerMsg.includes('pc') || lowerMsg.includes('máy') || lowerMsg.includes('cấu hình')) {
    if (lowerMsg.includes('15') || lowerMsg.includes('10')) {
      return 'Voi 10-15 trieu, PC van phong:\n• CPU: Intel i3-14100\n• RAM: 8GB DDR4\n• SSD: 256GB NVMe\n\nBan muon them khong?';
    } else if (lowerMsg.includes('20') || lowerMsg.includes('25')) {
      return 'Voi 20-25 trieu, PC gaming 1080p:\n• CPU: Intel i5-14400\n• GPU: RTX 4060\n• RAM: 16GB DDR4\n\nBan muon cau hinh nao?';
    } else if (lowerMsg.includes('30') || lowerMsg.includes('35') || lowerMsg.includes('40')) {
      return 'Voi 30-40 trieu, PC manh:\n• CPU: Intel i7-14700K\n• GPU: RTX 4070 SUPER\n• RAM: 32GB DDR5\n\nCo muon tu van them khong?';
    }
    return 'De tu van tot nhat, ban cho biet ngan sach bao nhieu?';
  }
  
  if (lowerMsg.includes('cpu') || lowerMsg.includes('vi xử lý')) {
    if (lowerMsg.includes('intel') || lowerMsg.includes('i9') || lowerMsg.includes('i7')) {
      return 'Intel Core i7-14700K la lua chon tot cho gaming cao cap. Ban co the tham khao them i5-14600K neu it hon.';
    } else if (lowerMsg.includes('amd') || lowerMsg.includes('ryzen')) {
      return 'AMD Ryzen 7 7800X3D la CPU gaming tot nhat. Neu cong viec, Ryzen 5 7600X cung du manh.';
    }
    return 'Ban muon tu van CPU Intel hay AMD?';
  }
  
  if (lowerMsg.includes('gpu') || lowerMsg.includes('card') || lowerMsg.includes('đồ họa')) {
    if (lowerMsg.includes('4090')) {
      return 'RTX 4090 la card manh nhat, tuyet voi cho 4K gaming. Gia rat cao, neu 1440p thi RTX 4070 SUPER du di.';
    } else if (lowerMsg.includes('4080')) {
      return 'RTX 4080 SUPER la lua chon tot cho 4K gaming. Neu 1440p, RTX 4070 Ti SUPER tiet kiem hon.';
    } else if (lowerMsg.includes('4060')) {
      return 'RTX 4060 la card gaming 1080p tot voi gia pho thong. Neu nhieu hon, RTX 4070 SUPER cho 1440p.';
    }
    return 'Ban can card cho muc dich gi va ngan sach bao nhieu?';
  }
  
  if (lowerMsg.includes('ram')) {
    if (lowerMsg.includes('ddr5')) {
      return 'DDR5 la lua chon cho build moi. Kingston Fury Beast DDR5 32GB (2x16GB) 6000MHz la lua chon tot.';
    } else if (lowerMsg.includes('ddr4')) {
      return 'DDR4 van tot cho build budget. Kingston Fury Beast DDR4 16GB (2x8GB) 3200MHz la du cho nhieu viec.';
    }
    return 'Ban can bao nhieu RAM? 16GB du, 32GB cho content creation.';
  }
  
  if (lowerMsg.includes('ssd')) {
    return 'Samsung 990 PRO 1TB NVMe la mot trong nhung SSD nhanh nhat. Neu can nhieu hon, phiên ban 2TB.';
  }
  
  if (lowerMsg.includes('case') || lowerMsg.includes('vỏ')) {
    return 'Lian Li O11 Dynamic EVO la case dep voi tempered glass. Neu can airflow tot, NZXT H7 Flow cung tot.';
  }
  
  if (lowerMsg.includes('nguồn') || lowerMsg.includes('psu')) {
    return 'Corsair RM850x la nguon 850W tot voi chat luong cao. Neu RTX 4090/4080, can 850W-1000W.';
  }
  
  if (lowerMsg.includes('tản nhiệt') || lowerMsg.includes('cooler')) {
    return 'Cho i9-14900K, NZXT Kraken X73 RGB 360mm la AIO tot nhat, hoac Noctua NH-D15 neu thich air cooler.';
  }
  
  if (lowerMsg.includes('màn hình') || lowerMsg.includes('monitor')) {
    return '1080p/144Hz: ASUS TUF VG249Q | 1440p/165Hz: LG 27GP850-B | 4K: ASUS ROG PG32UQX. Ban can loai nao?';
  }
  
  if (lowerMsg.includes('laptop')) {
    if (lowerMsg.includes('gaming')) {
      return 'Laptop gaming tot: ASUS ROG Zephyrus G16, MSI Raider GE78, Lenovo Legion Pro 7. Ban co ngan sach nao?';
    } else if (lowerMsg.includes('van phòng') || lowerMsg.includes('office')) {
      return 'Laptop van phong tot: ASUS ZenBook 14 OLED (nhe, dep), Dell XPS 13 Plus, Lenovo Yoga Slim 7. Ban thich loai nao?';
    }
    return 'Ban can laptop cho muc dich gi?';
  }
  
  if (lowerMsg.includes('gia') || lowerMsg.includes('price') || lowerMsg.includes('bao nhieu')) {
    return 'Gia san pham thay doi lien tuc. Ban kiem tra tren app AuraPC de biet gia chinh xac nhat nhe!';
  }
  
  return 'Toi chua hieu ro. Ban co the hoi ve CPU, GPU, RAM, SSD, Case, PSU, Man hinh, Laptop... Hoac cho biet ngan sach de toi go y?';
}

// Chat endpoint
router.post('/chat', async (req, res) => {
  // Set timeout to 60 seconds
  req.setTimeout(60000);
  
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    // Always use fallback first for fast response
    let reply = generateFallbackResponse(message);
    let products = parseProductsFromResponse(reply);
    
    // Try AI if token exists (async, non-blocking)
    if (apiToken) {
      try {
        const aiResponse = await callAI(apiToken, message, history);
        if (aiResponse && aiResponse.length > reply.length) {
          reply = aiResponse;
          products = parseProductsFromResponse(reply);
        }
      } catch (e) {
        console.error('AI error, using fallback:', e.message);
      }
    }
    
    return res.json({
      success: true,
      reply,
      products: products,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Call AI - separate function with timeout
async function callAI(apiToken, message, history) {
  try {
    // Get model version
    const versionId = await getModelVersion(apiToken);
    if (!versionId) {
      console.log('No model version, using fallback');
      return null;
    }

    // Build conversation context
    let conversationText = '';
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      conversationText += `${role}: ${msg.content}\n`;
    }
    conversationText += `User: ${message}\nAssistant:`;

    // Create prediction
    const createResponse = await Promise.race([
      fetch(REPLICATE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: versionId,
          input: {
            prompt: `${SYSTEM_PROMPT}\n\n${conversationText}`,
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9
          }
        })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI timeout')), 30000)
      )
    ]);

    if (!createResponse.ok) {
      console.log('AI API error:', createResponse.status);
      return null;
    }

    const prediction = await createResponse.json();
    const predictionId = prediction.id;

    // Poll for completion with timeout
    let reply = null;
    const maxAttempts = 30;
    const pollInterval = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, pollInterval));

      const statusResponse = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: { 'Authorization': `Token ${apiToken}` }
      });

      if (!statusResponse.ok) continue;

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'succeeded') {
        reply = statusData.output?.[0] || statusData.output || null;
        if (Array.isArray(reply)) reply = reply.join('');
        break;
      } else if (statusData.status === 'failed') {
        console.log('AI prediction failed');
        break;
      }
    }

    return reply;
  } catch (e) {
    console.error('callAI error:', e.message);
    return null;
  }
}

// Get product catalog
router.get('/catalog', (req, res) => {
  res.json({
    success: true,
    catalog: PRODUCT_CATALOG.trim()
  });
});

module.exports = router;
