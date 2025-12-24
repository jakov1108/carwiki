import "dotenv/config";
import { db } from "./db";
import { user } from "../shared/auth-schema";
import { eq } from "drizzle-orm";
import { auth } from "./auth";

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin";

  if (!email || !password) {
    console.error("Usage: npx tsx server/createAdmin.ts <email> <password> [name]");
    console.error("Example: npx tsx server/createAdmin.ts admin@autowiki.com mypassword123 Admin");
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      console.log(`User with email ${email} already exists. Updating role to admin...`);
      await db.update(user).set({ role: "admin" }).where(eq(user.email, email));
      console.log(`✅ User ${email} is now an admin!`);
      process.exit(0);
    }

    // Use Better Auth API to create user with proper password hashing
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!result || result.error) {
      console.error("Failed to create user:", result?.error);
      process.exit(1);
    }

    // Update role to admin
    await db.update(user).set({ role: "admin" }).where(eq(user.email, email));

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: admin`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
