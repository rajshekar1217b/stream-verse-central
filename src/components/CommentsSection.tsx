
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user_name: string;
  comment_text: string;
  created_at: string;
}

interface CommentsSectionProps {
  contentId: string;
  contentTitle: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ contentId, contentTitle }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments for this content
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('id, user_name, comment_text, created_at')
          .eq('content_id', contentId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [contentId]);

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !userEmail.trim() || !commentText.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!userEmail.includes('@') || !userEmail.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Insert comment
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert({
          content_id: contentId,
          user_name: userName,
          user_email: userEmail,
          comment_text: commentText
        })
        .select('id, user_name, comment_text, created_at');
      
      if (commentError) throw commentError;
      
      // Add to email subscribers if checked
      if (subscribe) {
        await supabase
          .from('email_subscribers')
          .upsert({ email: userEmail }, { onConflict: 'email' });
      }
      
      // Update the comments list
      if (commentData) {
        setComments([...commentData, ...comments]);
        setCommentText('');
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold flex items-center mb-6">
        <MessageSquare className="h-5 w-5 mr-2" />
        Comments ({comments.length})
      </h2>
      
      {/* Comment Form */}
      <div className="bg-card rounded-lg p-4 mb-8">
        <h3 className="text-lg font-medium mb-4">Add Your Comment</h3>
        <form onSubmit={handleSubmitComment}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Input
                placeholder="Your Name *"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Your Email *"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <Textarea
            placeholder="Your Comment *"
            className="min-h-[120px] mb-4"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
          />
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="subscribe" 
              checked={subscribe} 
              onCheckedChange={(checked) => setSubscribe(checked === true)}
            />
            <Label htmlFor="subscribe">
              Subscribe to notifications about new content
            </Label>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Comment'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
      
      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{comment.user_name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </div>
              </div>
              <p className="text-muted-foreground">{comment.comment_text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
