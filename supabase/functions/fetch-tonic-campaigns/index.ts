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
    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      throw new Error('Missing Tonic API credentials');
    }

    console.log('Authenticating with Tonic API...');

    // First, get JWT token
    const authResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    });

    if (!authResponse.ok) {
      const error = await authResponse.text();
      console.error('Tonic API authentication failed:', error);
      throw new Error('Failed to authenticate with Tonic API');
    }

    const { token } = await authResponse.json();
    console.log('Successfully obtained Tonic JWT token');

    // Ensure we have at least one state
    if (!states || states.length === 0) {
      throw new Error('At least one state must be selected');
    }

    // Build the campaigns URL with query parameters
    const campaignsUrl = new URL('https://api.publisher.tonic.com/v4/campaigns');
    campaignsUrl.searchParams.set('state', states.join(','));
    campaignsUrl.searchParams.set('limit', limit?.toString() || '10');
    campaignsUrl.searchParams.set('offset', offset?.toString() || '0');
    if (from) campaignsUrl.searchParams.set('from', from);
    if (to) campaignsUrl.searchParams.set('to', to);
    campaignsUrl.searchParams.set('stats', 'true');
    campaignsUrl.searchParams.set('orderOrientation', 'desc');

    console.log('Fetching campaigns from:', campaignsUrl.toString());

    const campaignsResponse = await fetch(campaignsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json();
      console.error('Failed to fetch campaigns:', errorData);
      throw new Error(`Failed to fetch campaigns: ${JSON.stringify(errorData, null, 2)}`);
    }

    const campaigns = await campaignsResponse.json();
    console.log('Successfully fetched campaigns');

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