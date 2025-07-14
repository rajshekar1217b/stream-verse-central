
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
    view_count DESC
  LIMIT 10;
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

-- Create function to get recent activity stats
CREATE OR REPLACE FUNCTION public.get_recent_activity_stats()
RETURNS TABLE (
  total_views BIGINT,
  total_comments BIGINT,
  total_subscribers BIGINT,
  total_content BIGINT
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    (SELECT COUNT(*) FROM content_views WHERE viewed_at >= NOW() - INTERVAL '30 days') as total_views,
    (SELECT COUNT(*) FROM comments WHERE created_at >= NOW() - INTERVAL '30 days') as total_comments,
    (SELECT COUNT(*) FROM email_subscribers WHERE is_active = true) as total_subscribers,
    (SELECT COUNT(*) FROM contents) as total_content;
$$;
