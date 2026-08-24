# DeepSeek AI Integration Specifications

## 1. Overview
- **Service**: DeepSeek API (`deepseek-chat`)
- **Base URL**: `https://api.deepseek.com/chat/completions`
- **Authentication**: Bearer Token via `DEEPSEEK_API_KEY`
- **Protocol**: OpenAI-compatible REST API

## 2. Supported Languages & Sommelier Registry
- `IT`: Italiano (Italian Sommelier terminology)
- `EN`: English (International tasting notes & dining descriptors)
- `TH`: ไทย (Natural, modern, context-rich Thai restaurant phrasing with zero arbitrary word spacing)
- `DE`: Deutsch (Accurate German wine & culinary terminology)

## 3. Dedicated Endpoints in Project
- `/api/wine-translate` (Serverless handler: `api/_handlers/wine-translate.ts`)
- Configured with strict JSON-only response format (`response_format: { type: "json_object" }`).
