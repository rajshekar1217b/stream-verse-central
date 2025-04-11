
-- Create function to get content view statistics
CREATE OR REPLACE FUNCTION public.get_content_view_stats()
RETURNS TABLE (
  content_id TEXT,
  title TEXT,
  view_count BIGINT
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    cv.content_id,
    c.title,
    COUNT(*) as view_count
  FROM
    content_views cv
    JOIN contents c ON cv.content_id = c.id
  GROUP BY
    cv.content_id, c.title
  ORDER BY
    view_count DESC;
$$;

-- Create function to get content type statistics
CREATE OR REPLACE FUNCTION public.get_content_type_stats()
RETURNS TABLE (
  type TEXT,
  count BIGINT
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    type,
    COUNT(*) as count
  FROM
    contents
  GROUP BY
    type
  ORDER BY
    count DESC;
$$;
