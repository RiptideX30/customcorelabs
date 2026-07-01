import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { getTrackForServices } from '../lib/service-tracks';

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
  const track = getTrackForServices(services);

  const timeline = track.map((step, index) => ({
    service: step,
    status: index === 0 ? 'active' : 'pending',
  }));

  const buildData = {
    trackingCode,
    customerName,
    customerEmail,
    services,
    timeline,
    status: 'active',
    createdAt,
  };

  // In a real application, you would save this to a database.
  // For this example, we'll just return the data.
  return c.json({ ok: true, data: buildData });
});

app.get('/api/track/:code', async (c: Context) => {
    const { code } = c.req.param();
    // In a real application, you would fetch this from a database.
    // For this example, we'll return some mock data based on the service tracks.
    const mockData = {
        trackingCode: code,
        customerName: "Jane Doe",
        services: ["Ultimate Build", "Pro Cable Management", "BIOS / Firmware Tuning"],
        timeline: getTrackForServices(["Ultimate Build"]).map((step, index) => ({
            service: step,
            status: index < 2 ? 'completed' : index === 2 ? 'active' : 'pending',
        })),
        status: 'active',
        createdAt: new Date().toISOString(),
    };
    return c.json({ ok: true, data: mockData });
});

app.patch('/api/track/:code', async (c: Context) => {
    const { code } = c.req.param();
    const { status } = await c.req.json();
    // In a real application, you would update the build status in a database.
    // For this example, we'll just return a success message.
    return c.json({ ok: true, message: `Build ${code} status updated to ${status}` });
});

app.get('/api/admin/builds', async (c: Context) => {
    // In a real application, you would fetch this from a database.
    // For this example, we'll return some mock data.
    const mockData = [
        {
            trackingCode: "CCL-ABCD",
            customerName: "John Doe",
            services: ["Basic Build", "OS Install"],
            status: 'active',
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
