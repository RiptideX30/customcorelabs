import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/api/*', cors());

const generateTrackingCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CCL-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

app.post('/api/track', async (c: Context) => {
  const { customerName, customerEmail, services } = await c.req.json();
  const trackingCode = generateTrackingCode();
  const createdAt = new Date().toISOString();

  const timeline = services.map((service: string) => ({
    service,
    status: 'pending',
  }));

  const buildData = {
    trackingCode,
    customerName,
    customerEmail,
    services,
    timeline,
    status: 'pending',
    createdAt,
  };

  // In a real application, you would save this to a database.
  // For this example, we'll just return the data.
  return c.json({ ok: true, data: buildData });
});

app.get('/api/track/:code', async (c: Context) => {
    const { code } = c.req.param();
    // In a real application, you would fetch this from a database.
    // For this example, we'll return some mock data.
    const mockData = {
        trackingCode: code,
        customerName: "John Doe",
        services: ["Basic Build", "OS Install"],
        timeline: [
            { service: "Parts Ordered", status: "completed" },
            { service: "Parts Arrived", status: "completed" },
            { service: "Assembly", status: "active" },
            { service: "OS Installation", status: "pending" },
            { service: "Final Testing", status: "pending" },
            { service: "Ready for Pickup", status: "pending" },
        ],
        status: 'building',
        createdAt: new Date().toISOString(),
    };
    return c.json({ ok: true, data: mockData });
});

app.get('/api/admin/builds', async (c: Context) => {
    // In a real application, you would fetch this from a database.
    // For this example, we'll return some mock data.
    const mockData = [
        {
            trackingCode: "CCL-ABCD",
            customerName: "John Doe",
            services: ["Basic Build", "OS Install"],
            status: 'building',
            createdAt: new Date().toISOString(),
        },
        {
            trackingCode: "CCL-EFGH",
            customerName: "Jane Smith",
            services: ["Ultimate Build", "Pro Cable Management", "BIOS / Firmware Tuning"],
            status: 'pending',
            createdAt: new Date().toISOString(),
        },
    ];
    return c.json({ ok: true, data: mockData });
});

export default app;
