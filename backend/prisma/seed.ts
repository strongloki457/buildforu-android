import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // No seed data for production — use scripts/create-owner.ts to set up owner account
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
