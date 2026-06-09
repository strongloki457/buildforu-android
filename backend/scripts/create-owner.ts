import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

// ─── ZMIEŃ TE DANE PRZED URUCHOMIENIEM ───────────────────────────────────────
const OWNER_EMAIL = "maciekpilka-1999@wp.pl";
const OWNER_NAME = "Maciek";
const OWNER_PASSWORD = "WPISZ_HASLO_TUTAJ"; // min. 8 znaków
const OWNER_COMPANY_NAME = "BuildForU Admin";

const DEMO_EMAILS_TO_DELETE = ["admin@buildforu.com", "worker@buildforu.com"];
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (OWNER_PASSWORD === "WPISZ_HASLO_TUTAJ") {
    throw new Error("Zmień OWNER_PASSWORD przed uruchomieniem skryptu!");
  }

  // 1. Utwórz firmę dla właściciela
  const company = await prisma.company.upsert({
    where: { id: "company_owner_buildforu" },
    update: {
      name: OWNER_COMPANY_NAME,
      plan: "enterprise",
      isFree: true
    },
    create: {
      id: "company_owner_buildforu",
      name: OWNER_COMPANY_NAME,
      plan: "enterprise",
      isFree: true
    }
  });

  // 2. Utwórz konto właściciela
  const passwordHash = await hashPassword(OWNER_PASSWORD);
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {
      name: OWNER_NAME,
      passwordHash,
      role: Role.ADMIN,
      companyId: company.id,
      emailVerified: true
    },
    create: {
      name: OWNER_NAME,
      email: OWNER_EMAIL,
      passwordHash,
      role: Role.ADMIN,
      companyId: company.id,
      emailVerified: true
    }
  });

  process.stdout.write(`Konto właściciela utworzone: ${owner.email} (${owner.id})\n`);
  process.stdout.write(`Firma: ${company.name} | Plan: enterprise | isFree: true\n`);

  // 3. Usuń konta demo z bazy
  for (const email of DEMO_EMAILS_TO_DELETE) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.delete({ where: { email } });
      process.stdout.write(`Usunięto konto demo: ${email}\n`);
    } else {
      process.stdout.write(`Konto demo nie istnieje (pominięto): ${email}\n`);
    }
  }

  // 4. Usuń firmę demo jeśli nie ma już żadnych użytkowników
  const demoCompany = await prisma.company.findUnique({
    where: { id: "company_demo_buildforu" },
    include: { users: true }
  });
  if (demoCompany && demoCompany.users.length === 0) {
    await prisma.company.delete({ where: { id: "company_demo_buildforu" } });
    process.stdout.write("Usunięto firmę demo: BuildForU Demo Construction\n");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.stdout.write("\nGotowe!\n");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    process.stderr.write(`Błąd: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
