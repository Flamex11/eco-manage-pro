import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, User, Upload, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SupportChatBot } from "@/components/support/SupportChatBot";
export function SettingsPage() {
  const {
    userProfile,
    userRole,
    refreshProfile
  } = useAuth();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone_number: userProfile?.phone_number || ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });
  const [chatMode, setChatMode] = useState<'help' | 'support' | 'issue' | null>(null);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleNotificationChange = (type: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [type]: value
    }));
  };
  const handleSaveProfile = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('users').update({
        name: formData.name,
        phone_number: formData.phone_number
      }).eq('id', userProfile.id);
      if (error) {
        throw error;
      }
      await refreshProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userProfile) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from('profile-images').upload(filePath, file);
      if (uploadError) {
        throw uploadError;
      }
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      const {
        error: updateError
      } = await supabase.from('users').update({
        profile_image_url: publicUrl
      }).eq('id', userProfile.id);
      if (updateError) {
        throw updateError;
      }
      await refreshProfile();
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userProfile?.profile_image_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {userProfile?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" id="avatar-upload" />
                  <label htmlFor="avatar-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Change Avatar
                      </span>
                    </Button>
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="bg-background border-border focus:ring-primary" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} disabled className="bg-muted border-border cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone_number} onChange={e => handleInputChange('phone_number', e.target.value)} className="bg-background border-border focus:ring-primary" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={userRole || ''} disabled className="bg-muted border-border cursor-not-allowed capitalize" />
                  <p className="text-xs text-muted-foreground">Role cannot be changed</p>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading} className="gradient-primary text-white shadow-primary">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="w-5 h-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch checked={notifications.email} onCheckedChange={value => handleNotificationChange('email', value)} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch checked={notifications.push} onCheckedChange={value => handleNotificationChange('push', value)} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Text message alerts</p>
                </div>
                <Switch checked={notifications.sms} onCheckedChange={value => handleNotificationChange('sms', value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Settings Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-soft border-border/50">
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            
            
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Support</CardTitle>
              <CardDescription>Get help and support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setChatMode('help')}
              >
                Help Center
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setChatMode('support')}
              >
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setChatMode('issue')}
              >
                Report an Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <SupportChatBot
        isOpen={chatMode !== null}
        onClose={() => setChatMode(null)}
        mode={chatMode || 'help'}
      />
    </div>;
}