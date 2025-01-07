import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    console.log('Received request with params:', {
      campaign_id,
      pixelId,
      eventType,
      // Not logging tokens for security
    });

    // First, get JWT token from Tonic
    const authResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: Deno.env.get('TONIC_CONSUMER_KEY'),
        consumer_secret: Deno.env.get('TONIC_CONSUMER_SECRET'),
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Tonic API authentication failed. Status:', authResponse.status, 'Response:', errorText);
      throw new Error(`Failed to authenticate with Tonic API: ${errorText}`);
    }

    const authData = await authResponse.json();
    if (!authData.token) {
      console.error('No token in auth response:', authData);
      throw new Error('No token received from Tonic API');
    }

    console.log('Successfully obtained Tonic JWT token');

    // Create an AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log(`Making request to Tonic API with pixel ID: ${pixelId}`);
      
      // Create URLSearchParams instead of FormData
      const params = new URLSearchParams();
      params.append('campaign_id', campaign_id);
      params.append('pixel-pixel_id', pixelId);
      params.append('tiktok_access_token', accessToken);
      params.append('pixel-test-token', testToken);
      params.append('pixel-event_type', eventType);
      params.append('pixel-revenue_choice', 'preestimated_revenue');
      params.append('pixel-target', 'tiktok');

      // Log the request details
      console.log('Request URL:', 'https://publisher.tonic.com/privileged/display/details/pixel');
      console.log('Request params:', params.toString());

      const response = await fetch(
        'https://publisher.tonic.com/privileged/display/details/pixel',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${authData.token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Log response details
      console.log('Tonic API response status:', response.status);
      console.log('Tonic API response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse response as JSON:', error);
        throw new Error(`Invalid JSON response from Tonic API: ${responseText.substring(0, 200)}...`);
      }

      if (!response.ok) {
        console.error('Tonic API error response:', responseData);
        throw new Error(`Tonic API error: ${JSON.stringify(responseData)}`);
      }

      return new Response(JSON.stringify({
        data: responseData,
        successes: ['Pixel tracking successfully invoked'],
        errors: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request timed out');
        throw new Error('Request timed out after 15000ms');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Error in invoke-tonic-pixel:', error);
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