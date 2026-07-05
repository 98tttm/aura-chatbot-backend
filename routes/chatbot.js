const express = require('express');
const router = express.Router();

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

// Get latest model version hash
async function getModelVersion(token) {
  const response = await fetch('https://api.replicate.com/v1/models/google/gemini-2.5-flash', {
    headers: { 'Authorization': `Token ${token}` }
  });
  const data = await response.json();
  return data.latest_version?.id;
}

// Full Product Catalog for AuraPC
const PRODUCT_CATALOG = `
AURAPC VIETNAM - FULL PRODUCT CATALOG

═══════════════════════════════════════════════════════════════
CPU - BO VI XU LY
═══════════════════════════════════════════════════════════════
INTEL CORE:
- Intel Core i9-14900K: 24 cores, 32 threads, Boost 6.0GHz - Cao cap
- Intel Core i7-14700K: 20 cores, 28 threads, Boost 5.6GHz - Gaming cao cap
- Intel Core i5-14600K: 14 cores, 20 threads, Boost 5.3GHz - Gaming trung cao
- Intel Core i5-14400: 10 cores, 16 threads - Gaming trung cap
- Intel Core i3-14100: 4 cores, 8 threads - Van phong

AMD RYZEN:
- AMD Ryzen 9 7950X: 16 cores, 32 threads - Cao cap chuyen nghiep
- AMD Ryzen 9 7900X: 12 cores, 24 threads - Content creation
- AMD Ryzen 7 7800X3D: 8 cores, 16 threads, 3D V-Cache - Gaming tot nhat
- AMD Ryzen 7 7700X: 8 cores, 16 threads - Gaming cao cap
- AMD Ryzen 5 7600X: 6 cores, 12 threads - Gaming trung cao
- AMD Ryzen 5 5600X: 6 cores, 12 threads - Gaming pho thong

═══════════════════════════════════════════════════════════════
GPU - CARD DO HOA
═══════════════════════════════════════════════════════════════
NVIDIA GEFORCE RTX:
- RTX 4090: 24GB GDDR6X - Phan khuc cao cap nhat, 4K gaming
- RTX 4080 SUPER: 16GB GDDR6X - 4K gaming, AI work
- RTX 4070 Ti SUPER: 16GB GDDR6X - 4K/1440p gaming
- RTX 4070 SUPER: 12GB GDDR6X - 1440p gaming
- RTX 4070: 12GB GDDR6X - 1440p gaming
- RTX 4060 Ti: 8GB GDDR6 - 1080p/1440p gaming
- RTX 4060: 8GB GDDR6 - 1080p gaming

NVIDIA GEFORCE GTX:
- GTX 1660 SUPER: 6GB GDDR6 - 1080p gaming pho thong

AMD RADEON:
- AMD RX 7900 XTX: 24GB GDDR6 - 4K gaming
- AMD RX 7900 XT: 20GB GDDR6 - 4K gaming
- AMD RX 7800 XT: 16GB GDDR6 - 1440p gaming
- AMD RX 7700 XT: 12GB GDDR6 - 1440p gaming
- AMD RX 7600: 8GB GDDR6 - 1080p gaming
- AMD RX 6950 XT: 16GB GDDR6 - 4K gaming

═══════════════════════════════════════════════════════════════
RAM - BO NHO
═══════════════════════════════════════════════════════════════
DDR5:
- Kingston Fury Beast DDR5 32GB (2x16GB) 6000MHz
- Kingston Fury Renegade DDR5 64GB (2x32GB) 6000MHz
- Corsair Vengeance DDR5 32GB (2x16GB) 5600MHz
- Corsair Dominator Platinum DDR5 64GB (2x32GB) 6000MHz
- G.Skill Trident Z5 DDR5 32GB (2x16GB) 6400MHz
- G.Skill Trident Z5 RGB DDR5 64GB (2x32GB) 6000MHz
- TeamGroup T-Force Delta DDR5 32GB (2x16GB) 6000MHz

DDR4:
- Kingston Fury Beast DDR4 16GB (2x8GB) 3200MHz
- Kingston Fury Beast DDR4 32GB (2x16GB) 3200MHz
- Corsair Vengeance DDR4 16GB (2x8GB) 3200MHz
- Corsair Vengeance LPX DDR4 32GB (2x16GB) 3600MHz
- G.Skill Ripjaws V DDR4 16GB (2x8GB) 3600MHz

═══════════════════════════════════════════════════════════════
STORAGE - O CUNG
═══════════════════════════════════════════════════════════════
SSD NVMe M.2:
- Samsung 990 PRO 1TB NVMe PCIe 4.0
- Samsung 990 PRO 2TB NVMe PCIe 4.0
- Samsung 980 PRO 1TB NVMe PCIe 4.0
- WD Black SN850X 1TB NVMe PCIe 4.0
- WD Black SN850X 2TB NVMe PCIe 4.0
- Kingston Fury Renegade 1TB NVMe PCIe 4.0
- Kingston Fury Renegade 2TB NVMe PCIe 4.0
- Crucial P5 Plus 1TB NVMe PCIe 4.0
- Corsair MP600 Pro 2TB NVMe PCIe 4.0

SSD SATA:
- Samsung 870 EVO 500GB SATA
- Samsung 870 EVO 1TB SATA
- Kingston UV500 480GB SATA
- Crucial MX500 1TB SATA

HDD:
- Seagate Barracuda 1TB SATA 7200RPM
- Seagate Barracuda 2TB SATA 7200RPM
- WD Blue 1TB SATA 7200RPM
- WD Blue 4TB SATA 5400RPM
- WD Black 4TB SATA 7200RPM

═══════════════════════════════════════════════════════════════
MAINBOARD - BO MACH CHU
═══════════════════════════════════════════════════════════════
INTEL SOCKET 1700 (13th/14th Gen):
- ASUS ROG Maximus Z790 Hero - Cao cap
- ASUS ROG Strix Z790-E Gaming WiFi - Gaming cao cap
- MSI MEG Z790 ACE - Cao cap
- MSI MPG Z790 Edge WiFi - Gaming trung cao
- Gigabyte Z790 AORUS Master - Cao cap
- Gigabyte Z790 AORUS Elite AX - Gaming trung cao
- ASRock Z790 Taichi - Cao cap
- ASRock Z790 PG Riptide - Gaming pho thong

INTEL SOCKET 1700 (12th Gen):
- ASUS ROG Strix B660-F Gaming WiFi
- MSI MAG B660 Tomahawk WiFi
- Gigabyte B660M AORUS Pro
- ASRock B660M Steel Legend

AMD SOCKET AM5 (Ryzen 7000):
- ASUS ROG Crosshair X670E Hero - Cao cap
- ASUS ROG Strix X670E-E Gaming WiFi
- MSI MEG X670E ACE - Cao cap
- MSI MPG X670E Carbon WiFi
- Gigabyte X670E AORUS Master
- Gigabyte B650M AORUS Elite AX

AMD SOCKET AM4 (Ryzen 5000):
- ASUS ROG Strix B550-F Gaming WiFi
- ASUS TUF Gaming B550-Plus WiFi
- MSI MAG B550 Tomahawk WiFi
- Gigabyte B550M AORUS Elite
- ASRock B550 Steel Legend

═══════════════════════════════════════════════════════════════
PSU - NGUON MAY TINH
═══════════════════════════════════════════════════════════════
1000W:
- Corsair RM1000x (2021) - Fully Modular, 80+ Gold
- Seasonic PRIME TX-1000 - Fully Modular, 80+ Titanium
- ASUS ROG Thor 1000P2 - Fully Modular, 80+ Platinum

850W:
- Corsair RM850x (2021) - Fully Modular, 80+ Gold
- Seasonic Focus GX-850 - Fully Modular, 80+ Gold
- be quiet! Dark Power 13 850W - Fully Modular, 80+ Titanium
- ASUS ROG Strix 850G - Fully Modular, 80+ Gold

750W:
- Corsair RM750 (2021) - Fully Modular, 80+ Gold
- Seasonic Focus GX-750 - Fully Modular, 80+ Gold
- MSI MPG A750GF - Fully Modular, 80+ Gold
- Deepcool PQ750M - Fully Modular, 80+ Gold

650W:
- Corsair RM650 - Fully Modular, 80+ Gold
- Seasonic S12III 650W - 80+ Bronze
- MSI MAG A650BN - 80+ Bronze

550W:
- Corsair CV550 - 80+ Bronze
- Seasonic S12III 550W - 80+ Bronze

═══════════════════════════════════════════════════════════════
CASE - VO MAY TINH
═══════════════════════════════════════════════════════════════
MID-TOWER:
- Lian Li O11 Dynamic EVO - Tempered glass, E-ATX
- Lian Li Lancool II Mesh - Mesh front, airflow
- NZXT H7 Flow - Mesh front, airflow
- NZXT H9 Flow - Dual chamber, tempered glass
- Fractal Design Torrent - Maximum airflow
- Fractal Design Pop Air - Phong cach, RGB
- be quiet! Pure Base 500DX - Silent, mesh front
- Phanteks Eclipse G360A - Budget friendly, RGB
- Corsair 4000D Airflow - Airflow, tempered glass
- Corsair 5000D Airflow - High airflow, E-ATX

FULL-TOWER:
- Lian Li O11 Dynamic XL - Extra large, dual chamber
- NZXT H9 Elite - Premium tempered glass
- Fractal Design Torrent Compact - Compact full tower

MINI-ITX:
- Lian Li PC-O11 Dynamic Mini - Compact, modular
- NZXT H210i - Compact ITX
- Fractal Design Node 202 - SFF case
- Cooler Master NR200P - SFF, GPU length support

═══════════════════════════════════════════════════════════════
COOLING - TAN NHIET
═══════════════════════════════════════════════════════════════
AIO LIQUID COOLER:
- NZXT Kraken X73 RGB 360mm
- NZXT Kraken Z73 RGB 360mm (LCD display)
- Corsair iCUE H150i Elite LCD 360mm
- Corsair iCUE H100i Elite LCD 240mm
- be quiet! Silent Loop 2 360mm
- be quiet! Pure Loop 2 360mm
- ASUS ROG RYUJIN III 360mm
- ASUS ROG STRIX LC III 360mm
- MSI MEG CoreLiquid S360 360mm
- Deepcool LT720 360mm
- Deepcool AK620 - Air cooler

AIR COOLER:
- Noctua NH-D15 - Dual tower, flagship
- Noctua NH-U12A - Single tower, high performance
- Noctua NH-L9i - Low profile ITX
- be quiet! Dark Rock Pro 4 - Silent, dual tower
- be quiet! Dark Rock Elite - Premium silent
- Scythe Fuma 2 - Budget friendly, dual tower
- Thermalright Peerless Assassin 120SE - Budget friendly
- Deepcool AK620 - Dual tower, RGB
- Corsair A500 - Dual tower

FAN:
- Noctua NF-A12x25 PWM - Premium 120mm
- Noctua NF-P12 PWM - 120mm
- Corsair QL120 RGB - RGB, 120mm
- Corsair ML120 PWM - Magnetic levitation
- be quiet! Silent Wings 4 140mm - Silent
- Arctic P12 PWM PST - Budget RGB

═══════════════════════════════════════════════════════════════
MONITOR - MAN HINH
═══════════════════════════════════════════════════════════════
4K MONITOR:
- ASUS ROG Swift PG32UQX - 32", 144Hz, Mini LED, HDR1400
- ASUS ProArt PA32UCG-K - 32", 120Hz, Mini LED, HDR1400
- LG 27GP950-B - 27", 144Hz, Nano IPS, HDMI 2.1
- Samsung Odyssey Neo G7 32" - 32", 165Hz, Curved, Mini LED
- Dell UltraSharp U3223QE - 32", IPS Black, USB-C

1440P MONITOR:
- ASUS ROG Swift PG279QM - 27", 240Hz, HDR400
- ASUS TUF Gaming VG27AQ - 27", 165Hz
- LG 27GP850-B - 27", 144Hz, Nano IPS
- Samsung Odyssey G7 27" - 27", 240Hz, Curved
- Dell Alienware AW2721D - 27", 240Hz, Nano IPS
- MSI Optix MAG274QRF-QD - 27", 165Hz, Rapid IPS
- AOC AGON AG275QX - 27", 165Hz
- ViewSonic XG270QG - 27", 165Hz, Nano IPS

1080P MONITOR:
- ASUS TUF Gaming VG249Q - 24", 144Hz
- ASUS ROG Strix XG249CM - 24", 165Hz, USB-C
- LG 24GP650-B - 24", 144Hz, UltraGear
- Samsung Odyssey G3 24" - 24", 144Hz, 1ms
- Dell S2522HG - 24", 240Hz, Curved

ULTRAWIDE:
- LG 34WN80C-B - 34", UWQHD, USB-C
- ASUS ROG Swift PG349Q - 34", 120Hz, Curved
- Samsung Odyssey G9 49" - 49", 240Hz, Super ultrawide
- Dell Alienware AW3423DWF - 34", QD-OLED, 165Hz

GAMING LAPTOP MONITOR:
- ASUS ROG Swift 360Hz PG259QN - 24.5", 360Hz
- NVIDIA BFGD (Big Format Gaming Display)

═══════════════════════════════════════════════════════════════
PERIPHERALS - CHIEN BINH
═══════════════════════════════════════════════════════════════
GAMING MOUSE:
- Logitech G Pro X Superlight 2 - Wireless, 60g
- Logitech G502 X Plus - RGB, HERO sensor
- Razer DeathAdder V3 Pro - Wireless, 63g
- Razer Viper V2 Pro - Wireless, 58g
- Razer Naga V2 Pro - Wireless, MMO
- ASUS ROG Harpe Ace - Wireless, 54g
- SteelSeries Aerox 5 - Wireless, 74g
- HyperX Pulsefire Haste 2 - Lightweight, 61g

GAMING KEYBOARD:
- Logitech G Pro X TKL - Hot-swappable, RGB
- Logitech G915 TKL - Wireless, low profile
- Razer BlackWidow V4 Pro - RGB, macro keys
- Razer Huntsman V3 Pro - Analog switches
- ASUS ROG Azoth - 75%, OLED display
- ASUS ROG Strix Scope TKL - TKL, RGB
- SteelSeries Apex Pro TKL - Adjustable switches
- HyperX Alloy Origins 60 - Compact, RGB
- Keychron Q1 Pro - 75%, Hot-swappable
- Leopold FC750R - TKL, Cherry switches

GAMING HEADSET:
- Logitech G Pro X 2 - Wireless, DTS
- Logitech G733 - Wireless, RGB, 40h battery
- Razer BlackShark V2 Pro - Wireless, USB-C
- Razer Kraken V3 Pro - Wireless, HyperSense
- ASUS ROG Delta S - Hi-Res, USB-C
- ASUS ROG Delta - Quad DAC
- SteelSeries Arctis Nova Pro Wireless - Premium, ANC
- HyperX Cloud III - Wired, comfortable
- Corsair Virtuoso RGB Wireless - Wireless, 20h

MOUSEPAD:
- Logitech G440 - Hard, 440x400mm
- Logitech G640 - Cloth, 460x400mm
- Razer Goliathus Extended - Cloth, RGB
- ASUS ROG Balteus Qi - RGB, Qi charging
- SteelSeries QcK - Budget, cloth
- HyperX Fury S - Cloth, RGB edge

GAMING CHAIR:
- Secretlab Titan Evo 2024 - Premium gaming chair
- Secretlab Omega 2024 - Compact gaming chair
- DXRacer Formula Series - Racing style
- AKRacing Master Series - Premium, wide
- Vertagear Racing Series - RGB, adjustable

═══════════════════════════════════════════════════════════════
LAPTOP
═══════════════════════════════════════════════════════════════
GAMING LAPTOP:
- ASUS ROG Zephyrus G16 - Intel/AMD, RTX 4070/4080
- ASUS ROG Strix Scar 18 - Intel, RTX 4090
- ASUS TUF Gaming A16 - AMD, RTX 4070
- MSI Raider GE78 - Intel, RTX 4090
- MSI Stealth 16 - Slim, RTX 4070
- Lenovo Legion Pro 7 - Intel, RTX 4080
- Lenovo Legion 5 Pro - AMD, RTX 4060
- HP Omen 17 - Intel, RTX 4080
- Dell Alienware x16 - Intel, RTX 4090
- Razer Blade 16 - Intel, RTX 4090

OFFICE LAPTOP:
- ASUS ZenBook 14 OLED - Intel Core Ultra, 2.8K OLED
- ASUS VivoBook S15 - Intel/AMD, thin light
- HP Pavilion Plus 14 - Intel, OLED display
- HP Envy 16 - Intel, RTX 4060 option
- Lenovo Yoga Slim 7 - AMD Ryzen, thin light
- Lenovo ThinkPad X1 Carbon - Intel vPro, business
- Dell XPS 13 Plus - Intel, OLED display
- Dell Inspiron 16 Plus - Intel, RTX 4060 option
- Acer Swift 3 OLED - AMD Ryzen, affordable OLED
- Samsung Galaxy Book3 Pro - Intel, AMOLED

WORKSTATION LAPTOP:
- ASUS ProArt Studiobook 16 - Intel Xeon, RTX 5000
- MSI CreatorPro X17 - Intel Xeon, RTX 3500
- Dell Precision 5680 - Intel, RTX 3500 Ada
- Lenovo ThinkPad P16 - Intel Xeon, RTX 5000 Ada

MACBOOK ALTERNATIVES:
- ASUS ZenBook S 13 OLED - Intel, 1kg
- HP Spectre x360 16 - Intel, 2-in-1
- Lenovo Yoga 9i - Intel, OLED 4K
- Samsung Galaxy Book3 Ultra - Intel, RTX 4070
- Dell XPS 15 - Intel, OLED 3.5K
- Acer Swift Edge 16 - AMD, OLED 4K

═══════════════════════════════════════════════════════════════
BUNDLE PACKAGES - GOI CAU HINH
═══════════════════════════════════════════════════════════════
GAMING STARTER (15-18tr):
- CPU: Ryzen 5 5600 / Intel i5-12400F
- GPU: RTX 4060
- RAM: 16GB DDR4 3200MHz
- SSD: 512GB NVMe
- PSU: 650W 80+ Gold
- Case: Budget ATX

GAMING MID-RANGE (20-25tr):
- CPU: Ryzen 5 7600X / Intel i5-14600K
- GPU: RTX 4070
- RAM: 32GB DDR5/DDR4
- SSD: 1TB NVMe
- PSU: 750W 80+ Gold
- Case: Mid-tower airflow

GAMING HIGH-END (30-40tr):
- CPU: Ryzen 7 7800X3D / Intel i7-14700K
- GPU: RTX 4080 SUPER
- RAM: 32GB DDR5 6000MHz
- SSD: 2TB NVMe
- PSU: 850W 80+ Gold
- Case: Premium mid-tower

ENTHUSIAST (50tr+):
- CPU: Ryzen 9 7950X / Intel i9-14900K
- GPU: RTX 4090
- RAM: 64GB DDR5 6000MHz
- SSD: 2TB NVMe + 4TB HDD
- PSU: 1000W 80+ Platinum
- Case: Full tower premium

═══════════════════════════════════════════════════════════════
PRICE BRACKETS
═══════════════════════════════════════════════════════════════
BUDGET (duoi 10tr): PC van phong, hoc tap
- CPU: i3-12100, Ryzen 5 5600G
- GPU: Integrated Vega/RTX 3050
- RAM: 8-16GB DDR4
- SSD: 256-512GB SATA/NVMe

MAINSTREAM (10-20tr): Gaming 1080p, cong viec
- CPU: i5-12400F, Ryzen 5 5600X
- GPU: RTX 3060, RTX 4060
- RAM: 16GB DDR4
- SSD: 512GB-1TB NVMe

PERFORMANCE (20-35tr): Gaming 1440p
- CPU: i5-14600K, Ryzen 7 7700X
- GPU: RTX 4070, RTX 4070 Ti
- RAM: 32GB DDR5
- SSD: 1-2TB NVMe

HIGH-END (35-60tr): Gaming 4K
- CPU: i7-14700K, Ryzen 9 7900X
- GPU: RTX 4080, RTX 4090
- RAM: 32-64GB DDR5
- SSD: 2TB+ NVMe

═══════════════════════════════════════════════════════════════
`;

