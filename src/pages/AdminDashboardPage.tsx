
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAllContent, addContent, updateContent, deleteContent } from '@/services/api';
import { Content } from '@/types';
import { Plus, LogOut, BarChart, Eye, MessageSquare, Users, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminContentList from '@/components/admin/AdminContentList';
import AdminContentForm from '@/components/admin/AdminContentForm';
import AdminTmdbImport from '@/components/admin/AdminTmdbImport';
import { supabase } from '@/types/supabase-extensions';

interface AnalyticsStats {
  total_views: number;
  total_comments: number;
  total_subscribers: number;
  total_content: number;
}

const AdminDashboardPage: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // Fetch content data and analytics
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin-login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch content
        const contentData = await getAllContent();
        setContents(contentData);
        
        // Fetch analytics stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_recent_activity_stats');
          
        if (statsError) {
          console.error('Error fetching analytics:', statsError);
        } else if (statsData && statsData.length > 0) {
          setAnalyticsStats(statsData[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate]);
  
  // Handler for adding new content
  const handleAddContent = async (content: Partial<Content>) => {
    try {
      const newContent = await addContent(content as Content);
      setContents([...contents, newContent]);
      setIsFormVisible(false);
      setSelectedContent(undefined);
      toast.success('Content added successfully');
    } catch (error) {
      console.error('Error adding content:', error);
      toast.error('Failed to add content');
    }
  };
  
  // Handler for updating content - fixed to properly update state
  const handleUpdateContent = async (updatedContent: Partial<Content>) => {
    try {
      console.log('Updating content:', updatedContent);
      const result = await updateContent(updatedContent as Content);
      setContents(contents.map(c => c.id === result.id ? result : c));
      setIsFormVisible(false);
      setSelectedContent(undefined);
      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  };
  
  // Handler for deleting content
  const handleDeleteContent = async (id: string) => {
    setContentToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  // Confirm deletion
  const confirmDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      await deleteContent(contentToDelete);
      setContents(contents.filter(c => c.id !== contentToDelete));
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    } finally {
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };
  
  // Handler for editing content - Fixed to properly handle edit mode
  const handleEditContent = (content: Content) => {
    console.log('Edit content clicked:', content);
    // Create a deep copy to prevent reference issues
    const contentCopy = {
      ...content,
      embedVideos: content.embedVideos || [],
      images: content.images || [],
      watchProviders: content.watchProviders || [],
      seasons: content.seasons || [],
      cast: content.cast || []
    };
    setSelectedContent(contentCopy);
    setIsFormVisible(true);
  };
  
  // Handler for importing content from TMDB
  const handleTmdbImport = async (importedContent: Content) => {
    try {
      console.log('Importing TMDB content:', importedContent);
      const newContent = await addContent(importedContent);
      setContents([...contents, newContent]);
      toast.success(`"${importedContent.title}" imported successfully`);
    } catch (error) {
      console.error('Error importing TMDB content:', error);
      toast.error('Failed to import content');
    }
  };
  
  // Handler for logging out
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Toggle content form
  const toggleForm = () => {
    if (isFormVisible) {
      // If closing form, reset selected content
      setIsFormVisible(false);
      setSelectedContent(undefined);
    } else {
      // If opening form for new content, ensure no content is selected
      setSelectedContent(undefined);
      setIsFormVisible(true);
    }
  };

  // Handler to cancel form editing
  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setSelectedContent(undefined);
  };
  
  return (
    <div className="min-h-screen bg-ott-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your OTT platform content</p>
            {isFormVisible && selectedContent && (
              <p className="text-sm text-ott-accent mt-1">
                Editing: {selectedContent.title}
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            
            <Button
              onClick={() => navigate('/admin/analytics')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            
            <Button
              onClick={toggleForm}
              className={isFormVisible ? 'bg-gray-700' : 'bg-ott-accent hover:bg-ott-accent/80'}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isFormVisible ? 'Cancel' : 'Add Content'}
            </Button>
          </div>
        </div>
        
        {/* Analytics Overview Cards */}
        {!isFormVisible && analyticsStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                <Film className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsStats.total_content}</div>
                <p className="text-xs text-muted-foreground">
                  Movies and TV shows
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsStats.total_views}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comments</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsStats.total_comments}</div>
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
                <div className="text-2xl font-bold">{analyticsStats.total_subscribers}</div>
                <p className="text-xs text-muted-foreground">
                  Active subscribers
                </p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* TMDB Import Section */}
        {!isFormVisible && <AdminTmdbImport onImport={handleTmdbImport} />}
        
        {/* Content Form (visible when adding/editing) */}
        {isFormVisible && (
          <AdminContentForm
            key={selectedContent?.id || 'new'}
            content={selectedContent}
            onSave={selectedContent ? handleUpdateContent : handleAddContent}
            onCancel={handleCancelEdit}
          />
        )}
        
        {/* Content List */}
        {!isFormVisible && (
          <div className="bg-ott-card p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-6">Content Library</h2>
            
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ott-accent mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading content...</p>
              </div>
            ) : (
              <AdminContentList
                contents={contents}
                onEdit={handleEditContent}
                onDelete={handleDeleteContent}
              />
            )}
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

export default AdminDashboardPage;
