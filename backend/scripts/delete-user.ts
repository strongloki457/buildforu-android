import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'wiktoriamartyna82@gmail.com';

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, companyId: true }
  });

  if (!user) {
    console.log(`Nie znaleziono: ${email}`);
    return;
  }

  console.log(`Kasowanie: ${user.email} | ${user.name} | companyId: ${user.companyId}`);
  await prisma.company.delete({ where: { id: user.companyId } });
  console.log('Gotowe. Możesz zarejestrować ten email od nowa.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
