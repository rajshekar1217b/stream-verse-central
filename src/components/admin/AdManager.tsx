import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { adService } from '@/services/adService';
import { Ad, AdSettings, AdPlacement } from '@/types/ads';

const AdManager: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [adSettings, setAdSettings] = useState<AdSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deletingAd, setDeletingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ad_code: '',
    placement: '' as AdPlacement | '',
    is_active: true
  });
  const [settingsData, setSettingsData] = useState({
    auto_ads_enabled: false,
    auto_ads_client_id: ''
  });

  const placementOptions = [
    { value: 'header', label: 'Header' },
    { value: 'footer', label: 'Footer' },
    { value: 'before_content', label: 'Before Content' },
    { value: 'after_content', label: 'After Content' },
    { value: 'between_content', label: 'Between Content' },
    { value: 'sidebar', label: 'Sidebar' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adsData, settingsData] = await Promise.all([
        adService.getAds(),
        adService.getAdSettings()
      ]);
      setAds(adsData);
      setAdSettings(settingsData);
      if (settingsData) {
        setSettingsData({
          auto_ads_enabled: settingsData.auto_ads_enabled,
          auto_ads_client_id: settingsData.auto_ads_client_id || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load ads data');
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ad_code: '',
      placement: '',
      is_active: true
    });
    setEditingAd(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.placement) {
      toast.error('Please select a placement');
      return;
    }

    try {
      if (editingAd) {
        await adService.updateAd(editingAd.id, formData as any);
        toast.success('Ad updated successfully');
      } else {
        await adService.createAd(formData as any);
        toast.success('Ad created successfully');
      }
      
      setIsFormOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(editingAd ? 'Failed to update ad' : 'Failed to create ad');
      console.error('Error saving ad:', error);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      name: ad.name,
      ad_code: ad.ad_code,
      placement: ad.placement,
      is_active: ad.is_active
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingAd) return;

    try {
      await adService.deleteAd(deletingAd.id);
      toast.success('Ad deleted successfully');
      setDeletingAd(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete ad');
      console.error('Error deleting ad:', error);
    }
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      await adService.updateAd(ad.id, { is_active: !ad.is_active });
      toast.success(`Ad ${!ad.is_active ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update ad status');
      console.error('Error updating ad:', error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await adService.updateAdSettings(settingsData);
      toast.success('Ad settings updated successfully');
      setIsSettingsOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update ad settings');
      console.error('Error updating settings:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading ads...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ad Management</h2>
        <div className="flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AdSense Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-ads"
                    checked={settingsData.auto_ads_enabled}
                    onCheckedChange={(checked) => 
                      setSettingsData(prev => ({ ...prev, auto_ads_enabled: checked }))
                    }
                  />
                  <Label htmlFor="auto-ads">Enable Auto Ads</Label>
                </div>
                <div>
                  <Label htmlFor="client-id">AdSense Client ID (ca-pub-xxxxxxxxx)</Label>
                  <Input
                    id="client-id"
                    value={settingsData.auto_ads_client_id}
                    onChange={(e) => {
                      // Remove "client=" prefix if user pastes it
                      let value = e.target.value;
                      if (value.startsWith('client=')) {
                        value = value.replace('client=', '');
                      }
                      setSettingsData(prev => ({ ...prev, auto_ads_client_id: value }));
                    }}
                    placeholder="ca-pub-1234567890123456"
                  />
                </div>
                <Button onClick={handleUpdateSettings} className="w-full">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Ad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingAd ? 'Edit Ad' : 'Add New Ad'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Ad Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="placement">Placement</Label>
                  <Select value={formData.placement} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, placement: value as AdPlacement }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      {placementOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ad_code">Ad Code (HTML/JavaScript from AdSense)</Label>
                  <Textarea
                    id="ad_code"
                    value={formData.ad_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, ad_code: e.target.value }))}
                    rows={6}
                    placeholder="<script>...</script> or <ins>...</ins>"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {ads.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No ads configured yet. Create your first ad to get started.</p>
            </CardContent>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {ad.name}
                      <Badge variant={ad.is_active ? "default" : "secondary"}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placement: {placementOptions.find(p => p.value === ad.placement)?.label}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(ad)}
                    >
                      {ad.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ad)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingAd(ad)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  {ad.ad_code.length > 100 ? `${ad.ad_code.substring(0, 100)}...` : ad.ad_code}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deletingAd} onOpenChange={() => setDeletingAd(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingAd?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdManager;