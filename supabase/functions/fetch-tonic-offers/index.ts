import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    console.log('Authenticating with Tonic API...');

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
      const error = await authResponse.text();
      console.error('Tonic API authentication failed:', error);
      throw new Error('Failed to authenticate with Tonic API');
    }

    const { token: tonicToken } = await authResponse.json();
    console.log('Successfully obtained Tonic JWT token');

    const response = await fetch('https://api.publisher.tonic.com/v4/offers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tonicToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Offers API error:', errorText);
      throw new Error(`Offers fetch failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched offers');

    return new Response(JSON.stringify(data), { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in fetch-tonic-offers:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    );
  }
});