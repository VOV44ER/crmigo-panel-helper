import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign_id, token } = await req.json();

    console.log('Invoking pixel with:', { campaign_id, token });

    // First authenticate with Tonic API
    const authResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: Deno.env.get('TONIC_CONSUMER_KEY'),
        consumer_secret: Deno.env.get('TONIC_CONSUMER_SECRET'),
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Invoke error:', errorText);
      throw new Error('Failed to invoke pixel');
    }

    const result = await response.json();
    console.log('Invoke result:', result);

    return new Response(
      JSON.stringify({ 
        data: result,
        message: 'Pixel invoked successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});