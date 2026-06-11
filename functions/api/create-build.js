import { trackerFetch, TRACKER_API_BASE } from "../../src/lib/tracker-api";

// Note: This is a Node.js script, not a client-side script.

export async function onRequest(context) {
  // Log the request method and URL
  console.log(`[onRequest] Method: ${context.request.method}, URL: ${context.request.url}`);

  // Ensure this is a POST request
  if (context.request.method !== "POST") {
    console.log(`[onRequest] Invalid method: ${context.request.method}`);
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Extract the admin key from the request headers
  const adminKey = context.request.headers.get("x-admin-key");
  console.log(`[onRequest] Admin key: ${adminKey ? "present" : "missing"}`);

  // Create the tracking code and prepare build data
  const trackingCode = `CCL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  console.log(`[onRequest] Generated tracking code: ${trackingCode}`);

  try {
    const body = await context.request.json();
    console.log(`[onRequest] Request body:`, body);

    const buildData = {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      services: body.services,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    console.log(`[onRequest] Build data to be saved:`, buildData);

    // Save to KV
    await context.env.BUILD_TRACKER.put(trackingCode, JSON.stringify(buildData));
    console.log(`[onRequest] Successfully saved build data to KV with key: ${trackingCode}`);

    const emailResponse = await sendTrackingCodeEmail(buildData.customerEmail, trackingCode);
    console.log(`[onRequest] Email send response:`, emailResponse);

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          trackingCode,
          emailSent: emailResponse.success,
        },
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(`[onRequest] Error:`, e);
    return new Response(
      JSON.stringify({ ok: false, error: e.message || "An unknown error occurred." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Placeholder for a function to send the tracking code to the customer
async function sendTrackingCodeEmail(customerEmail, trackingCode) {
  console.log(
    `[sendTrackingCodeEmail] Attempting to send email to: ${customerEmail} with code: ${trackingCode}`,
  );
  // In a real application, you would use an email service like SendGrid, Mailgun, etc.
  // For this example, we'll just log the action.
  console.log(`Email sent to ${customerEmail} with tracking code ${trackingCode}`);
  // Simulate a successful email dispatch
  return Promise.resolve({ success: true });
}
