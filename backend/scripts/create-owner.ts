import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

// ─── ZMIEŃ TE DANE PRZED URUCHOMIENIEM ───────────────────────────────────────
const OWNER_EMAIL = "maciekpilka-1999@wp.pl";
const OWNER_NAME = "Maciek";
const OWNER_PASSWORD = "WPISZ_HASLO_TUTAJ"; // min. 8 znaków
const OWNER_COMPANY_NAME = "BuildForU Admin";

const DEMO_EMAILS_TO_DELETE = ["admin@buildforu.com", "worker@buildforu.com"];
const DEMO_COMPANY_ID = "company_demo_buildforu";
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
      emailVerified: true
    },
    create: {
      name: OWNER_NAME,
      email: OWNER_EMAIL,
      passwordHash,
      emailVerified: true
    }
  });

  // 3. Podepnij właściciela do jego firmy jako ADMIN (multi-company: rola żyje na UserCompany)
  await prisma.userCompany.upsert({
    where: { userId_companyId: { userId: owner.id, companyId: company.id } },
    update: { role: Role.ADMIN },
    create: { userId: owner.id, companyId: company.id, role: Role.ADMIN }
  });

  process.stdout.write(`Konto właściciela utworzone: ${owner.email} (${owner.id})\n`);
  process.stdout.write(`Firma: ${company.name} | Plan: enterprise | isFree: true\n`);

  // 4. Usuń konta demo z bazy
  for (const email of DEMO_EMAILS_TO_DELETE) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.delete({ where: { id: user.id } });
      process.stdout.write(`Usunięto konto demo: ${email}\n`);
    } else {
      process.stdout.write(`Konto demo nie istnieje (pominięto): ${email}\n`);
    }
  }

  // 5. Usuń firmę demo jeśli nie ma już żadnych powiązanych kont
  const demoCompany = await prisma.company.findUnique({
    where: { id: DEMO_COMPANY_ID },
    include: { userCompanies: true }
  });
  if (demoCompany && demoCompany.userCompanies.length === 0) {
    await prisma.company.delete({ where: { id: DEMO_COMPANY_ID } });
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
