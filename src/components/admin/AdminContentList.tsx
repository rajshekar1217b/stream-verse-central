
import React, { useState, useMemo } from 'react';
import { Content } from '@/types';
import { Edit, Trash2, Film, Tv, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AdminContentListProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (contentId: string) => void;
}

const AdminContentList: React.FC<AdminContentListProps> = ({
  contents,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');

  // Filter and sort content
  const filteredAndSortedContent = useMemo(() => {
    let filtered = contents;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.overview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(content => content.type === activeTab);
    }

    // Sort content
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
        case 'oldest':
          return new Date(a.releaseDate || 0).getTime() - new Date(b.releaseDate || 0).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [contents, searchQuery, sortBy, activeTab]);

  // Get counts for tabs
  const movieCount = contents.filter(c => c.type === 'movie').length;
  const tvCount = contents.filter(c => c.type === 'tv').length;

  if (!contents.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No content available in the database.</p>
      </div>
    );
  }

  const renderContentTable = (contentList: Content[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Release Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contentList.map((content) => (
            <TableRow key={content.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <img
                    src={content.posterPath}
                    alt={content.title}
                    className="w-10 h-14 rounded object-cover"
                  />
                  <span className="font-medium">{content.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {content.type === 'movie' ? (
                    <Film size={16} className="mr-2" />
                  ) : (
                    <Tv size={16} className="mr-2" />
                  )}
                  {content.type === 'movie' ? 'Movie' : 'TV Show'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="font-medium">{content.rating}</span>
                  <span className="text-yellow-400 ml-1">★</span>
                </div>
              </TableCell>
              <TableCell>
                {content.releaseDate ? new Date(content.releaseDate).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(content)}
                    className="h-8 w-8"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(content.id)}
                    className="h-8 w-8 hover:bg-destructive/20 hover:border-destructive"
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs for content type */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({contents.length})</TabsTrigger>
          <TabsTrigger value="movie">
            <Film size={16} className="mr-2" />
            Movies ({movieCount})
          </TabsTrigger>
          <TabsTrigger value="tv">
            <Tv size={16} className="mr-2" />
            TV Shows ({tvCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {filteredAndSortedContent.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'No content found matching your search.' : 'No content available.'}
              </p>
            </div>
          ) : (
            renderContentTable(filteredAndSortedContent)
          )}
        </TabsContent>

        <TabsContent value="movie" className="mt-4">
          {filteredAndSortedContent.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'No movies found matching your search.' : 'No movies available.'}
              </p>
            </div>
          ) : (
            renderContentTable(filteredAndSortedContent)
          )}
        </TabsContent>

        <TabsContent value="tv" className="mt-4">
          {filteredAndSortedContent.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'No TV shows found matching your search.' : 'No TV shows available.'}
              </p>
            </div>
          ) : (
            renderContentTable(filteredAndSortedContent)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContentList;
