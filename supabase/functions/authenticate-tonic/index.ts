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
    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      throw new Error('Missing Tonic API credentials');
    }

    console.log('Authenticating with Tonic API...');

    const response = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Tonic API authentication failed:', error);
      throw new Error('Failed to authenticate with Tonic API');
    }

    const tonicResponse = await response.json();
    console.log('Tonic authentication successful:', tonicResponse);

    // Make sure we're returning the exact format expected by the client
    const data = {
      token: tonicResponse.token,
      expires: tonicResponse.expires
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})