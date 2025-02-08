-- Create a secure RPC function to execute custom queries
CREATE OR REPLACE FUNCTION public.execute_custom_query(p_query TEXT, p_params JSONB DEFAULT '[]'::JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Dynamically execute the query with parameters
  EXECUTE p_query INTO result USING p_params;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Optional: Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_custom_query(TEXT, JSONB) TO authenticated;