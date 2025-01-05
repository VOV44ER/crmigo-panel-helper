import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const url = new URL(req.url);
    const state = url.searchParams.get('state') || 'active,pending,stopped';
    const limit = url.searchParams.get('limit') || '10';
    const offset = url.searchParams.get('offset') || '0';
    const from = url.searchParams.get('from') || '2024-01-01';
    const to = new Date().toISOString().split('T')[0];

    console.log('Request parameters:', { state, limit, offset, from, to });

    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      throw new Error('Tonic API credentials not configured');
    }

    const tonicAuthResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    });

    if (!tonicAuthResponse.ok) {
      const error = await tonicAuthResponse.text();
      throw new Error(`Tonic authentication failed: ${error}`);
    }

    const tonicAuth = await tonicAuthResponse.json();

    // Build the campaigns URL with query parameters
    const campaignsUrl = new URL('https://api.publisher.tonic.com/v4/campaigns');
    campaignsUrl.searchParams.set('state', state);
    campaignsUrl.searchParams.set('limit', limit);
    campaignsUrl.searchParams.set('offset', offset);
    campaignsUrl.searchParams.set('from', from);
    campaignsUrl.searchParams.set('to', to);
    campaignsUrl.searchParams.set('stats', 'true');
    campaignsUrl.searchParams.set('orderOrientation', 'desc');

    console.log('Fetching campaigns from:', campaignsUrl.toString());

    const campaignsResponse = await fetch(campaignsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${tonicAuth.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!campaignsResponse.ok) {
      const error = await campaignsResponse.text();
      throw new Error(`Failed to fetch campaigns: ${error}`);
    }

    const campaigns = await campaignsResponse.json();
    console.log('Successfully fetched campaigns');

    return new Response(JSON.stringify(campaigns), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in fetch-tonic-campaigns:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});