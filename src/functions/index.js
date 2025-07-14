const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.cleanExpiredReserves = functions.pubsub
  .schedule("every 24 hours") // Запускать ежедневно
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const expiredReserves = await admin
      .firestore()
      .collection("reserves")
      .where("expiresAt", "<=", now)
      .where("status", "==", "active")
      .get();

    const batch = admin.firestore().batch();
    expiredReserves.docs.forEach((doc) => {
      batch.update(doc.ref, { status: "expired" });
    });

    await batch.commit();
    console.log(`Marked ${expiredReserves.size} reserves as expired`);
  });
