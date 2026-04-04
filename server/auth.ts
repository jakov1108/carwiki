import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { user, session, account, verification } from "../shared/auth-schema";
import { emailVerificationTemplate, passwordResetTemplate } from "./email-templates";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable must be set");
}

// Configure Brevo email sending
const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  console.log("📧 Attempting to send email to:", to);
  console.log("📧 BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);
  console.log("📧 EMAIL_FROM:", process.env.EMAIL_FROM);
  
  if (!process.env.BREVO_API_KEY) {
    console.warn("⚠️ Brevo not configured, skipping email");
    return;
  }

  try {
    console.log("📧 Sending email via Brevo API...");
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "CarWiki",
          email: process.env.EMAIL_FROM || "noreply@carwiki.com",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Brevo email error:", error);
      throw new Error(`Failed to send email: ${response.status}`);
    }
    
    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "CarWiki - Reset lozinke",
        passwordResetTemplate(user.name, url)
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "CarWiki - Potvrdite svoj email",
        emailVerificationTemplate(user.name, url)
      );
    },
  },
  advanced: {
    disableSignUpOnEmailNotVerified: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session every day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Users can't set their own role
      },
    },
  },
  trustedOrigins: [
    process.env.APP_URL || "http://localhost:5000",
  ],
});

export type Session = typeof auth.$Infer.Session;
