import {
  type BuildRecord,
  type BuildStatus,
  type ApiResponse,
  isValidStatus,
  generateTrackingCode,
  generatePickupCode,
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

interface Env {
  BUILD_TRACKER: KVNamespace;
  ADMIN_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // POST /api/track — create a new build record (called from submit form worker)
      if (request.method === "POST" && path === "/api/track") {
        return handleCreate(request, env);
      }

      // GET /api/track/:code — lookup a build by tracking code
      if (request.method === "GET" && path.startsWith("/api/track/")) {
        const code = path.replace("/api/track/", "").toUpperCase();
        return handleLookup(code, env);
      }

      // PATCH /api/track/:code — update build status (admin only)
      if (request.method === "PATCH" && path.startsWith("/api/track/")) {
        const adminKey = request.headers.get("x-admin-key");
        if (!adminKey || adminKey !== env.ADMIN_KEY) {
          return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
        }
        const code = path.replace("/api/track/", "").toUpperCase();
        return handleUpdate(request, code, env);
      }

      // GET /api/admin/builds — list all active builds (admin only)
      if (request.method === "GET" && path === "/api/admin/builds") {
        const adminKey = request.headers.get("x-admin-key");
        if (!adminKey || adminKey !== env.ADMIN_KEY) {
          return jsonResponse({ ok: false, error: "Unauthorized" }, 403);
        }
        return handleListBuilds(env);
      }

      return jsonResponse({ ok: false, error: "Not found" }, 404);
    } catch (error) {
      console.error("Tracker worker error:", error);
      return jsonResponse({ ok: false, error: "Internal error" }, 500);
    }
  },
};

async function handleCreate(request: Request, env: Env): Promise<Response> {
  const data = (await request.json()) as Partial<BuildRecord>;

  const trackingCode = generateTrackingCode();
  const pickupCode = generatePickupCode();
  const now = new Date().toISOString();

  const record: BuildRecord = {
    trackingCode,
    customerName: data.customerName || "Unknown",
    customerEmail: data.customerEmail || "",
    customerPhone: data.customerPhone || "",
    services: data.services || [],
    status: "received",
    timeline: [
      {
        status: "received",
        timestamp: now,
        note: "Parts received at Bushnell's Basin bench",
      },
    ],
    dropoffDate: now.split("T")[0],
    pickupCode,
    partsValue: data.partsValue || "",
    notes: data.notes || "",
    createdAt: now,
  };

  await env.BUILD_TRACKER.put(kvKey(trackingCode), JSON.stringify(record), {
    metadata: { createdAt: now, customerName: record.customerName },
  });

  return jsonResponse({
    ok: true,
    data: {
      trackingCode,
      pickupCode,
    },
  }, 201);
}

async function handleLookup(code: string, env: Env): Promise<Response> {
  const raw = await env.BUILD_TRACKER.get(kvKey(code));
  if (!raw) {
    return jsonResponse({ ok: false, error: "Build not found" }, 404);
  }

  const record: BuildRecord = JSON.parse(raw);

  // Return public-facing data only (no admin fields)
  return jsonResponse({
    ok: true,
    data: {
      trackingCode: record.trackingCode,
      customerName: record.customerName,
      services: record.services,
      status: record.status,
      timeline: record.timeline,
      partsValue: record.partsValue,
      createdAt: record.createdAt,
    },
  });
}

async function handleUpdate(request: Request, code: string, env: Env): Promise<Response> {
  const raw = await env.BUILD_TRACKER.get(kvKey(code));
  if (!raw) {
    return jsonResponse({ ok: false, error: "Build not found" }, 404);
  }

  const record: BuildRecord = JSON.parse(raw);
  const data = (await request.json()) as { status?: string; note?: string };

  if (!data.status || !isValidStatus(data.status)) {
    return jsonResponse({ ok: false, error: `Invalid status. Must be one of: ${BUILD_STATUSES.join(", ")}` }, 400);
  }

  const newStatus = data.status as BuildStatus;
  const currentIdx = BUILD_STATUSES.indexOf(record.status);
  const newIdx = BUILD_STATUSES.indexOf(newStatus);

  // Allow moving forward or backward (admin flexibility)
  record.status = newStatus;
  record.timeline.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: data.note || `Status changed to ${STATUS_LABELS[newStatus]}`,
  });

  await env.BUILD_TRACKER.put(kvKey(code), JSON.stringify(record));

  return jsonResponse({
    ok: true,
    data: {
      trackingCode: record.trackingCode,
      status: record.status,
      timeline: record.timeline,
    },
  });
}

async function handleListBuilds(env: Env): Promise<Response> {
  const list = await env.BUILD_TRACKER.list({ prefix: KV_KEY_PREFIX });
  const builds: Partial<BuildRecord>[] = [];

  for (const key of list.keys) {
    const raw = await env.BUILD_TRACKER.get(key.name);
    if (raw) {
      const record: BuildRecord = JSON.parse(raw);
      builds.push({
        trackingCode: record.trackingCode,
        customerName: record.customerName,
        services: record.services,
        status: record.status,
        createdAt: record.createdAt,
      });
    }
  }

  // Sort by most recent first
  builds.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

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