import Groq from "groq-sdk";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
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

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000)
      })
    )
    .min(1)
    .max(50)
});

let groqClient: Groq | null = null;

function getClient(): Groq {
  if (!groqClient) {
    if (!env.GROQ_API_KEY) {
      throw new AppError(503, "AI assistant is not configured. Add GROQ_API_KEY to backend/.env (free at console.groq.com)", "AI_NOT_CONFIGURED");
    }
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groqClient;
}

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Invalid messages format.", "VALIDATION_ERROR");
    }
    const { messages } = parsed.data;

    const client = getClient();

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content }))
      ]
    });

    const text = response.choices[0]?.message?.content ?? "";
    res.json({ reply: text });
  } catch (error) {
    next(error);
  }
}
