import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, MessageSquare, Camera, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  photo_url?: string;
  created_at: string;
  resolved_at?: string;
  resident_id: string;
  ward_id: string;
}

export function ComplaintsPage() {
  const { userProfile, userRole } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, [userProfile]);

  const fetchComplaints = async () => {
    if (!userProfile) return;

    try {
      let query = supabase.from('complaints').select('*');

      if (userRole === 'resident') {
        query = query.eq('resident_id', userProfile.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching complaints:', error);
        return;
      }

      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && complaint.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-success text-success-foreground';
      case 'in_progress': return 'bg-warning text-warning-foreground';
      case 'open': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return CheckCircle;
      case 'in_progress': return Clock;
      case 'open': return AlertTriangle;
      default: return MessageSquare;
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId);

      if (error) {
        throw error;
      }

      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, ...updateData }
            : complaint
        )
      );

      toast({
        title: "Status updated",
        description: `Complaint marked as ${newStatus.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update complaint status",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    fetchComplaints();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Complaints</h1>
        </div>
        <div className="text-center py-8">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Complaints</h1>
          <p className="text-muted-foreground">
            {userRole === 'resident' 
              ? 'Submit and track your waste management complaints'
              : 'Manage and resolve citizen complaints'
            }
          </p>
        </div>
        
        {userRole === 'resident' && (
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="gradient-primary text-white shadow-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        )}
      </div>

      {/* Complaint Form */}
      {showForm && userRole === 'resident' && (
        <ComplaintForm onSubmit={handleFormSubmit} />
      )}

      {/* Search and Filters */}
      <Card className="shadow-soft border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border focus:ring-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="all">All ({complaints.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({complaints.filter(c => c.status === 'open').length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({complaints.filter(c => c.status === 'in_progress').length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({complaints.filter(c => c.status === 'resolved').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((complaint) => {
              const StatusIcon = getStatusIcon(complaint.status);
              
              return (
                <Card key={complaint.id} className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground truncate">{complaint.title}</h3>
                      </div>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {complaint.description}
                    </p>

                    {complaint.photo_url && (
                      <div className="relative">
                        <img
                          src={complaint.photo_url}
                          alt="Complaint evidence"
                          className="w-full h-32 object-cover rounded border border-border"
                        />
                        <div className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
                          <Camera className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                      {complaint.resolved_at && (
                        <span>Resolved: {new Date(complaint.resolved_at).toLocaleDateString()}</span>
                      )}
                    </div>

                    {userRole === 'admin' && complaint.status !== 'resolved' && (
                      <div className="flex gap-2 mt-3">
                        {complaint.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateComplaintStatus(complaint.id, 'in_progress')}
                            className="flex-1"
                          >
                            Start Progress
                          </Button>
                        )}
                        {complaint.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                            className="flex-1 gradient-primary text-white"
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredComplaints.length === 0 && (
            <Card className="shadow-soft border-border/50">
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No complaints found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No complaints have been submitted yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}