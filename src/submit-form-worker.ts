interface FormData {
  "customer-name": string;
  "customer-phone": string;
  "customer-email": string;
  "pcpartpicker-url": string;
  "parts-value": string;
  "symptoms-details": string;
  "selected-services": string;
  "payment-terms": string;
  "cf-turnstile-response": string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

const TURNSTILE_SECRET = "0x4AAAAAADbwqsdyK5cnRCevTba-027DPM0";

export default {
  async fetch(request: Request, env: { RESEND_API_KEY?: string }): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const RESEND_API_KEY = env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    try {
      const data: FormData = await request.json();

      // Verify Turnstile token
      const turnstileToken = data["cf-turnstile-response"];
      if (!turnstileToken) {
        return new Response(JSON.stringify({ error: "Missing security token. Please refresh and try again." }), {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      const verifyResp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: turnstileToken,
        }),
      });

      const verifyResult = await verifyResp.json() as { success: boolean };

      if (!verifyResult.success) {
        return new Response(JSON.stringify({ error: "Spam detected or token expired. Request blocked." }), {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      // Turnstile passed — proceed to send email
      const htmlBody = `
        <h2 style="color:#2563eb;">New Lab Request</h2>
        <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["customer-name"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["customer-phone"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["customer-email"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Parts Value</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["parts-value"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">PCPartPicker URL</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["pcpartpicker-url"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Project / Issues</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["symptoms-details"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Selected Services</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["selected-services"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Payment Terms</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["payment-terms"]}</td></tr>
        </table>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Custom Core Labs <onboarding@resend.dev>",
          to: "cdwojick@gmail.com",
          subject: `New Lab Request — ${data["customer-name"]}`,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
        return new Response(JSON.stringify({ error: "Failed to send email" }), {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
  },
};