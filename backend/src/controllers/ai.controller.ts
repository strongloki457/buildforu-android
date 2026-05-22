import Groq from "groq-sdk";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
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

const AI_TIMEOUT_MS = 30_000;

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
      throw new AppError(503, "AI assistant is not configured.", "AI_NOT_CONFIGURED");
    }
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groqClient;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AppError(504, "The AI assistant took too long to respond. Please try again.", "AI_TIMEOUT"));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Invalid messages format.", "VALIDATION_ERROR");
    }
    const { messages } = parsed.data;

    // Plan check — AI is Pro-only, enforced server-side
    const company = await prisma.company.findUnique({
      where: { id: req.user!.companyId },
      select: { plan: true }
    });
    if (!company || company.plan !== "pro") {
      throw new AppError(403, "AI assistant is available on the Pro plan only.", "PLAN_REQUIRED");
    }

    const client = getClient();

    const response = await withTimeout(
      client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        max_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content }))
        ]
      }),
      AI_TIMEOUT_MS
    );

    const text = response.choices[0]?.message?.content ?? "";
    res.json({ reply: text });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    // Never expose provider errors or stack traces to the client
    next(new AppError(502, "The AI assistant is temporarily unavailable. Please try again.", "AI_UNAVAILABLE"));
  }
}
