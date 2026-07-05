const express = require('express');
const router = express.Router();

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const MODEL_VERSION = 'google/gemini-2.5-flash';

// Product catalog for AuraPC
const PRODUCT_CATALOG = `
AURAPC PRODUCT CATALOG - PC Components & Accessories:

CPU (Bộ vi xử lý):
- Intel Core i3, i5, i7, i9 (various generations)
- AMD Ryzen 3, 5, 7, 9 (various generations)

GPU (Card đồ họa):
- NVIDIA: RTX 4060, 4070, 4080, 4090
- AMD: RX 6600, 6700, 6800, 6900

RAM:
- DDR4: 8GB, 16GB, 32GB
- DDR5: 16GB, 32GB, 64GB
- Brands: Kingston, Corsair, G.Skill, TeamGroup

Storage (Ổ cứng):
- SSD NVMe: 256GB - 4TB
- SSD SATA: 512GB - 2TB
- HDD: 1TB - 8TB

Mainboard (Bo mạch chủ):
- Intel: B660, B760, Z690, Z790
- AMD: B550, B650, X570, X670

PSU (Nguồn):
- 550W, 650W, 750W, 850W, 1000W
- 80+ Bronze, Gold, Platinum

Case (Vỏ máy):
- Mid-tower, Full-tower
- RGB, tempered glass

Cooling (Tản nhiệt):
- Air Cooler
- AIO Liquid Cooler: 240mm, 280mm, 360mm

Monitor (Màn hình):
- 24", 27", 32" 
- 1080p, 1440p, 4K
- 60Hz, 144Hz, 165Hz, 240Hz

Gaming Gear:
- Gaming mouse, keyboard, headset
- Mousepad, controller

Laptop:
- Gaming laptop, Office laptop
- MacBook alternatives
`;

// System prompt for chatbot
const SYSTEM_PROMPT = `Bạn là AruBot - trợ lý AI chuyên về PC và linh kiện máy tính tại AuraPC.

NHIỆM VỤ:
1. Tư vấn về các linh kiện PC như CPU, GPU, RAM, SSD, Mainboard, PSU, Case, Tản nhiệt...
2. Gợi ý sản phẩm phù hợp với nhu cầu và ngân sách của khách hàng
3. So sánh các sản phẩm tương tự
4. Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
5. Khuyến khích khách hàng mua hàng tại AuraPC
6. Nếu khách hỏi về giá, hãy nói "Giá có thể thay đổi, vui lòng kiểm tra trên app AuraPC"

LUÔN giữ câu trả lời NGẮN GỌN, DỄ HIỂU.
Nếu không biết, hãy nói rõ và khuyên khách liên hệ hotline AuraPC.

THÔNG TIN SẢN PHẨM:
${PRODUCT_CATALOG}
`;

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    // Fallback responses when no API token (for testing)
    const lowerMsg = message.toLowerCase();
    if (!apiToken) {
      const fallbacks = {
        'xin chao': 'Xin chào! 👋 Tôi là AruBot, trợ lý AI của AuraPC. Tôi có thể giúp bạn tư vấn về PC và linh kiện máy tính. Bạn cần tôi giúp gì hôm nay?',
        'chao': 'Xin chào! 👋 Tôi là AruBot, trợ lý AI của AuraPC. Bạn cần tư vấn gì hôm nay?',
        'hello': 'Hello! 👋 I am AruBot, the AI assistant of AuraPC. How can I help you today?',
        'hi': 'Hi! 👋 Tôi là AruBot. Bạn cần tư vấn về PC không?',
      };
      
      let reply = 'Xin chào! 👋 Tôi là AruBot, trợ lý AI của AuraPC. Hiện tại tôi đang được cập nhật. Vui lòng thử lại sau hoặc liên hệ hotline để được hỗ trợ nhanh nhất!';
      
      for (const [key, value] of Object.entries(fallbacks)) {
        if (lowerMsg.includes(key)) {
          reply = value;
          break;
        }
      }
      
      // Check for keywords
      if (lowerMsg.includes('pc') || lowerMsg.includes('máy') || lowerMsg.includes('game')) {
        reply = '🎮 Tôi có thể tư vấn PC gaming theo ngân sách của bạn!\n\nVí dụ:\n• 15 triệu: PC văn phòng mạnh\n• 20-25 triệu: PC gaming tầm trung\n• 30-40 triệu: PC gaming cao cấp\n• 50+ triệu: PC enthusiast\n\nBạn muốn tư vấn cấu hình nào?';
      } else if (lowerMsg.includes('cpu') || lowerMsg.includes('vi xử lý') || lowerMsg.includes('chip')) {
        reply = '🖥️ Tư vấn CPU:\n\n• Intel: i3 (văn phòng), i5 ( gaming), i7/i9 (cao cấp)\n• AMD: Ryzen 3, 5, 7, 9 tương ứng\n\nBạn cần tư vấn thêm không?';
      } else if (lowerMsg.includes('gpu') || lowerMsg.includes('card') || lowerMsg.includes('đồ họa')) {
        reply = '🎨 Tư vấn GPU:\n\n• NVIDIA: RTX 4060, 4070, 4080, 4090\n• AMD: RX 6600, 6700, 6800, 6900\n\nCard nào bạn quan tâm?';
      }
      
      return res.json({
        success: true,
        reply,
        timestamp: new Date().toISOString()
      });
    }

    // Build conversation context
    let conversationText = '';
    
    // Add history (last 10 messages)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      conversationText += `${role}: ${msg.content}\n`;
    }
    
    // Add current message
    conversationText += `User: ${message}\nAssistant:`;

    // Create prediction on Replicate
    const createResponse = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
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
    let reply = 'Xin lỗi, tôi không thể trả lời lúc này.';
    const maxAttempts = 60;
    const pollInterval = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, pollInterval));

      const statusResponse = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiToken}`
        }
      });

      if (!statusResponse.ok) continue;

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'succeeded') {
        reply = statusData.output?.[0] || statusData.output || 'Không có phản hồi.';
        if (Array.isArray(reply)) reply = reply.join('');
        break;
      } else if (statusData.status === 'failed') {
        reply = 'Xin lỗi, AI đang bận. Vui lòng thử lại.';
        break;
      }
    }

    res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product catalog
router.get('/catalog', (req, res) => {
  res.json({
    success: true,
    catalog: PRODUCT_CATALOG.trim()
  });
});

module.exports = router;
