
import React, { useState, useEffect } from 'react';
import { supabase } from '@/types/supabase-extensions';
import { Eye } from 'lucide-react';

interface ViewCountProps {
  contentId: string;
  className?: string;
  showIcon?: boolean;
}

const ViewCount: React.FC<ViewCountProps> = ({ 
  contentId, 
  className = "",
  showIcon = true 
}) => {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        const { data, error } = await supabase
          .from('content_views')
          .select('id')
          .eq('content_id', contentId);

        if (error) {
          console.error('Error fetching view count:', error);
        } else {
          setViewCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching view count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (contentId) {
      fetchViewCount();
    }
  }, [contentId]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && <Eye size={14} className="text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">-</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && <Eye size={14} className="text-muted-foreground" />}
      <span className="text-sm text-muted-foreground">
        {viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}
      </span>
    </div>
  );
};

export default ViewCount;
