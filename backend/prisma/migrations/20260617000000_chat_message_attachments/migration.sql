-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "attachments" JSONB,
ALTER COLUMN "text" SET DEFAULT '';