// System prompt for chatbot
const SYSTEM_PROMPT = `Ban la AruBot - tro ly AI chuyen ve PC va linh kien may tinh tai AuraPC Vietnam.

NHIEM VU:
1. Tu van ve cac linh kien PC nhu CPU, GPU, RAM, SSD, Mainboard, PSU, Case, Tan nhiet, Man hinh, Laptop
2. Go y san pham phu hop voi nhu cau va ngan sach cua khach hang
3. So sanh cac san pham tuong tu
4. Tra loi bang tieng Viet, than thien va chuyen nghiep
5. Khuyen khich khach hang mua hang tai AuraPC
6. Neu khach hoi ve gia, hay noi "Gia co the thay doi, vui long kiem tra tren app AuraPC"

THONG TIN SAN PHAM MOI NHAT:
${PRODUCT_CATALOG}

QUY TAC TRA LOI:
- Tra loi NGAN GON, DUOC 1-3 cau
- Neu can go y san pham, hay NOI RA TEN SAN PHAM CU THE (vi du: "RTX 4060" hay "Samsung 990 PRO 1TB")
- Neu khach can tu van cau hinh, hay hoi ngan sach truoc
- Neu khach hoi ve linh kien cu the, hay cho thong tin chi tiet ve brand, model, gia tham khao

VI DU CACH TRA LOI:
Khach: "Cho toi go y PC gaming 20 trieu"
Bot: "Voi 20 trieu, toi go y cau hinh sau:\n\n• CPU: Intel Core i5-14400\n• GPU: NVIDIA RTX 4060\n• RAM: 16GB DDR4\n• SSD: Kingston Fury 512GB NVMe\n\nDay la cau hinh gaming 1080p rat tot, ban co the tham khao them khong?"

Khach: "Tan nhiet cho i9-14900K"
Bot: "Cho i9-14900K, toi khuyen ban:\n\n• NZXT Kraken X73 RGB 360mm - AIO hieu qua nhat\n• Noctua NH-D15 - Air cooler cuc manh\n\nBan thich loai nao? AIO hay air cooler?"

KHONG duoc tra loi qua dai, toi da chi can 1-3 cau ngan gon.
`;

