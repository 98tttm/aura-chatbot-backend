# Render.com Deployment Guide for AuraPC Chatbot Backend

## Quick Deploy

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repo (or deploy via Blueprint)
4. Configure:

### Settings
- **Name**: `aura-chatbot-backend`
- **Region**: Singapore (or closest to users)
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment
- **Environment Variables** (click "Add Environment Variable" for each):

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Your Gemini API key from aistudio.google.com |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

## Get Gemini API Key

1. Go to https://aistudio.google.com
2. Click "Get API Key" in sidebar
3. Create new API key or use existing one
4. Copy the key (starts with `AI...`)

## After Deploy

Your chatbot backend will be available at:
```
https://aura-chatbot-backend.onrender.com
```

Test health check:
```
https://aura-chatbot-backend.onrender.com/health
```

Test chat:
```bash
curl -X POST https://aura-chatbot-backend.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tư vấn cho tôi một bộ PC chơi game 20 triệu"}'
```

## Local Development

```bash
cd aura-chatbot-backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm run dev
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | - | Gemini API key |
| `PORT` | No | 3000 | Server port |
| `ALLOWED_ORIGINS` | No | * | CORS origins |
| `ADMIN_API_KEY` | No | - | Admin authentication |
