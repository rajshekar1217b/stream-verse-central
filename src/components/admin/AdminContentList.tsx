
import React from 'react';
import { Content } from '@/types';
import { Edit, Trash2, Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  if (!contents.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No content available in the database.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-4 px-4">Title</th>
            <th className="text-left py-4 px-4">Type</th>
            <th className="text-left py-4 px-4">Rating</th>
            <th className="text-left py-4 px-4">Release Date</th>
            <th className="text-right py-4 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contents.map((content) => (
            <tr key={content.id} className="border-b border-gray-800 hover:bg-gray-800/30">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <img
                    src={content.posterPath}
                    alt={content.title}
                    className="w-10 h-14 rounded object-cover"
                  />
                  <span className="font-medium">{content.title}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center">
                  {content.type === 'movie' ? (
                    <Film size={16} className="mr-2" />
                  ) : (
                    <Tv size={16} className="mr-2" />
                  )}
                  {content.type === 'movie' ? 'Movie' : 'TV Show'}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <span className="font-medium">{content.rating}</span>
                  <span className="text-yellow-400 ml-1">★</span>
                </div>
              </td>
              <td className="py-4 px-4">
                {content.releaseDate ? new Date(content.releaseDate).toLocaleDateString() : 'N/A'}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(content)}
                    className="h-8 w-8 border-gray-700 hover:bg-gray-700"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(content.id)}
                    className="h-8 w-8 border-gray-700 hover:bg-red-900/30 hover:border-red-700"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminContentList;
