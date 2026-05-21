import Anthropic from "@anthropic-ai/sdk";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

const SYSTEM_PROMPT = `Jesteś pomocnym asystentem budowlanym dla aplikacji BuildForU. Pomagasz kierownikom budowy, pracownikom i firmom budowlanym.

Twoje kompetencje:
- Materiały budowlane: cement, beton, cegły, bloczki, stal, drewno, izolacje, farby, gips, tynki
- Technologie budowlane: fundamenty, ściany, stropy, dachy, instalacje, wykończenia
- Kosztorysy i szacunki materiałów
- Normy budowlane i przepisy prawa budowlanego (polskie)
- Bezpieczeństwo na budowie (BHP)
- Zarządzanie projektami budowlanymi
- Dobór odpowiednich materiałów i narzędzi
- Rozwiązywanie problemów technicznych na budowie

Odpowiadaj po polsku, konkretnie i praktycznie. Jeśli pytanie dotyczy czegoś poza budownictwem, grzecznie nakieruj rozmowę z powrotem na tematy budowlane.`;

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new AppError(503, "AI assistant is not configured. Add ANTHROPIC_API_KEY to backend/.env", "AI_NOT_CONFIGURED");
    }
    anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

interface MessageInput {
  role: "user" | "assistant";
  content: string;
}

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { messages } = req.body as { messages: MessageInput[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new AppError(400, "messages must be a non-empty array", "VALIDATION_ERROR");
    }

    const client = getClient();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content
      }))
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    res.json({ reply: text });
  } catch (error) {
    next(error);
  }
}
