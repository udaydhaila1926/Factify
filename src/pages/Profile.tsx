import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Loader2, User, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile Data
  const [formData, setFormData] = useState({
    full_name: '',
    website: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      getProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          website: data.website || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error: any) {
      if (error.message !== 'Failed to fetch') {
          console.error('Error loading user data:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);

      const updates = {
        id: user.id,
        full_name: formData.full_name,
        website: formData.website,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to save profile', { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 dark:text-white">Account Settings</h1>
        
        <form onSubmit={updateProfile} className="space-y-8">
            
            {/* Profile Section */}
            <Card className="dark:border-slate-800 shadow-md">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                        ) : (
                            <User className="h-6 w-6" />
                        )}
                    </div>
                    <div>
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>Manage your public information</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <input
                    type="text"
                    value={user?.email || ''} 
                    disabled
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-100"
                    />
                </div>
            </CardContent>
            </Card>

            {/* System Status (Replacing API Keys) */}
            <Card className="dark:border-slate-800 shadow-md bg-slate-50/50 dark:bg-slate-900/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>System Configuration</CardTitle>
                            <CardDescription>API integrations are managed by the administrator</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span>Enterprise License Active: AI Services Configured</span>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving} size="lg" className="w-full sm:w-auto gap-2">
                  {saving ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                        <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
