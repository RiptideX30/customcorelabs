
import { getTrackForServices } from '../../../../src/lib/service-tracks';

export async function onRequest(context) {
  // Extract the tracking code from the URL.
  const { code } = context.params;

  // Only allow POST requests for this endpoint.
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
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

  try {
    const { BUILD_TRACKER } = context.env;
    const buildJson = await BUILD_TRACKER.get(code);

    if (!buildJson) {
      return new Response(JSON.stringify({ ok: false, error: 'Build not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const build = JSON.parse(buildJson);

    // Ensure the timeline is an array.
    if (!Array.isArray(build.timeline)) {
        build.timeline = [];
    }
    
    // Get the correct service track.
    const track = getTrackForServices(build.services);
    const currentStepIndex = build.timeline.length - 1;
    const nextStep = track[currentStepIndex + 1];

    if (nextStep) {
      // Add the next step to the timeline.
      build.timeline.push({
        status: nextStep,
        timestamp: new Date().toISOString(),
      });

      // Update the overall status.
      const isCompleted = build.timeline.length >= track.length;
      build.status = isCompleted ? 'completed' : 'in-progress';

      // Save the updated build data.
      await BUILD_TRACKER.put(code, JSON.stringify(build));

      return new Response(JSON.stringify({ ok: true, data: build }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // The build is already at the final step.
      return new Response(
        JSON.stringify({ ok: false, error: 'Build is already complete' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message || 'An unknown error occurred.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
