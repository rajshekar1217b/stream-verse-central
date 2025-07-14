
import React, { useState, useEffect } from 'react';
import { supabase } from '@/types/supabase-extensions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Eye, MessageSquare, Users, TrendingUp } from 'lucide-react';

interface ViewsOverTime {
  date: string;
  views: number;
}

interface ContentViews {
  title: string;
  views: number;
}

interface AnalyticsData {
  viewsOverTime: ViewsOverTime[];
  topContent: ContentViews[];
  totalViews: number;
  totalComments: number;
  totalSubscribers: number;
  viewsGrowth: number;
}

const chartConfig = {
  views: {
    label: "Views",
  },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsOverview: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch views over the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: viewsData, error: viewsError } = await supabase
          .from('content_views')
          .select('viewed_at')
          .gte('viewed_at', thirtyDaysAgo.toISOString());

        if (viewsError) throw viewsError;

        // Process views by date
        const viewsByDate: { [key: string]: number } = {};
        viewsData?.forEach((view) => {
          const date = new Date(view.viewed_at).toISOString().split('T')[0];
          viewsByDate[date] = (viewsByDate[date] || 0) + 1;
        });

        // Fill in missing dates with 0 views
        const viewsOverTime: ViewsOverTime[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          viewsOverTime.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: viewsByDate[dateStr] || 0
          });
        }

        // Fetch top content by views
        const { data: topContentData, error: topContentError } = await supabase
          .rpc('get_content_view_stats');

        if (topContentError) throw topContentError;

        const topContent = topContentData?.slice(0, 5).map((item: any) => ({
          title: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
          views: Number(item.view_count)
        })) || [];

        // Fetch recent activity stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_recent_activity_stats');

        if (statsError) throw statsError;

        const stats = statsData?.[0];
        
        // Calculate growth (comparing last 15 days vs previous 15 days)
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        
        const recentViews = viewsData?.filter(view => 
          new Date(view.viewed_at) >= fifteenDaysAgo
        ).length || 0;
        
        const olderViews = viewsData?.filter(view => 
          new Date(view.viewed_at) < fifteenDaysAgo
        ).length || 0;
        
        const viewsGrowth = olderViews > 0 ? ((recentViews - olderViews) / olderViews) * 100 : 0;

        setAnalyticsData({
          viewsOverTime,
          topContent,
          totalViews: Number(stats?.total_views || 0),
          totalComments: Number(stats?.total_comments || 0),
          totalSubscribers: Number(stats?.total_subscribers || 0),
          viewsGrowth: Math.round(viewsGrowth)
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Unable to load analytics data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analyticsData.viewsGrowth > 0 ? '+' : ''}{analyticsData.viewsGrowth}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analyticsData.totalViews / 30).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Past 30 days average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Daily views for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={analyticsData.viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle>Top Content by Views</CardTitle>
            <CardDescription>Most viewed content</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.topContent.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={analyticsData.topContent} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis 
                    dataKey="title" 
                    type="category" 
                    fontSize={12}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No view data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
