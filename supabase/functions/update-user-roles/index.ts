// This Edge Function migrates existing users from the profiles.user_type
// system to the new app_metadata.role system.
// Deploy to Supabase and run once to migrate all users.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      // These will be automatically injected when deployed to Supabase
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get all profiles with user_type
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type')
      .not('user_type', 'is', null)

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`)
    }

    console.log(`Found ${profiles.length} profiles with user_type`)

    // For each profile, update the user's app_metadata with the role
    const results = {
      total: profiles.length,
      success: 0,
      failed: 0,
      details: []
    }

    for (const profile of profiles) {
      try {
        // Only allow permitted roles (hospital, ambulance, and developer)
        if (!['hospital', 'ambulance', 'developer'].includes(profile.user_type)) {
          throw new Error(`Invalid role: ${profile.user_type}`);
        }
        
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          profile.id,
          { app_metadata: { role: profile.user_type } }
        )

        if (error) {
          throw error
        }

        results.success++
        results.details.push({
          id: profile.id,
          status: 'success',
          role: profile.user_type
        })
      } catch (error) {
        results.failed++
        results.details.push({
          id: profile.id,
          status: 'failed',
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 