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
}) => {
  const safeNumber = escapeHtml(swishNumber);
  const safeName = escapeHtml(swishName);
  const safeMessage = escapeHtml(swishMessage);
  const safeAmount = Number.isFinite(amount) ? amount.toFixed(2) : "";
  const safePerPerson = Number.isFinite(perPerson) ? perPerson.toFixed(2) : "";

  const paySection = swishLink
    ? `<a href="${escapeHtml(
        swishLink
      )}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#0b0b0b;color:#ffffff;text-decoration:none;border:1px solid #222222;">Pay with Swish</a>`
    : `<span style="color:#666666;">Open Swish and pay ${
        safePerPerson || safeAmount
      } SEK to ${safeNumber}.</span>`;

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
      <div style="margin-top:16px;">${paySection}</div>
      <p style="margin-top:16px;color:#888888;font-size:12px;">If the button does not work, open Swish manually and enter the details above.</p>
    </div>
  `;
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = Netlify.env.get("RESEND_API_KEY");
  const from = Netlify.env.get("RESEND_FROM");

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
  const swishLink = payload.swishLink || "";

  if (!recipients.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Recipients required" }),
    };
  }

  const subjectName = swishName ? ` from ${swishName}` : "";
  const subject = `Swish payment request${subjectName}`;

  const html = buildEmailHtml({
    amount,
    perPerson,
    swishNumber,
    swishName,
    swishMessage,
    swishLink,
  });

  const text = [
    "Swish payment request",
    swishName ? `From: ${swishName}` : null,
    Number.isFinite(amount) ? `Total: ${amount.toFixed(2)} SEK` : null,
    Number.isFinite(perPerson)
      ? `Split (3): ${perPerson.toFixed(2)} SEK`
      : null,
    swishNumber ? `Swish number: ${swishNumber}` : null,
    swishMessage ? `Message: ${swishMessage}` : null,
    swishLink ? `Pay: ${swishLink}` : null,
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
