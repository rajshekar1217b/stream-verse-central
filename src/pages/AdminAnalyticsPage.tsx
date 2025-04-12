import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BarChart, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/types/supabase-extensions';

interface ViewStats {
  content_id: string;
  title: string;
  view_count: number;
}

interface TypeStats {
  type: string;
  count: number;
}

interface CommentData {
  id: string;
  user_name: string;
  user_email: string;
  comment_text: string;
  content_id: string;
  content_title: string;
  created_at: string;
}

interface SubscriberData {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const AdminAnalyticsPage: React.FC = () => {
  const [viewStats, setViewStats] = useState<ViewStats[]>([]);
  const [typeStats, setTypeStats] = useState<TypeStats[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('views');
  
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin-login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Fetch view statistics
        const { data: viewData, error: viewError } = await supabase
          .rpc('get_content_view_stats');
          
        if (viewError) throw viewError;
        
        // Fetch content type statistics
        const { data: typeData, error: typeError } = await supabase
          .rpc('get_content_type_stats');
          
        if (typeError) throw typeError;
        
        // Fetch comments with content titles
        const { data: commentData, error: commentError } = await supabase
          .from('comments')
          .select(`
            id,
            user_name,
            user_email,
            comment_text,
            created_at,
            content_id,
            contents(title)
          `)
          .order('created_at', { ascending: false });
          
        if (commentError) throw commentError;
        
        // Format comments data
        const formattedComments = commentData?.map((item: any) => ({
          id: item.id,
          user_name: item.user_name,
          user_email: item.user_email,
          comment_text: item.comment_text,
          created_at: item.created_at,
          content_id: item.content_id,
          content_title: item.contents?.title || 'Unknown'
        })) || [];
        
        // Fetch subscribers
        const { data: subscriberData, error: subscriberError } = await supabase
          .from('email_subscribers')
          .select('*')
          .order('subscribed_at', { ascending: false });
          
        if (subscriberError) throw subscriberError;
        
        setViewStats(viewData || []);
        setTypeStats(typeData || []);
        setComments(formattedComments);
        setSubscribers(subscriberData || []);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="min-h-screen bg-ott-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400">Track your content performance and user engagement</p>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
            >
              Back to Admin
            </Button>
          </div>
        </div>
        
        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="views">Content Views</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="distribution">Content Distribution</TabsTrigger>
          </TabsList>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-ott-accent"></div>
            </div>
          )}
          
          {/* Content Views Tab */}
          <TabsContent value="views" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5" />
                  Content View Statistics
                </CardTitle>
                <CardDescription>
                  See which content is most popular by number of views
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoading && viewStats.length > 0 ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={viewStats}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="title"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="view_count" name="Views" fill="#8884d8" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                ) : !isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No view data available yet.
                  </div>
                ) : null}
              </CardContent>
            </Card>
            
            {!isLoading && viewStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Content by Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Title</th>
                          <th className="text-right p-2">Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewStats.slice(0, 10).map((item) => (
                          <tr key={item.content_id} className="border-b hover:bg-muted">
                            <td className="p-2">
                              <Button
                                variant="link"
                                className="p-0 h-auto text-left"
                                onClick={() => navigate(`/content/${item.content_id}`)}
                              >
                                {item.title}
                              </Button>
                            </td>
                            <td className="text-right p-2">{item.view_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Comments</CardTitle>
                <CardDescription>
                  Recent comments from users across all content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoading && comments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">User</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Content</th>
                          <th className="text-left p-2">Comment</th>
                          <th className="text-left p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comments.map((comment) => (
                          <tr key={comment.id} className="border-b hover:bg-muted">
                            <td className="p-2">{comment.user_name}</td>
                            <td className="p-2">{comment.user_email}</td>
                            <td className="p-2">
                              <Button
                                variant="link"
                                className="p-0 h-auto text-left"
                                onClick={() => navigate(`/content/${comment.content_id}`)}
                              >
                                {comment.content_title}
                              </Button>
                            </td>
                            <td className="p-2">
                              <div className="max-w-[200px] truncate">
                                {comment.comment_text}
                              </div>
                            </td>
                            <td className="p-2 whitespace-nowrap">{formatDate(comment.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : !isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments available yet.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Subscribers</CardTitle>
                <CardDescription>
                  Users who have subscribed to content notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoading && subscribers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Subscribed On</th>
                          <th className="text-center p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber.id} className="border-b hover:bg-muted">
                            <td className="p-2">{subscriber.email}</td>
                            <td className="p-2 whitespace-nowrap">{formatDate(subscriber.subscribed_at)}</td>
                            <td className="p-2 text-center">
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                subscriber.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                              }`}>
                                {subscriber.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : !isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No subscribers available yet.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Content Distribution Tab */}
          <TabsContent value="distribution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Content Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of content by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoading && typeStats.length > 0 ? (
                  <div className="h-[400px] flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={typeStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="type"
                          label={({ type }) => type}
                        >
                          {typeStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : !isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No content distribution data available.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminAnalyticsPage;
