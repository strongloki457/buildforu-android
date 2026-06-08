import nodemailer from "nodemailer";
import { env } from "../config/env";

const SUPPORTED_LOCALES = ["en", "pl", "de", "fr", "es", "it", "ro", "tr", "uk"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function resolveLocale(lang?: string): Locale {
  if (lang && SUPPORTED_LOCALES.includes(lang as Locale)) {
    return lang as Locale;
  }
  return "en";
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function createTransporter() {
  if (!env.SMTP_HOST) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    tls: env.NODE_ENV !== "production" ? { rejectUnauthorized: false } : undefined
  });
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    process.stdout.write(
      `[email-dev] To: ${to} | Subject: ${subject}\n${html.replace(/<[^>]+>/g, "")}\n`
    );
    return;
  }

  try {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
  } catch (error) {
    process.stderr.write(`[email] Failed to send "${subject}" to ${to}: ${error}\n`);
  }
}

// ---------------------------------------------------------------------------
// Verification email
// ---------------------------------------------------------------------------

const verificationTemplates: Record<Locale, (name: string, link: string) => { subject: string; html: string }> = {
  en: (name, link) => ({
    subject: "Verify your BuildForU email address",
    html: `<p>Hi ${name},</p>
     <p>Welcome to BuildForU! Please verify your email address to confirm your account.</p>
     <p><a href="${link}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Verify email</a></p>
     <p>Or copy this link: <a href="${link}">${link}</a></p>
     <p>This link expires in <strong>24 hours</strong>.</p>
     <p>If you did not create a BuildForU account, you can safely ignore this email.</p>`
  }),
  pl: (name, link) => ({
    subject: "Potwierdź adres e-mail w BuildForU",
    html: `<p>Cześć ${name},</p>
     <p>Witamy w BuildForU! Potwierdź swój adres e-mail, aby aktywować konto.</p>
     <p><a href="${link}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Potwierdź e-mail</a></p>
     <p>Lub skopiuj ten link: <a href="${link}">${link}</a></p>
     <p>Link wygasa po <strong>24 godzinach</strong>.</p>
     <p>Jeśli nie zakładałeś konta w BuildForU, możesz zignorować tę wiadomość.</p>`
  }),
  de: (name, link) => ({
    subject: "Bestätigen Sie Ihre BuildForU-E-Mail-Adresse",
    html: `<p>Hallo ${name},</p>
     <p>Willkommen bei BuildForU! Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.</p>
     <p><a href="${link}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">E-Mail bestätigen</a></p>
     <p>Oder kopieren Sie diesen Link: <a href="${link}">${link}</a></p>
     <p>Dieser Link läuft in <strong>24 Stunden</strong> ab.</p>
     <p>Falls Sie kein BuildForU-Konto erstellt haben, können Sie diese E-Mail ignorieren.</p>`
  }),
  fr: (name, link) => ({
    subject: "Vérifiez votre adresse e-mail BuildForU",
    html: `<p>Bonjour ${name},</p>
     <p>Bienvenue sur BuildForU ! Veuillez vérifier votre adresse e-mail pour activer votre compte.</p>
     <p><a href="${link}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Vérifier l'e-mail</a></p>
     <p>Ou copiez ce lien : <a href="${link}">${link}</a></p>
     <p>Ce lien expire dans <strong>24 heures</strong>.</p>
     <p>Si vous n'avez pas créé de compte BuildForU, vous pouvez ignorer cet e-mail.</p>`
  }),
  es: (name, link) => ({
    subject: "Verifica tu dirección de email en BuildForU",
    html: `<p>Hola ${name},</p>
     <p>¡Bienvenido a BuildForU! Por favor verifica tu dirección de email para activar tu cuenta.</p>
     <p><a href="${link}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Verificar email</a></p>
     <p>O copia este enlace: <a href="${link}">${link}</a></p>
     <p>Este enlace caduca en <strong>24 horas</strong>.</p>
     <p>Si no creaste una cuenta en BuildForU, puedes ignorar este correo.</p>`
  }),
  it: (name, link) => ({
    subject: "Verifica il tuo indirizzo email BuildForU",
    html: `<p>Ciao ${name},</p>
     <p>Benvenuto su BuildForU! Verifica il tuo indirizzo email per attivare il tuo account.</p>
     <p><a href="${link}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Verifica email</a></p>
     <p>Oppure copia questo link: <a href="${link}">${link}</a></p>
     <p>Questo link scade tra <strong>24 ore</strong>.</p>
     <p>Se non hai creato un account BuildForU, puoi ignorare questa email.</p>`
  }),
  ro: (name, link) => ({
    subject: "Verificați adresa de email BuildForU",
    html: `<p>Bună ${name},</p>
     <p>Bine ați venit la BuildForU! Vă rugăm să verificați adresa de email pentru a activa contul.</p>
     <p><a href="${link}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Verificați emailul</a></p>
     <p>Sau copiați acest link: <a href="${link}">${link}</a></p>
     <p>Acest link expiră în <strong>24 de ore</strong>.</p>
     <p>Dacă nu ați creat un cont BuildForU, puteți ignora acest email.</p>`
  }),
  tr: (name, link) => ({
    subject: "BuildForU e-posta adresinizi doğrulayın",
    html: `<p>Merhaba ${name},</p>
     <p>BuildForU'ya hoş geldiniz! Hesabınızı etkinleştirmek için e-posta adresinizi doğrulayın.</p>
     <p><a href="${link}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">E-postayı doğrula</a></p>
     <p>Veya bu bağlantıyı kopyalayın: <a href="${link}">${link}</a></p>
     <p>Bu bağlantı <strong>24 saat</strong> içinde geçerliliğini yitirir.</p>
     <p>Eğer BuildForU hesabı oluşturmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>`
  }),
  uk: (name, link) => ({
    subject: "Підтвердьте вашу електронну адресу BuildForU",
    html: `<p>Привіт ${name},</p>
     <p>Ласкаво просимо до BuildForU! Будь ласка, підтвердьте свою електронну адресу для активації облікового запису.</p>
     <p><a href="${link}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Підтвердити e-mail</a></p>
     <p>Або скопіюйте це посилання: <a href="${link}">${link}</a></p>
     <p>Посилання дійсне протягом <strong>24 годин</strong>.</p>
     <p>Якщо ви не реєструвалися в BuildForU, просто проігноруйте цей лист.</p>`
  })
};

