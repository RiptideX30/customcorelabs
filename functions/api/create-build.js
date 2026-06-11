// Function to generate the random, human-friendly 4-character ID
function generateTrackingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CCL-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function onRequestPost(context) {
  try {
    // 1. Intercept the incoming customer details sent from your Admin form
    const { customerName, customerEmail } = await context.request.json();

    // 2. Run the code generator
    const newTrackingCode = generateTrackingCode();

    // 3. Create the data package to save
    const buildData = {
      name: customerName,
      email: customerEmail,
      status: "Parts Ordered",
      lastUpdated: new Date().toISOString(),
    };

    // 4. Save to Cloudflare KV
    // (context.env.BUILD_TRACKING_KV automatically routes it to your database)
    (await context.env.BUILD) - TRACKER.put(newTrackingCode, JSON.stringify(buildData));

    // 5. Send the new tracking code back to your React dashboard screen
    return new Response(JSON.stringify({ success: true, code: newTrackingCode }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
