import { 
  type BuildRecord, 
  type ApiResponse, 
  generateTrackingCode, 
  kvKey, 
  KV_KEY_PREFIX, 
  STATUS_LABELS, 
} from "./lib/build-tracker";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PATCH",
  "Access-Control-Allow-Headers": "Content-Type, Accept, x-admin-key",
};

export interface BuildTrackerEnv {
  BUILD_TRACKER: {
    get(key: string): Promise<string | null>;
    put(
      key: string,
      value: string,
      options?: { metadata?: Record<string, unknown> },
    ): Promise<void>;
    list(options: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
  };
  ADMIN_KEY?: string;
}

export async function handleTrackerRequest(
  request: Request,
  env: BuildTrackerEnv,
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  try {
    const adminKey = request.headers.get("x-admin-key");
    const isAuthed = adminKey && adminKey === env.ADMIN_KEY;

    // 1. POST /api/track
    if (method === "POST" && pathname === "/api/track") {
      if (!isAuthed) return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
      return handleCreate(request, env);
    }

    // 2. GET /api/admin/builds
    if (method === "GET" && pathname === "/api/admin/builds") {
      if (!isAuthed) return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
      return handleListBuilds(env);
    }

    // Dynamic Tracking Path Processing
if (pathname.startsWith("/api/track/")) {
  const remainingPath = pathname.substring("/api/track/".length);
  const parts = remainingPath.split("/").filter(Boolean);

  // Handle Lookup: GET /api/track/:code
  if (parts.length === 1 && method === "GET") {
    const trackingCode = parts[0].toUpperCase(); // 👈 Use index 0 explicitly
    return handleLookup(trackingCode, env);
  }

  // Handle Advance: POST /api/track/:code/advance
  if (parts.length === 2 && parts[1].toLowerCase() === "advance" && method === "POST") { // 👈 Read index 1
    if (!isAuthed) return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
    
    const trackingCode = parts[0].toUpperCase(); // 👈 Extract index 0 ("CCL-WHKV")
    return handleAdvance(trackingCode, env);
  }
}

    // Explicit router error that outputs exactly what path was received
    return jsonResponse({ ok: false, error: `Route not found: ${method} ${pathname}` }, 404);
  } catch (error) {
    console.error("Tracker worker error:", error);
    return jsonResponse({ ok: false, error: "Internal error" }, 500);
  }
}

async function handleCreate(request: Request, env: BuildTrackerEnv): Promise<Response> {
  const data = (await request.json()) as Partial<BuildRecord>;
  const trackingCode = generateTrackingCode();
  const now = new Date().toISOString();

  const record: BuildRecord = {
    trackingCode,
    customerName: data.customerName || "Unknown",
    services: data.services || [],
    status: "received",
    timeline: [
      {
        status: "received",
        timestamp: now,
        note: "Build initiated in admin dashboard",
      },
    ],
    createdAt: now,
  };

  await env.BUILD_TRACKER.put(kvKey(trackingCode), JSON.stringify(record), {
    metadata: {
      createdAt: now,
      customerName: record.customerName,
      status: "received",
    },
  });

  return jsonResponse({ ok: true, data: record }, 201);
}

async function handleLookup(code: string, env: BuildTrackerEnv): Promise<Response> {
  const raw = await env.BUILD_TRACKER.get(kvKey(code));
  if (!raw) {
    return jsonResponse({ ok: false, error: "Build not found" }, 404);
  }
  const record: BuildRecord = JSON.parse(raw);
  return jsonResponse({ ok: true, data: record });
}

async function handleAdvance(code: string, env: BuildTrackerEnv): Promise<Response> {
  const raw = await env.BUILD_TRACKER.get(kvKey(code));
  if (!raw) {
    return jsonResponse({ ok: false, error: "Build not found" }, 404);
  }

  const record: BuildRecord = JSON.parse(raw);

  // Define our 3 distinct tracking workflows
  const SYSTEM_BUILD_TRACK = ["received", "parts_ordered", "parts_received", "assembly", "validation", "ready_for_pickup", "completed"];
  const REPAIR_TRACK = ["received", "diagnosis", "parts_ordered", "repairing", "validation", "ready_for_pickup", "completed"];
  const TUNING_TRACK = ["received", "profiling", "modification", "benchmarking", "thermal_testing", "ready_for_pickup", "completed"];

  // Inspect the record's services array to calculate the correct track
  let track = SYSTEM_BUILD_TRACK; // Default fallback
  const servicesJoined = (record.services || []).join(", ").toLowerCase();

  if (
    servicesJoined.includes("diagnostic") || 
    servicesJoined.includes("repair") || 
    servicesJoined.includes("refresh") || 
    servicesJoined.includes("wipe")
  ) {
    track = REPAIR_TRACK;
  } else if (
    servicesJoined.includes("software") || 
    servicesJoined.includes("thermal") || 
    servicesJoined.includes("bench") || 
    servicesJoined.includes("overclock") ||
    servicesJoined.includes("tuning")
  ) {
    track = TUNING_TRACK;
  }

  // Find where we are and step forward cleanly
  const currentIndex = track.indexOf(record.status);
  if (currentIndex === -1 || currentIndex >= track.length - 1) {
    return jsonResponse({ ok: false, error: "Build is already completed or has an invalid status" }, 400);
  }

  const newStatus = track[currentIndex + 1];

  record.status = newStatus as BuildRecord["status"];
  record.timeline.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: `Status changed to ${STATUS_LABELS[newStatus] || newStatus}`.trim(),
  });

  // Save back to KV using a minimized shallow metadata block to avoid the 1024-byte limit
  await env.BUILD_TRACKER.put(kvKey(code), JSON.stringify(record), {
    metadata: {
      createdAt: record.createdAt,
      customerName: record.customerName,
      status: newStatus,
    },
  });

  return jsonResponse({ ok: true, data: record });
}

async function handleListBuilds(env: BuildTrackerEnv): Promise<Response> {
  const listResult = await env.BUILD_TRACKER.list({ prefix: KV_KEY_PREFIX });
  const loadPromises = listResult.keys.map(async (key) => {
    const rawData = await env.BUILD_TRACKER.get(key.name);
    if (!rawData) return null;
    try {
      return JSON.parse(rawData) as BuildRecord;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(loadPromises);
  const builds = results.filter((record): record is BuildRecord => record !== null);
  
  builds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return jsonResponse({ ok: true, data: builds });
}

function jsonResponse(data: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}