// Parse suggested products from AI response
function parseProductsFromResponse(text) {
  const products = [];
  
  // Common product patterns
  const productPatterns = [
    { regex: /RTX\s*(\d{4})\s*(Ti\s*Super|Ti|SUPER)?/gi, category: 'GPU' },
    { regex: /GTX\s*(\d{4})/gi, category: 'GPU' },
    { regex: /RX\s*(\d{4}\s*XT|XTx?)?/gi, category: 'GPU' },
    { regex: /Ryzen\s*(9|7|5|3)\s*(\d{4}\s*X3D|X?)?/gi, category: 'CPU' },
    { regex: /Core\s*i(9|7|5|3)[-_]?(\d{4}\s*K)?/gi, category: 'CPU' },
    { regex: /Samsung\s*(990\s*PRO|980\s*PRO|870\s*EVO)/gi, category: 'SSD' },
    { regex: /Kingston\s*(Fury|Custom)/gi, category: 'RAM' },
    { regex: /(Lian\s*Li|NZXT|Fractal|Corsair)\s*([A-Za-z0-9\s]+)/gi, category: 'CASE' },
  ];
  
  // Extract mentioned products
  for (const pattern of productPatterns) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const name = match[0].trim();
      if (name.length > 3 && !products.some(p => p.name.includes(name))) {
        products.push({
          name: name,
          category: pattern.category,
          image: null // Will use placeholder
        });
      }
    }
  }
  
  return products.slice(0, 4); // Max 4 products
}

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    // Fallback responses when no API token
    if (!apiToken) {
      const reply = generateFallbackResponse(message);
      const products = parseProductsFromResponse(reply);
      
      return res.json({
        success: true,
        reply,
        products: products,
        timestamp: new Date().toISOString()
      });
    }

    // Build conversation context
    let conversationText = '';
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      conversationText += `${role}: ${msg.content}\n`;
    }
    conversationText += `User: ${message}\nAssistant:`;

    // Get model version
    const versionId = await getModelVersion(apiToken);
    if (!versionId) {
      return res.status(502).json({ error: 'Cannot get model version' });
    }

    // Create prediction
    const createResponse = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: versionId,
        input: {
          prompt: `${SYSTEM_PROMPT}\n\n${conversationText}`,
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 0.9
        }
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Replicate API error:', createResponse.status, errorText);
      return res.status(502).json({ error: 'AI service error' });
    }

    const prediction = await createResponse.json();
    const predictionId = prediction.id;

    // Poll for completion
    let reply = 'Xin loi, toi khong the tra loi luc nay.';
    const maxAttempts = 60;
    const pollInterval = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, pollInterval));

      const statusResponse = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: { 'Authorization': `Token ${apiToken}` }
      });

      if (!statusResponse.ok) continue;

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'succeeded') {
        reply = statusData.output?.[0] || statusData.output || 'Khong co phan hoi.';
        if (Array.isArray(reply)) reply = reply.join('');
        break;
      } else if (statusData.status === 'failed') {
        reply = 'Xin loi, AI dang ban. Vui long thu lai.';
        break;
      }
    }

    // Parse products from response
    const products = parseProductsFromResponse(reply);

    res.json({
      success: true,
      reply,
      products: products,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fallback response generator
function generateFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('chao') || lowerMsg.includes('xin chao') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return 'Xin chao! 👋 Toi la AruBot, tro ly AI cua AuraPC. Ban can toi tu van gi hom nay?';
  }
  
  if (lowerMsg.includes('pc') || lowerMsg.includes('máy') || lowerMsg.includes('cấu hình')) {
    if (lowerMsg.includes('15') || lowerMsg.includes('10')) {
      return 'Voi ngan sach 10-15 trieu, toi go y PC van phong:\n• CPU: Intel i3-14100\n• RAM: 8GB DDR4\n• SSD: 256GB NVMe\n\nBan muon tim hieu them khong?';
    } else if (lowerMsg.includes('20') || lowerMsg.includes('25')) {
      return 'Voi 20-25 trieu, ban co the co PC gaming 1080p:\n• CPU: Intel i5-14400\n• GPU: RTX 4060\n• RAM: 16GB DDR4\n\nBan muon cau hinh nao?';
    } else if (lowerMsg.includes('30') || lowerMsg.includes('35') || lowerMsg.includes('40')) {
      return 'Voi 30-40 trieu, day la cau hinh manh:\n• CPU: Intel i7-14700K\n• GPU: RTX 4070 SUPER\n• RAM: 32GB DDR5\n\nBan co muon tu van them khong?';
    }
    return 'De toi tu van tot nhat, ban cho toi biet ngan sach cua ban la bao nhieu?';
  }
  
  if (lowerMsg.includes('cpu') || lowerMsg.includes('vi xử lý')) {
    if (lowerMsg.includes('intel') || lowerMsg.includes('i9') || lowerMsg.includes('i7')) {
      return 'Intel Core i7-14700K la lua chon tot cho gaming cao cap. Ban co the tham khao them Intel Core i5-14600K neu co kinh phi it hon.';
    } else if (lowerMsg.includes('amd') || lowerMsg.includes('ryzen')) {
      return 'AMD Ryzen 7 7800X3D la CPU gaming tot nhat hien nay. Neu chi dung de cong viec, Ryzen 5 7600X cung du rat manh.';
    }
    return 'Ban muon tu van CPU Intel hay AMD? Va nhu cau cua ban la gaming hay cong viec?';
  }
  
  if (lowerMsg.includes('gpu') || lowerMsg.includes('card') || lowerMsg.includes('đồ họa')) {
    if (lowerMsg.includes('rtx 4090') || lowerMsg.includes('4090')) {
      return 'RTX 4090 la card do hoa manh nhat hien nay, tuyet voi cho 4K gaming. Tuy nhien gia cua no rat cao, neu chi cho 1440p thi RTX 4070 SUPER la du di.';
    } else if (lowerMsg.includes('rtx 4080') || lowerMsg.includes('4080')) {
      return 'RTX 4080 SUPER la lua chon tuyet voi cho 4K gaming. Neu ban chi cho 1440p, ban co the tiet kiem bang RTX 4070 Ti SUPER.';
    } else if (lowerMsg.includes('rtx 4060') || lowerMsg.includes('4060')) {
      return 'RTX 4060 la card gaming 1080p rat tot voi gia pho thong. Neu ban muon nhieu hon, RTX 4070 SUPER cho 1440p gaming.';
    }
    return 'De go y chinh xac, ban cho biet ban can card cho muc dich gi va ngan sach bao nhieu?';
  }
  
  if (lowerMsg.includes('ram')) {
    if (lowerMsg.includes('ddr5')) {
      return 'DDR5 hien tai la lua chon cho build moi. Kingston Fury Beast DDR5 32GB (2x16GB) 6000MHz la mot lua chon tot voi gia hop ly.';
    } else if (lowerMsg.includes('ddr4')) {
      return 'DDR4 van la lua chon tot cho build budget. Kingston Fury Beast DDR4 16GB (2x8GB) 3200MHz la du cho nhieu cong viec.';
    }
    return 'Ban can bao nhieu RAM? 16GB la du cho nhieu nguoi, 32GB cho content creation, 64GB cho workstation.';
  }
  
  if (lowerMsg.includes('ssd') || lowerMsg.includes('ổ cứng')) {
    return 'Samsung 990 PRO 1TB NVMe la mot trong nhung SSD nhanh nhat hien nay. Neu can nhieu hon, ban co the chon phiên ban 2TB.';
  }
  
  if (lowerMsg.includes('case') || lowerMsg.includes('vỏ')) {
    return 'Lian Li O11 Dynamic EVO la case rat dep voi tempered glass, ho tro E-ATX. Neu ban can airflow tot, NZXT H7 Flow cung la lua chon tot.';
  }
  
  if (lowerMsg.includes('nguồn') || lowerMsg.includes('psu')) {
    return 'Corsair RM850x la nguon 850W rat tot voi chat luong cao va quiet. Neu ban co RTX 4090/4080, ban can it nhat 850W-1000W.';
  }
  
  if (lowerMsg.includes('tản nhiệt') || lowerMsg.includes('cooler')) {
    return 'Cho i9-14900K, toi khuyen ban:\n\n• NZXT Kraken X73 RGB 360mm - AIO hieu qua nhat\n• Noctua NH-D15 - Air cooler cuc manh\n\nBan thich loai nao?';
  }
  
  if (lowerMsg.includes('màn hình') || lowerMsg.includes('monitor')) {
    return 'Tuy theo nhu cau:\n\n• 1080p/144Hz: ASUS TUF VG249Q\n• 1440p/165Hz: LG 27GP850-B\n• 4K/144Hz: ASUS ROG PG32UQX\n\nBan can monitor cho muc dich gi?';
  }
  
  if (lowerMsg.includes('laptop')) {
    if (lowerMsg.includes('gaming')) {
      return 'Laptop gaming tot nhat hien nay:\n• ASUS ROG Zephyrus G16 - Manh me, mong nhe\n• MSI Raider GE78 - Hieu nang cao\n• Lenovo Legion Pro 7 - Gia tri tot\n\nBan co ngan sach bao nhieu?';
    } else if (lowerMsg.includes('van phòng') || lowerMsg.includes('office')) {
      return 'Laptop van phong tot:\n• ASUS ZenBook 14 OLED - Nhe, dep, pin lâu\n• Dell XPS 13 Plus - Premium\n• Lenovo Yoga Slim 7 - AMD Ryzen hieu qua\n\nBan thich loai nao?';
    }
    return 'Ban can laptop cho muc dich gi? Gaming, van phong, hay lam viec chuyen nghiep?';
  }
  
  return 'Toi khong chac ban can gi. Ban co the hoi ve CPU, GPU, RAM, SSD, Case, PSU, Man hinh, Laptop... Hoac cho biet ngan sach de toi go y cau hinh PC phu hop?';
}

// Get product catalog
router.get('/catalog', (req, res) => {
  res.json({
    success: true,
    catalog: PRODUCT_CATALOG.trim()
  });
});

module.exports = router;
