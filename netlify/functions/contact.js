import nodemailer from "nodemailer";

const requiredEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "MAIL_TO",
  "MAIL_FROM"
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const parsePayload = (event) => {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return null;
  }
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    return { statusCode: 500, headers: corsHeaders, body: "Server not configured" };
  }

  const payload = parsePayload(event);
  if (!payload) {
    return { statusCode: 400, headers: corsHeaders, body: "Invalid JSON" };
  }

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const company = String(payload.company || "").trim();
  const message = String(payload.message || "").trim();
  const website = String(payload.website || "").trim();

  if (website) {
    return { statusCode: 200, headers: corsHeaders, body: "OK" };
  }

  if (!name || !email || !message) {
    return { statusCode: 400, headers: corsHeaders, body: "Missing fields" };
  }

  if (message.length > 4000) {
    return { statusCode: 400, headers: corsHeaders, body: "Message too long" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const subject = `New inquiry from ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "-"}`,
    "Message:",
    message
  ].join("\n");

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject,
      text
    });

    return { statusCode: 200, headers: corsHeaders, body: "Sent" };
  } catch (error) {
    return { statusCode: 500, headers: corsHeaders, body: "Send failed" };
  }
};
