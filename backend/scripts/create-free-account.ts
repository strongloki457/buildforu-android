import crypto from "crypto";
import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "niewiadomski@scarlet.be";
  const companyName = "Niewiadomski";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Account ${email} already exists — skipping.`);
    return;
  }

  const tempPassword = crypto.randomBytes(10).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        plan: "business",
        isFree: true
      }
    });

    const user = await tx.user.create({
      data: {
        name: companyName,
        email,
        passwordHash,
        role: Role.ADMIN,
        emailVerified: true,
        companyId: company.id
      }
    });

    await tx.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: resetExpires
      }
    });
  });

  const frontendUrl = process.env.FRONTEND_URL ?? "https://app.buildforu.eu";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  console.log("\n✅  Free Business account created successfully!\n");
  console.log(`   Email:          ${email}`);
  console.log(`   Temp password:  ${tempPassword}`);
  console.log(`   Reset link:     ${resetUrl}`);
  console.log("\n   Share the reset link with your father — it expires in 7 days.");
  console.log("   He can set his own password by clicking it.\n");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
