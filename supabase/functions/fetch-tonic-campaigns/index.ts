import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { states, limit, offset, from, to, username, countryCode, offerIds } = await req.json();
    console.log('Received params:', { states, limit, offset, from, to, username, countryCode, offerIds });

    // Get JWT token from Tonic
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
      throw new Error('Failed to authenticate with Tonic API');
    }

    const { token: tonicToken } = await authResponse.json();

    // Build the URL with query parameters
    const url = new URL('https://api.publisher.tonic.com/v4/campaigns');
    if (states?.length) url.searchParams.append('states', states.join(','));
    if (limit) url.searchParams.append('limit', limit.toString());
    if (offset) url.searchParams.append('offset', offset.toString());
    if (from) url.searchParams.append('from', from);
    if (to) url.searchParams.append('to', to);
    if (username) url.searchParams.append('campaignName', username);
    if (countryCode) url.searchParams.append('countryCode', countryCode);
    if (offerIds) url.searchParams.append('offerIds', offerIds);

    console.log('Fetching from URL:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${tonicToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched campaigns data');

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});