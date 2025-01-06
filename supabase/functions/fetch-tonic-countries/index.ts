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
    // Get the Tonic API credentials from environment variables
    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      throw new Error('Tonic API credentials not configured');
    }

    // Create Basic auth token for Tonic API
    const credentials = btoa(`${consumerKey}:${consumerSecret}`);
    const basicAuth = `Basic ${credentials}`;

    console.log('Fetching countries from Tonic API...');

    const response = await fetch('https://api.publisher.tonic.com/v4/countries', {
      method: 'GET',
      headers: {
        'Authorization': basicAuth,
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Countries API Response Status:', response.status);
    console.log('Countries API Response:', responseText);

    if (!response.ok) {
      throw new Error(`Countries fetch failed with status ${response.status}: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse countries response:', e);
      throw new Error(`Invalid countries response format: ${responseText}`);
    }

    return new Response(JSON.stringify(data), { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in fetch-tonic-countries:', error);
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
})