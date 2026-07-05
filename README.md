# AuraPC Chatbot Backend

Node.js/Express backend for AuraPC AI chatbot using Google Gemini 2.0 Flash via Replicate.

## Features
- Chat endpoint with conversation history
- Product catalog for PC components
- Vietnamese language support
- Replicate API integration

## Setup

```bash
npm install
```

## Configure

Create `.env` file:
```env
REPLICATE_API_TOKEN=your_replicate_token_here
PORT=3000
NODE_ENV=production
```

Get Replicate API token: https://replicate.com/account/api-tokens

## Run

```bash
npm start        # Production
npm run dev      # Development (with nodemon)
```

## API

### POST /api/chat
```json
{
  "message": "Tư vấn PC gaming 20 triệu",
  "history": [
    {"role": "user", "content": "..."},
    {"role": "model", "content": "..."}
  ]
}
```

### GET /api/catalog
Returns product catalog.

### GET /health
Health check endpoint.

## Deploy to Render

1. Go to https://render.com
2. Create Web Service, connect GitHub repo
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add Environment Variable: `REPLICATE_API_TOKEN`
