import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { states, limit, offset, from, to } = await req.json();

    // Get Tonic credentials from environment variables
    const TONIC_CONSUMER_KEY = Deno.env.get('TONIC_CONSUMER_KEY');
    const TONIC_CONSUMER_SECRET = Deno.env.get('TONIC_CONSUMER_SECRET');

    if (!TONIC_CONSUMER_KEY || !TONIC_CONSUMER_SECRET) {
      throw new Error('Missing Tonic API credentials');
    }

    // Get authentication token
    const tonicAuthResponse = await fetch('https://api.publisher.tonic.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: TONIC_CONSUMER_KEY,
        client_secret: TONIC_CONSUMER_SECRET,
      }),
    });

    if (!tonicAuthResponse.ok) {
      throw new Error('Failed to authenticate with Tonic API');
    }

    const tonicAuth = await tonicAuthResponse.json();

    // Build the campaigns URL with query parameters
    const campaignsUrl = new URL('https://api.publisher.tonic.com/v4/campaigns');
    campaignsUrl.searchParams.set('state', states.join(','));
    campaignsUrl.searchParams.set('limit', limit.toString());
    campaignsUrl.searchParams.set('offset', offset.toString());
    campaignsUrl.searchParams.set('from', from || addDays(new Date(), -30).toISOString().split('T')[0]);
    campaignsUrl.searchParams.set('to', to || new Date().toISOString().split('T')[0]);
    campaignsUrl.searchParams.set('stats', 'true');
    campaignsUrl.searchParams.set('orderOrientation', 'desc');

    console.log('Fetching campaigns from:', campaignsUrl.toString());

    const campaignsResponse = await fetch(campaignsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${tonicAuth.access_token}`,
      },
    });

    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json();
      throw new Error(`Failed to fetch campaigns: ${JSON.stringify(errorData, null, 4)}`);
    }

    const campaigns = await campaignsResponse.json();

    return new Response(
      JSON.stringify(campaigns),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      },
    );
  }
})