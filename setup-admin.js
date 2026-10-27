/**
 * PallaviTraders — Admin Account Setup Script
 * ============================================
 * Run this script ONCE from a trusted machine (never deploy it to the web).
 * It creates the admin Firestore document that grants access to the admin panel.
 *
 * Prerequisites:
 *   1. Node.js installed
 *   2. firebase-admin installed: npm install firebase-admin
 *   3. A Firebase service account JSON downloaded from:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *
 * Usage:
 *   node setup-admin.js <admin-email> <path-to-service-account.json>
 *
 * Example:
 *   node setup-admin.js chetan@example.com ./serviceAccountKey.json
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");

async function setupAdmin(adminEmail, serviceAccountPath) {
  if (!adminEmail || !serviceAccountPath) {
    console.error("Usage: node setup-admin.js <admin-email> <path-to-service-account.json>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(serviceAccountPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Service account file not found: ${resolvedPath}`);
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));

  initializeApp({ credential: cert(serviceAccount) });

  const auth = getAuth();
  const db = getFirestore();

  // 1. Look up the user by email (they must already exist in Firebase Auth)
  console.log(`\nLooking up user: ${adminEmail} …`);
  let user;
  try {
    user = await auth.getUserByEmail(adminEmail);
  } catch (err) {
    console.error(`\n❌ User not found: ${adminEmail}`);
    console.error("  Create the account first in Firebase Console → Authentication → Users → Add user");
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.uid} (${user.email})`);

  // 2. Write the admin document to Firestore
  // The Firestore security rules check: exists(/databases/(default)/documents/admins/<uid>)
  console.log(`\nGranting admin access in Firestore …`);
  await db.collection("admins").doc(user.uid).set({
    email: user.email,
    grantedAt: new Date().toISOString(),
    grantedBy: "setup-admin script",
  });

  console.log(`✅ Firestore admins/${user.uid} document created.`);

  // 3. Verification
  const snapshot = await db.collection("admins").doc(user.uid).get();
  if (snapshot.exists) {
    console.log("\n🎉 Admin setup complete!");
    console.log(`   Email : ${user.email}`);
    console.log(`   UID   : ${user.uid}`);
    console.log("\nNext steps:");
    console.log("  1. Make sure Email/Password sign-in is enabled in Firebase Console → Authentication → Sign-in method");
    console.log("  2. Deploy Firestore and Storage rules: firebase deploy --only firestore:rules,storage");
    console.log("  3. Log in at https://your-site.web.app/admin/login");
  } else {
    console.error("❌ Firestore write may have failed. Check Firebase Console.");
  }
}

const [, , email, serviceAccountPath] = process.argv;
setupAdmin(email, serviceAccountPath).catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
