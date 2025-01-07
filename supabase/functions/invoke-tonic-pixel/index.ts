import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const TIMEOUT_MS = 15000; // 15 second timeout

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      campaign_id, 
      'pixel-pixel_id': pixelId,
      'tiktok_access_token': accessToken,
      'pixel-test-token': testToken,
      'pixel-event_type': eventType,
    } = await req.json();

    console.log('Invoking pixel with params:', {
      campaign_id,
      pixelId,
      eventType,
      // Not logging tokens for security
    });

    // Create an AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://api.publisher.tonic.com/privileged/display/details/pixel/${pixelId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('TONIC_TOKEN')}`,
          },
          body: JSON.stringify({
            'campaign_id': campaign_id,
            'pixel-pixel_id': pixelId,
            'tiktok_access_token': accessToken,
            'pixel-test-token': testToken,
            'pixel-event_type': eventType,
            'pixel-revenue_choice': 'preestimated_revenue',
            'pixel-target': 'tiktok'
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Tonic API error:', errorData);
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      console.log('Tonic API response:', data);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request timed out');
        throw new Error('Request timed out after ' + TIMEOUT_MS + 'ms');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ 
        errors: [error.message || 'Failed to invoke pixel'],
        successes: [] 
      }),
      { 
        status: error.name === 'AbortError' ? 504 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})