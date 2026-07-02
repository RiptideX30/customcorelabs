export async function onRequest(context) {
  // Only allow GET requests for this endpoint.
  if (context.request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Get the admin key from the request headers.
  const providedKey = context.request.headers.get("x-admin-key");

  // Get the secret admin key from the environment variables.
  const secretAdminKey = context.env.ADMIN_KEY;

  // If the secret key is not set in the environment, return a server error.
  if (!secretAdminKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "Server configuration error: ADMIN_KEY not set." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // If the provided key is missing or incorrect, return an "Unauthorized" error.
  if (providedKey !== secretAdminKey) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get the BUILD_TRACKER KV namespace from the environment.
    const { BUILD_TRACKER } = context.env;

    // List all keys in the KV namespace.
    const list = await BUILD_TRACKER.list();

    // Fetch the values for all keys.
    const promises = list.keys.map((key) => BUILD_TRACKER.get(key.name));
    const values = await Promise.all(promises);

    // Parse the JSON data for each build, filtering out any null/invalid values.
    const builds = values.filter(Boolean).map((value) => JSON.parse(value));

    // Return the builds data as a JSON response.
    return new Response(JSON.stringify({ ok: true, data: builds }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // If an error occurs during the KV store operation, return a 500 server error.
    return new Response(
      JSON.stringify({ ok: false, error: e.message || "An unknown error occurred." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
