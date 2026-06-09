import Groq from "groq-sdk";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

const SYSTEM_PROMPT = `You are a helpful construction assistant for the BuildForU app. You assist construction managers, workers, and building companies.

Your areas of expertise:
- Building materials: cement, concrete, bricks, blocks, steel, wood, insulation, paints, plaster, renders
- Construction techniques: foundations, walls, ceilings, roofs, installations, finishing
- Material estimates and cost calculations
- Building regulations and construction codes
- Site safety (health & safety)
- Construction project management
- Selecting the right materials and tools
- Solving technical problems on site

IMPORTANT: Always reply in the same language the user writes in. If the user writes in Polish, reply in Polish. If in English, reply in English. Match their language exactly.
If a question is outside the construction domain, politely redirect the conversation back to construction topics.`;

const AI_TIMEOUT_MS = 30_000;

const messageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(4000),
    image: z.string().max(700_000).optional()
  })
  .refine((m) => m.content.trim().length > 0 || !!m.image, {
    message: "Message must have content or image"
  });

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50)
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
    if (!company || !["pro", "enterprise"].includes(company.plan)) {
      throw new AppError(403, "AI assistant is available on the Pro plan only.", "PLAN_REQUIRED");
    }

    const client = getClient();

    const hasImage = messages.some((m) => !!m.image);
    const model = hasImage ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.1-8b-instant";

    const builtMessages: Groq.Chat.ChatCompletionMessageParam[] = messages.map((m) => {
      if (m.image) {
        return {
          role: "user" as const,
          content: [
            { type: "image_url" as const, image_url: { url: m.image! } },
            ...(m.content.trim() ? [{ type: "text" as const, text: m.content }] : [])
          ]
        };
      }
      return { role: m.role as "user" | "assistant", content: m.content };
    });

    const response = await withTimeout(
      client.chat.completions.create({
        model,
        max_tokens: 1024,
        stream: false,
        messages: [
          { role: "system" as const, content: SYSTEM_PROMPT },
          ...builtMessages
        ]
      }) as Promise<Groq.Chat.ChatCompletion>,
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
