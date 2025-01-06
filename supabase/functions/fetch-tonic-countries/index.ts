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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization token provided');
    }

    console.log('Fetching countries with auth header:', authHeader);

    const response = await fetch('https://api.publisher.tonic.com/v4/countries', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Countries response status:', response.status);
    console.log('Countries response:', responseText);

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