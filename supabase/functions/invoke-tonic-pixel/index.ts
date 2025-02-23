import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign_id, token, isFacebook } = await req.json();

    console.log('Invoking pixel with:', { campaign_id, token });

    // First authenticate with Tonic API
    const authResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: !isFacebook ? Deno.env.get('TONIC_CONSUMER_KEY') : Deno.env.get('TONIC_FB_CONSUMER_KEY'),
        consumer_secret: !isFacebook ? Deno.env.get('TONIC_CONSUMER_SECRET') : Deno.env.get('TONIC_FB_CONSUMER_SECRET'),
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Auth error:', errorText);
      throw new Error('Failed to authenticate with Tonic API');
    }

    const { token: authToken } = await authResponse.json();

    // Invoke the pixel
    const response = await fetch('https://api.publisher.tonic.com/privileged/v3/campaign/pixel/invoke', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        campaign_id: campaign_id,
        token: token
      }),
    });

    const result = await response.json();
    console.log('Invoke result:', result);

    // Check if the response indicates an error
    if (!response.ok || (result.data && result.data.success === false)) {
      const errorMessage = result.data?.message || 'Failed to invoke pixel';
      throw new Error(errorMessage);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        data: {
          success: false,
          message: error.message
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});