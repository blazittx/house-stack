const escapeHtml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const buildEmailHtml = ({
  amount,
  perPerson,
  swishNumber,
  swishName,
  swishMessage,
  swishLink,
  requestId,
  qrImageBase64,
}) => {
  const safeNumber = escapeHtml(swishNumber);
  const safeName = escapeHtml(swishName);
  const safeMessage = escapeHtml(swishMessage);
  const safeAmount = Number.isFinite(amount) ? amount.toFixed(2) : "";
  const safePerPerson = Number.isFinite(perPerson) ? perPerson.toFixed(2) : "";

  const qrSection = qrImageBase64
    ? `<div style="margin-top:16px;text-align:center;">
        <img src="data:image/png;base64,${qrImageBase64}" alt="Swish QR code" width="220" height="220" style="display:inline-block;border:1px solid #eeeeee;border-radius:12px;"/>
        <div style="margin-top:8px;color:#666666;font-size:12px;">Scan this QR code with the Swish app.</div>
      </div>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111111;">
      <h2 style="margin:0 0 8px;">Swish payment request</h2>
      <p style="margin:0 0 12px;">You have a new request from ${
        safeName || "your housemate"
      }.</p>
      <table style="border-collapse:collapse;margin:12px 0;">
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Total</td><td style="padding:4px 0;">${
          safeAmount || "—"
        } SEK</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Split (3)</td><td style="padding:4px 0;">${
          safePerPerson || "—"
        } SEK</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Swish number</td><td style="padding:4px 0;">${
          safeNumber || "—"
        }</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Message</td><td style="padding:4px 0;">${
          safeMessage || "—"
        }</td></tr>
      </table>
      ${qrSection || ""}
      <p style="margin-top:16px;color:#888888;font-size:12px;">If the QR code does not work, open Swish manually and enter the details above. ${
        swishLink ? `App link: ${escapeHtml(swishLink)}` : ""
      }${requestId ? ` Request ID: ${escapeHtml(requestId)}` : ""}</p>
    </div>
  `;
};

const https = require("https");
const { randomBytes, randomUUID } = require("crypto");

const createInstructionUUID = () =>
  randomBytes(16).toString("hex").toUpperCase();

const buildPaymentRequestLink = ({ token, callbackUrl }) => {
  const params = new URLSearchParams();
  params.set("token", token);
  if (callbackUrl) params.set("callbackurl", callbackUrl);
  return `swish://paymentrequest?${params.toString()}`;
};

const getSwishQrCodeFromToken = async ({
  token,
  size = "300",
  format = "png",
  border = "0",
}) => {
  const body = JSON.stringify({ token, size, format, border });
  const url = new URL("https://mpc.getswish.net/qrg-swish/api/v1/commerce");

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`QR request failed (${res.statusCode})`));
          }
          const buffer = Buffer.concat(chunks);
          resolve(buffer.toString("base64"));
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

const requestSwishPayment = async ({
  baseUrl,
  payeeAlias,
  callbackUrl,
  amount,
  message,
  certPfx,
  certPassphrase,
  callbackIdentifier,
}) => {
  const instructionUUID = createInstructionUUID();
  const payload = {
    payeeAlias,
    currency: "SEK",
    callbackUrl,
    amount,
    message,
    callbackIdentifier,
  };
  const body = JSON.stringify(payload);
  const url = new URL(
    `/swish-cpcapi/api/v2/paymentrequests/${instructionUUID}`,
    baseUrl
  );

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        pfx: certPfx,
        passphrase: certPassphrase,
      },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          if (res.statusCode !== 201) {
            let message = responseBody || "Swish request failed";
            try {
              const parsed = JSON.parse(responseBody || "{}");
              if (Array.isArray(parsed)) {
                message = parsed.map((item) => item.errorMessage).filter(Boolean).join(", ");
              } else if (parsed?.errorMessage) {
                message = parsed.errorMessage;
              }
            } catch (error) {
              // ignore JSON parse errors and use raw response body
            }
            return reject(new Error(message));
          }

          const token = res.headers?.paymentrequesttoken;
          if (!token) {
            return reject(new Error("Missing paymentrequesttoken header"));
          }
          resolve({
            id: instructionUUID,
            token,
            location: res.headers?.location || "",
          });
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing RESEND_API_KEY or RESEND_FROM" }),
    };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const recipients = Array.isArray(payload.recipients)
    ? payload.recipients.filter(Boolean)
    : [];
  const amount = Number.isFinite(payload.amount) ? payload.amount : null;
  const perPerson = Number.isFinite(amount) ? amount / 3 : null;
  const swishNumber = payload.swishNumber || "";
  const swishName = payload.swishName || "";
  const swishMessage = payload.swishMessage || "";

  if (!recipients.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Recipients required" }),
    };
  }

  const subjectName = swishName ? ` from ${swishName}` : "";
  const subject = `Swish payment request${subjectName}`;

  const swishBaseUrl = process.env.SWISH_BASE_URL || "https://mss.cpc.getswish.net";
  const swishPayeeAlias = process.env.SWISH_PAYEE_ALIAS || "";
  const swishCallbackUrl = process.env.SWISH_CALLBACK_URL || "";
  const swishCertPfx = process.env.SWISH_CERT_PFX_BASE64
    ? Buffer.from(process.env.SWISH_CERT_PFX_BASE64, "base64")
    : null;
  const swishCertPassphrase = process.env.SWISH_CERT_PASSPHRASE || "";

  if (!swishPayeeAlias || !swishCallbackUrl || !swishCertPfx) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "Missing SWISH_PAYEE_ALIAS, SWISH_CALLBACK_URL, or SWISH_CERT_PFX_BASE64",
      }),
    };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Amount must be a positive number" }),
    };
  }

  let paymentRequest = null;
  try {
    paymentRequest = await requestSwishPayment({
      baseUrl: swishBaseUrl,
      payeeAlias: swishPayeeAlias,
      callbackUrl: swishCallbackUrl,
      amount: amount.toFixed(2),
      message: swishMessage ? swishMessage.slice(0, 50) : "",
      certPfx: swishCertPfx,
      certPassphrase: swishCertPassphrase,
      callbackIdentifier: randomUUID(),
    });
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: error.message || "Swish request failed" }),
    };
  }

  const swishLink = buildPaymentRequestLink({
    token: paymentRequest.token,
    callbackUrl: swishCallbackUrl,
  });
  let qrImageBase64 = "";
  try {
    qrImageBase64 = await getSwishQrCodeFromToken({
      token: paymentRequest.token,
      size: "320",
      format: "png",
      border: "0",
    });
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: error.message || "Failed to generate QR" }),
    };
  }

  const html = buildEmailHtml({
    amount,
    perPerson,
    swishNumber,
    swishName,
    swishMessage,
    swishLink,
    requestId: paymentRequest.id,
    qrImageBase64,
  });

  const text = [
    "Swish payment request",
    "Scan the QR code in this email with the Swish app.",
    swishName ? `From: ${swishName}` : null,
    Number.isFinite(amount) ? `Total: ${amount.toFixed(2)} SEK` : null,
    Number.isFinite(perPerson)
      ? `Split (3): ${perPerson.toFixed(2)} SEK`
      : null,
    swishNumber ? `Swish number: ${swishNumber}` : null,
    swishMessage ? `Message: ${swishMessage}` : null,
    swishLink ? `Pay: ${swishLink}` : null,
    paymentRequest?.id ? `Request ID: ${paymentRequest.id}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
        text,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data?.message || "Resend error" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send email" }),
    };
  }
};