// ---------------------------------------------------------------------------
// Password reset email
// ---------------------------------------------------------------------------

const passwordResetTemplates: Record<Locale, (link: string) => { subject: string; html: string }> = {
  en: (link) => ({
    subject: "Reset your BuildForU password",
    html: `<p>You requested a password reset for your BuildForU account.</p>
     <p>Click the link below to set a new password. This link expires in <strong>30 minutes</strong>.</p>
     <p><a href="${link}">${link}</a></p>
     <p>If you did not request this, you can safely ignore this email.</p>`
  }),
  pl: (link) => ({
    subject: "Resetowanie hasła BuildForU",
    html: `<p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta BuildForU.</p>
     <p>Kliknij poniższy link, aby ustawić nowe hasło. Link wygasa po <strong>30 minutach</strong>.</p>
     <p><a href="${link}">${link}</a></p>
     <p>Jeśli to nie Ty wysłałeś tę prośbę, możesz zignorować tę wiadomość.</p>`
  }),
  de: (link) => ({
    subject: "BuildForU-Passwort zurücksetzen",
    html: `<p>Sie haben eine Anfrage zum Zurücksetzen Ihres BuildForU-Passworts gestellt.</p>
     <p>Klicken Sie auf den Link unten, um ein neues Passwort festzulegen. Der Link läuft in <strong>30 Minuten</strong> ab.</p>
     <p><a href="${link}">${link}</a></p>
     <p>Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>`
  }),
  fr: (link) => ({
    subject: "Réinitialisation de votre mot de passe BuildForU",
    html: `<p>Vous avez demandé la réinitialisation du mot de passe de votre compte BuildForU.</p>
     <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans <strong>30 minutes</strong>.</p>
     <p><a href="${link}">${link}</a></p>
     <p>Si vous n'avez pas effectué cette demande, vous pouvez ignorer cet e-mail.</p>`
  }),
  es: (link) => ({
    subject: "Restablece tu contraseña de BuildForU",
    html: `<p>Has solicitado restablecer la contraseña de tu cuenta BuildForU.</p>
     <p>Haz clic en el enlace de abajo para establecer una nueva contraseña. Este enlace caduca en <strong>30 minutos</strong>.</p>
     <p><a href="${link}">${link}</a></p>
     <p>Si no realizaste esta solicitud, puedes ignorar este correo.</p>`
  }),
  it: (link) => ({
    subject: "Reimposta la tua password BuildForU",
    html: `<p>Hai richiesto il ripristino della password del tuo account BuildForU.</p>
     <p>Clicca sul link qui sotto per impostare una nuova password. Questo link scade tra <strong>30 minuti</strong>.</p>
     <p><a href="${link}">${link}</a></p>
     <p>Se non hai effettuato questa richiesta, puoi ignorare questa email.</p>`
  }),
  ro: (link) => ({
    subject: "Resetați parola BuildForU",
    html: `<p>Ați solicitat resetarea parolei contului dvs. BuildForU.</p>
     <p>Faceți clic pe linkul de mai jos pentru a seta o nouă parolă. Acest link expiră în <strong>30 de minute</strong>.</p>
     <p><a href="${link}">${link}</a></p>
     <p>Dacă nu ați solicitat aceasta, puteți ignora acest email.</p>`
  }),
  tr: (link) => ({
    subject: "BuildForU şifrenizi sıfırlayın",
    html: `<p>BuildForU hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
     <p>Yeni şifre belirlemek için aşağıdaki bağlantıya tıklayın. Bu bağlantı <strong>30 dakika</strong> içinde geçerliliğini yitirir.</p>
     <p><a href="${link}">${link}</a></p>
     <p>Eğer bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>`
  }),
  uk: (link) => ({
    subject: "Скидання пароля BuildForU",
    html: `<p>Ми отримали запит на скидання пароля для вашого облікового запису BuildForU.</p>
     <p>Натисніть на посилання нижче, щоб встановити новий пароль. Посилання дійсне протягом <strong>30 хвилин</strong>.</p>
     <p><a href="${link}">${link}</a></p>
     <p>Якщо ви не надсилали цей запит, просто проігноруйте цей лист.</p>`
  })
};

