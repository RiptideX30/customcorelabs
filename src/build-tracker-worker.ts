import {
  type BuildRecord,
  type BuildStatus,
  type ApiResponse,
  isValidStatus,
  generateTrackingCode,
  kvKey,
  KV_KEY_PREFIX,
  BUILD_STATUSES,
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
  const path = url.pathname;
  const pathParts = path.split("/").filter(Boolean);

  try {
    const adminKey = request.headers.get("x-admin-key");
    const isAuthed = adminKey && adminKey === env.ADMIN_KEY;

    // POST /api/track — create a new build record
    if (
      request.method === "POST" &&
      pathParts[0] === "api" &&
      pathParts[1] === "track" &&
      pathParts.length === 2
    ) {
      if (!isAuthed) return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
      return handleCreate(request, env);
    }

    // GET /api/track/:code — lookup a build
    if (
      request.method === "GET" &&
      pathParts[0] === "api" &&
      pathParts[1] === "track" &&
      pathParts[2] &&
      pathParts.length === 3
    ) {
      const code = pathParts[2].toUpperCase();
      return handleLookup(code, env);
    }

    // POST /api/track/:code/advance — advance build to next status
    if (
      request.method === "POST" &&
      pathParts[0] === "api" &&
      pathParts[1] === "track" &&
      pathParts[2] &&
      pathParts[3] === "advance"
    ) {
      if (!isAuthed) return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
      const code = pathParts[2].toUpperCase();
      return handleAdvance(code, env);
    }

    // GET /api/admin/builds — list all builds
    if (
      request.method === "GET" &&
      pathParts[0] === "api" &&
      pathParts[1] === "admin" &&
      pathParts[2] === "builds"
    ) {
      if (!isAuthed) return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
      return handleListBuilds(env);
    }

    return jsonResponse({ ok: false, error: "Not found" }, 404);
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
    metadata: { createdAt: now, customerName: record.customerName, status: "received" },
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
  const currentStatusIndex = BUILD_STATUSES.indexOf(record.status);

  if (currentStatusIndex < BUILD_STATUSES.length - 1) {
    const newStatus = BUILD_STATUSES[currentStatusIndex + 1];
    record.status = newStatus;
    record.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: `Status changed to ${STATUS_LABELS[newStatus]}`.trim(),
    });

    await env.BUILD_TRACKER.put(kvKey(code), JSON.stringify(record), {
      metadata: { ...record, status: newStatus },
    });
  }

  return jsonResponse({ ok: true, data: record });
}

async function handleListBuilds(env: BuildTrackerEnv): Promise<Response> {
  const listResult = await env.BUILD_TRACKER.list({ prefix: KV_KEY_PREFIX });

  const loadPromises = listResult.keys.map(async (key) => {
    const rawData = await env.BUILD_TRACKER.get(key.name);
    // Handle cases where the record might be empty or malformed
    if (!rawData) return null;
    try {
      return JSON.parse(rawData) as BuildRecord;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(loadPromises);
  const builds = results.filter((record): record is BuildRecord => record !== null);

  // Sort by creation date in descending order
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
