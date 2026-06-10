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
  "customer-state"?: string;
  "estimate-subtotal"?: string;
  "estimate-tax"?: string;
  "estimate-total"?: string;
  "itx-sff-case"?: string;
  "non-modular-psu"?: string;
  "form-type"?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

const TURNSTILE_SECRET = "0x4AAAAAADbwqsdyK5cnRCevTba-027DPM0";

export interface SubmitFormEnv {
  RESEND_API_KEY?: string;
  ADMIN_KEY?: string;
  TRACKER_API?: string;
}

export async function handleSubmitRequest(request: Request, env: SubmitFormEnv): Promise<Response> {
  const TRACKER_API = env.TRACKER_API || "";
  const trackerOrigin = TRACKER_API ? TRACKER_API.replace(/\/+$/, "") : new URL(request.url).origin;

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
      return new Response(
        JSON.stringify({ error: "Missing security token. Please refresh and try again." }),
        {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    const verifyResp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET,
        response: turnstileToken,
      }),
    });

    const verifyResult = (await verifyResp.json()) as { success: boolean };

    if (!verifyResult.success) {
      return new Response(
        JSON.stringify({ error: "Spam detected or token expired. Request blocked." }),
        {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Turnstile passed — proceed to send email
    const formType = data["form-type"] || "standard";
    const formTypeLabel =
      formType === "service-repair" ? "🔧 Service & Repair Request" :
      formType === "build-known-parts" ? "🖥️ Build Request (Known Parts)" :
      formType === "build-consultation" ? "💡 Build Consultation Request" :
      "📝 Lab Request";

    let extraRows = "";
    if (data["itx-sff-case"]) {
      extraRows += `<tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">ITX / SFF Case</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["itx-sff-case"]}</td></tr>`;
    }
    if (data["non-modular-psu"]) {
      extraRows += `<tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Non-Modular PSU</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["non-modular-psu"]}</td></tr>`;
    }

    const htmlBody = `
        <h2 style="color:#2563eb;">${formTypeLabel}</h2>
        <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Form Type</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${formType}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["customer-name"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["customer-phone"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["customer-email"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Parts Value</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["parts-value"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Estimated Tax</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["estimate-tax"] || "$0.00"}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Estimated Total</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["estimate-total"] || data["parts-value"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">PCPartPicker URL</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["pcpartpicker-url"]}</td></tr>
          ${extraRows}
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Project / Issues</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["symptoms-details"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Selected Services</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["selected-services"]}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;color:#374151;">Payment Terms</td><td style="padding:8px 12px;border-bottom:1px solid #ddd;">${data["payment-terms"]}</td></tr>
        </table>
      `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Custom Core Labs <cdwojick@gmail.com>",
        to: "cdwojick@gmail.com",
        subject: `New Lab Request — ${data["customer-name"]}`,
        html: htmlBody,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // After successful email, create a build tracking record
    const servicesList = (data["selected-services"] || "None selected").split(", ").filter(Boolean);
    // Add form type info to services for reference
    if (formType && !servicesList.includes(formType)) {
      servicesList.unshift(`[${formType}]`);
    }

    const trackerPayload = {
      customerName: data["customer-name"],
      customerEmail: data["customer-email"],
      customerPhone: data["customer-phone"],
      services: servicesList,
      partsValue: data["parts-value"] || "",
      estimateSubtotal: data["estimate-subtotal"] || "",
      taxAmount: data["estimate-tax"] || "",
      totalWithTax: data["estimate-total"] || "",
      customerState: data["customer-state"] || "",
    };

    const trackerRes = await fetch(`${trackerOrigin}/api/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": env.ADMIN_KEY || "",
      },
      body: JSON.stringify(trackerPayload),
    });

    const trackerData = await trackerRes.json();
    const trackingCode = trackerData?.data?.trackingCode;

    return new Response(
      JSON.stringify({
        ok: true,
        trackingCode: trackingCode || null,
        trackingUrl: trackingCode ? `${trackerOrigin}/track/${trackingCode}` : null,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Worker error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}

export default {
  async fetch(request: Request, env: SubmitFormEnv): Promise<Response> {
    return handleSubmitRequest(request, env);
  },
};
