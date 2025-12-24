import "dotenv/config";
import { db } from "./db";
import { user, account } from "../shared/auth-schema";
import { eq } from "drizzle-orm";

async function deleteUser() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Usage: npx tsx server/deleteUser.ts <email>");
    process.exit(1);
  }

  const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);
  
  if (existingUser.length > 0) {
    await db.delete(account).where(eq(account.userId, existingUser[0].id));
    await db.delete(user).where(eq(user.id, existingUser[0].id));
    console.log(`Deleted user: ${email}`);
  } else {
    console.log(`User ${email} not found`);
  }
  
  process.exit(0);
}

deleteUser();
