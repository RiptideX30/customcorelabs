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

  // Authenticate the request.
  const providedKey = context.request.headers.get('x-admin-key');
  const secretAdminKey = context.env.ADMIN_KEY;

  if (!secretAdminKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Server configuration error: ADMIN_KEY not set.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (providedKey !== secretAdminKey) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create the tracking code and prepare build data
  const trackingCode = `CCL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  console.log(`[onRequest] Generated tracking code: ${trackingCode}`);

  try {
    const body = await context.request.json();
    console.log(`[onRequest] Request body:`, body);

    const buildData = {
      trackingCode: trackingCode,
      customerName: body.customerName,
      services: body.services,
      status: "pending",
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: "Build Created",
          timestamp: new Date().toISOString(),
        },
      ],
    };
    console.log(`[onRequest] Build data to be saved:`, buildData);

    // Save to KV
    await context.env.BUILD_TRACKER.put(trackingCode, JSON.stringify(buildData));
    console.log(`[onRequest] Successfully saved build data to KV with key: ${trackingCode}`);


    return new Response(
      JSON.stringify({
        ok: true,
        data: buildData,
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
