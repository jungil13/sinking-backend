// src/controllers/paymentController.js
import axios from "axios";
import crypto from "crypto";
import pool from "../config/db.js"; // Your MySQL2 pool

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const WEBHOOK_SECRET_KEY = process.env.WEBHOOK_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Add validation for required environment variables
if (!PAYMONGO_SECRET_KEY) {
  console.warn('⚠️ PAYMONGO_SECRET_KEY not set in environment variables');
}

const paymongoApi = axios.create({
  baseURL: "https://api.paymongo.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${PAYMONGO_SECRET_KEY ? Buffer.from(PAYMONGO_SECRET_KEY).toString("base64") : ''}`,
  },
});

export const createPaymongoSource = async (req, res) => {
  try {
    const { amount, type } = req.body; // amount already in centavos
    const userID = req.user?.id; // comes from auth middleware

    if (!amount || !type) {
      return res.status(400).json({
        success: false,
        message: "Amount and type are required.",
      });
    }

    const response = await paymongoApi.post("/sources", {
      data: {
        attributes: {
          amount,
          currency: "PHP",
          type, // gcash, grab_pay, paymaya
          redirect: {
            success: `${FRONTEND_URL}/payment-success`,
            failed: `${FRONTEND_URL}/payment-failed`,
          },
          metadata: {
            userID: userID ? String(userID) : "", // ✅ must be string
          },
        },
      },
    });

    const checkoutUrl = response.data.data.attributes.redirect.checkout_url;

    res.json({
      success: true,
      checkoutUrl,
    });
  } catch (err) {
    console.error("PayMongo Source Error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "PayMongo source creation failed.",
      error: err.response?.data || err.message,
    });
  }
};

export const handlePaymongoWebhook = async (req, res) => {
  try {
    const signatureHeader = req.headers["paymongo-signature"];
    if (!signatureHeader) {
      console.error("❌ Missing PayMongo signature header");
      return res.status(400).send("Missing signature header");
    }

    const [tPart, v1Part] = signatureHeader.split(",");
    const timestamp = tPart.split("=")[1];
    const signature = v1Part.split("=")[1];

    const rawBody = req.body.toString("utf8");
    const signedPayload = `${timestamp}.${rawBody}`;

    const computed = crypto
      .createHmac("sha256", WEBHOOK_SECRET_KEY)
      .update(signedPayload)
      .digest("hex");

    if (computed !== signature) {
      console.error("❌ Invalid PayMongo webhook signature");
      return res.status(401).send("Invalid signature");
    }

    const payload = JSON.parse(rawBody);
    const event = payload.data;
    const eventType = event.type;
    const eventData = event.attributes;

    console.log("✅ Verified webhook:", eventType);

    if (eventType === "source.chargeable") {
      const source = eventData;
      const userID = source.metadata?.userID ? parseInt(source.metadata.userID) : null;

      await pool.query(
        `INSERT INTO contributions 
          (userID, amount, paymentMethod, status, referenceNo, paymongo_source_id, contributionDate, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [
          userID,
          source.amount / 100, // convert centavos → pesos
          source.type,         
          "pending",
          source.id,           // store as referenceNo (legacy)
          source.id            // also save in paymongo_source_id
        ]
      );

      console.log("💾 Contribution inserted (pending)", source.id);
    }

    if (eventType === "payment.paid") {
      const payment = eventData;
      const paymentId = payment.id;
      const sourceId = payment.source?.id;
      const statusDetail = payment.status;

      if (sourceId) {
        await pool.query(
          `UPDATE contributions 
             SET status = 'confirmed',
                 status_detail = ?,
                 paymongo_payment_id = ?,
                 updatedAt = NOW()
           WHERE paymongo_source_id = ?`,
          [statusDetail, paymentId, sourceId]
        );

        console.log("✅ Contribution confirmed:", sourceId);
      }
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook error:", err.message, err.stack);
    res.status(500).send("Webhook processing failed");
  }
};