// ---------------------------------------------------------------------------
// Password changed email
// ---------------------------------------------------------------------------

const passwordChangedTemplates: Record<Locale, (name: string) => { subject: string; html: string }> = {
  en: (name) => ({
    subject: "Your BuildForU password was changed",
    html: `<p>Hi ${name},</p>
     <p>Your BuildForU password was successfully changed.</p>
     <p>If you did not make this change, contact support immediately and secure your account.</p>`
  }),
  pl: (name) => ({
    subject: "Hasło BuildForU zostało zmienione",
    html: `<p>Cześć ${name},</p>
     <p>Hasło do Twojego konta BuildForU zostało pomyślnie zmienione.</p>
     <p>Jeśli to nie Ty dokonałeś tej zmiany, skontaktuj się natychmiast z pomocą techniczną i zabezpiecz swoje konto.</p>`
  }),
  de: (name) => ({
    subject: "Ihr BuildForU-Passwort wurde geändert",
    html: `<p>Hallo ${name},</p>
     <p>Ihr BuildForU-Passwort wurde erfolgreich geändert.</p>
     <p>Falls Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie sofort den Support und sichern Sie Ihr Konto.</p>`
  }),
  fr: (name) => ({
    subject: "Votre mot de passe BuildForU a été modifié",
    html: `<p>Bonjour ${name},</p>
     <p>Votre mot de passe BuildForU a été modifié avec succès.</p>
     <p>Si vous n'avez pas effectué ce changement, contactez immédiatement le support et sécurisez votre compte.</p>`
  }),
  es: (name) => ({
    subject: "Tu contraseña de BuildForU ha sido cambiada",
    html: `<p>Hola ${name},</p>
     <p>Tu contraseña de BuildForU fue cambiada exitosamente.</p>
     <p>Si no realizaste este cambio, contacta al soporte inmediatamente y asegura tu cuenta.</p>`
  }),
  it: (name) => ({
    subject: "La tua password BuildForU è stata modificata",
    html: `<p>Ciao ${name},</p>
     <p>La tua password BuildForU è stata modificata con successo.</p>
     <p>Se non hai effettuato questa modifica, contatta immediatamente il supporto e metti al sicuro il tuo account.</p>`
  }),
  ro: (name) => ({
    subject: "Parola dvs. BuildForU a fost schimbată",
    html: `<p>Bună ${name},</p>
     <p>Parola contului dvs. BuildForU a fost schimbată cu succes.</p>
     <p>Dacă nu ați efectuat această modificare, contactați imediat asistența și securizați-vă contul.</p>`
  }),
  tr: (name) => ({
    subject: "BuildForU şifreniz değiştirildi",
    html: `<p>Merhaba ${name},</p>
     <p>BuildForU şifreniz başarıyla değiştirildi.</p>
     <p>Eğer bu değişikliği siz yapmadıysanız, hemen destek ekibiyle iletişime geçin ve hesabınızı güvence altına alın.</p>`
  }),
  uk: (name) => ({
    subject: "Ваш пароль BuildForU було змінено",
    html: `<p>Привіт ${name},</p>
     <p>Пароль вашого облікового запису BuildForU було успішно змінено.</p>
     <p>Якщо ви не робили цих змін, негайно зверніться до підтримки та захистіть свій обліковий запис.</p>`
  })
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(to: string, token: string, lang?: string): Promise<void> {
  const locale = resolveLocale(lang);
  const link = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const { subject, html } = passwordResetTemplates[locale](link);
  await sendMail(to, subject, html);
}

export async function sendPasswordChangedEmail(to: string, name: string, lang?: string): Promise<void> {
  const locale = resolveLocale(lang);
  const safeName = escapeHtml(name);
  const { subject, html } = passwordChangedTemplates[locale](safeName);
  await sendMail(to, subject, html);
}

export async function sendEmailVerificationEmail(to: string, name: string, token: string, lang?: string): Promise<void> {
  const locale = resolveLocale(lang);
  const safeName = escapeHtml(name);
  const link = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
  const { subject, html } = verificationTemplates[locale](safeName, link);
  await sendMail(to, subject, html);
}
