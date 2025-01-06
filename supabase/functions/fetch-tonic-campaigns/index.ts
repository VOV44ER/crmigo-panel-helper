import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TONIC_API_URL = "https://api.publisher.tonic.com/privileged/v3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { states, limit, offset, from, to, userId } = await req.json()
    
    if (!states || !userId) {
      throw new Error('Missing required fields: states and userId are required')
    }

    // Get authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    const tonicToken = authHeader.replace('Bearer ', '')
    console.log('Using Tonic token:', tonicToken)

    // Get user's campaign IDs from Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: userCampaigns, error: dbError } = await supabase
      .from('campaigns')
      .select('campaign_id')
      .eq('user_id', userId)

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log('User campaigns from database:', userCampaigns)

    // Get all campaigns from Tonic using the token from the request
    const campaignsResponse = await fetch(`${TONIC_API_URL}/campaigns?state=${states.join(',')}&stats=true`, {
      headers: {
        'Authorization': `Bearer ${tonicToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!campaignsResponse.ok) {
      const errorText = await campaignsResponse.text()
      console.error('Tonic API error:', errorText)
      throw new Error(`Failed to fetch campaigns: ${errorText}`)
    }

    const allCampaigns = await campaignsResponse.json()
    console.log('All campaigns from Tonic:', allCampaigns)
    
    // Filter campaigns to only include user's campaigns
    const userCampaignIds = new Set(userCampaigns.map(c => c.campaign_id))
    const filteredCampaigns = allCampaigns.data.filter(campaign => 
      userCampaignIds.has(campaign.id.toString())
    )

    // Apply date filtering if provided
    let dateFilteredCampaigns = filteredCampaigns
    if (from || to) {
      dateFilteredCampaigns = filteredCampaigns.filter(campaign => {
        const campaignDate = new Date(campaign.created)
        const fromDate = from ? new Date(from) : null
        const toDate = to ? new Date(to) : null
        
        if (fromDate && toDate) {
          return campaignDate >= fromDate && campaignDate <= toDate
        } else if (fromDate) {
          return campaignDate >= fromDate
        } else if (toDate) {
          return campaignDate <= toDate
        }
        return true
      })
    }

    // Apply pagination
    const startIndex = offset || 0
    const endIndex = startIndex + (limit || 10)
    const paginatedCampaigns = dateFilteredCampaigns.slice(startIndex, endIndex)

    const response = {
      data: paginatedCampaigns,
      pagination: {
        total: dateFilteredCampaigns.length,
        offset: startIndex,
        limit: limit || 10
      },
      sorting: allCampaigns.sorting
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})