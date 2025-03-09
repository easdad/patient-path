-- Function to call our Edge Function when a user's role changes
CREATE OR REPLACE FUNCTION public.trigger_sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if user_type has changed
  IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
    -- Call the sync-user-role Edge Function
    PERFORM
      supabase_functions.http(
        'POST',
        'https://mtrmxzywxfklltwuxtgb.supabase.co/functions/v1/sync-user-role',
        json_build_object('Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub', true))::jsonb,
        'application/json',
        json_build_object('user_id', NEW.id, 'user_type', NEW.user_type)::jsonb
      );
      
    -- For immediate effect, we also refresh the claim directly
    PERFORM set_config('request.jwt.claim.role', NEW.user_type, true);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires after a profile's user_type is updated
DROP TRIGGER IF EXISTS trigger_sync_user_role ON public.profiles;

CREATE TRIGGER trigger_sync_user_role
AFTER UPDATE OF user_type ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_sync_user_role(); 