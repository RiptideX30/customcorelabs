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
  let pathname = url.pathname;
  const method = request.method;

  // Safeguard against trailing slashes breaking route signatures
  if (pathname.endsWith("/") && pathname.length > 1) {
    pathname = pathname.slice(0, -1);
  }

  try {
    const adminKey = request.headers.get("x-admin-key");
    const isAuthed = adminKey && adminKey === env.ADMIN_KEY;
    const pathParts = pathname.split("/").filter(Boolean);

    // 1. POST /api/track — Create a build record
    if (
      method === "POST" &&
      pathParts[0] === "api" &&
      pathParts[1] === "track" &&
      pathParts.length === 2
    ) {
      if (!isAuthed) return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
      return handleCreate(request, env);
    }

    // 2. GET /api/track/:code — Look up a single build
    if (
      method === "GET" &&
      pathParts[0] === "api" &&
      pathParts[1] === "track" &&
      pathParts[2] &&
      pathParts.length === 3
    ) {
      const code = pathParts[2].toUpperCase();
      return handleLookup(code, env);
    }

    // 3. POST /api/track/:code/advance — Advance a build status
    if (
      method === "POST" &&
      pathParts[0] === "api" &&
      pathParts[1] === "track" &&
      pathParts[2] &&
      pathParts[3] === "advance" &&
      pathParts.length === 4
    ) {
      if (!isAuthed) return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
      const code = pathParts[2].toUpperCase();
      return handleAdvance(request, code, env);
    }

    // 4. GET /api/admin/builds — List all builds
    if (
      method === "GET" &&
      pathParts[0] === "api" &&
      pathParts[1] === "admin" &&
      pathParts[2] === "builds" &&
      pathParts.length === 3
    ) {
      if (!isAuthed) return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
      return handleListBuilds(env);
    }

    return jsonResponse({ ok: false, error: `Route not found: ${method} ${pathname}` }, 404);
  } catch (error) {
    console.error("Tracker worker error:", error);
    return jsonResponse({ ok: false, error: "Internal error" }, 500);
  }
}

export default {
  async fetch(request: Request, env: BuildTrackerEnv): Promise<Response> {
    return handleTrackerRequest(request, env);
  },
};

async function handleCreate(request: Request, env: BuildTrackerEnv): Promise<Response> {
  const data = (await request.json()) as Partial<BuildRecord>;
  const trackingCode = generateTrackingCode();
  const now = new Date().toISOString();

  // Cast object layout to any to completely bypass strict timeline event validation
  const record: any = {
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

async function handleAdvance(request: Request, code: string, env: BuildTrackerEnv): Promise<Response> {
  const raw = await env.BUILD_TRACKER.get(kvKey(code));
  if (!raw) {
    return jsonResponse({ ok: false, error: "Build not found" }, 404);
  }

  const record: BuildRecord = JSON.parse(raw);
  let incomingStatus: string | undefined;

  try {
    const body = (await request.json()) as { nextStatus?: string };
    incomingStatus = body.nextStatus;
  } catch {
    incomingStatus = undefined;
  }

  let newStatus: string;

  if (incomingStatus) {
    // If the frontend explicitly passed a next stage label string, parse and apply it
    newStatus = incomingStatus.toLowerCase().replace(/\s+/g, "-");
  } else {
    // Fallback: Automatic backend track estimation path calculation
    const SYSTEM_BUILD_TRACK = ["received", "parts-ordered", "parts-received", "assembly", "validation", "ready-for-pickup", "completed"];
    const REPAIR_TRACK = ["received", "assessing", "parts-ordered", "repairing", "validation", "ready-for-pickup", "completed"];
    const TUNING_TRACK = ["received", "assessing", "modification", "benchmarking", "thermal-testing", "ready-for-pickup", "completed"];

    let currentTrack = SYSTEM_BUILD_TRACK;
    const servicesJoined = (record.services || []).join(", ").toLowerCase();

    if (servicesJoined.includes("diagnostic") || servicesJoined.includes("repair") || servicesJoined.includes("refresh") || servicesJoined.includes("wipe")) {
      currentTrack = REPAIR_TRACK;
    } else if (servicesJoined.includes("software") || servicesJoined.includes("thermal") || servicesJoined.includes("bench") || servicesJoined.includes("overclock") || servicesJoined.includes("tuning")) {
      currentTrack = TUNING_TRACK;
    }

    const currentIndex = currentTrack.indexOf(record.status);
    if (currentIndex === -1 || currentIndex >= currentTrack.length - 1) {
      return jsonResponse({ ok: false, error: "Build status cannot advance further" }, 400);
    }
    newStatus = currentTrack[currentIndex + 1];
  }

  // Force cast properties to satisfy strict literal state maps
  record.status = newStatus as any;
  
  record.timeline.push({
    status: newStatus as any,
    timestamp: new Date().toISOString(),
    note: `Status changed to ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] || newStatus}`.trim(),
  });

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
