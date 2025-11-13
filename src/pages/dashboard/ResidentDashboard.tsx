import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Calendar, Bell, Camera, CheckCircle, Clock, AlertTriangle, Package, Star, Truck, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
export function ResidentDashboard() {
  const {
    toast
  } = useToast();
  const {
    userProfile,
    refreshProfile
  } = useAuth();
  const [greenPoints] = useState(247);
  const [isRequestingPickup, setIsRequestingPickup] = useState(false);
  const [wards, setWards] = useState<Array<{
    id: string;
    name: string;
    zone: string;
  }>>([]);
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [isAssigningWard, setIsAssigningWard] = useState(false);
  useEffect(() => {
    fetchWards();
  }, []);
  const fetchWards = async () => {
    const {
      data,
      error
    } = await supabase.from('wards').select('*').order('name');
    if (data && !error) {
      setWards(data);
    }
  };
  const handleAssignWard = async () => {
    if (!selectedWard) {
      toast({
        title: "No ward selected",
        description: "Please select a ward to continue.",
        variant: "destructive"
      });
      return;
    }
    setIsAssigningWard(true);
    try {
      const {
        error
      } = await supabase.from('users').update({
        ward_id: selectedWard
      }).eq('auth_user_id', userProfile?.auth_user_id);
      if (error) throw error;
      await refreshProfile();
      toast({
        title: "Ward assigned",
        description: "Your ward has been assigned successfully."
      });
    } catch (error) {
      toast({
        title: "Assignment failed",
        description: "Failed to assign ward. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigningWard(false);
    }
  };
  const [complaints, setComplaints] = useState([{
    id: 1,
    title: "Missed Collection",
    description: "Dry waste not collected for 3 days in Sector 12",
    status: "in_progress",
    date: "2024-01-15"
  }, {
    id: 2,
    title: "Overflowing Bin",
    description: "Community bin is overflowing near the park",
    status: "resolved",
    date: "2024-01-10"
  }]);
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: ""
  });
  const handleRequestPickup = async () => {
    setIsRequestingPickup(true);
    try {
      let wardId = userProfile?.ward_id;

      // Auto-assign ward if not assigned
      if (!wardId) {
        // Fetch wards if not already loaded
        let availableWards = wards;
        if (availableWards.length === 0) {
          const {
            data
          } = await supabase.from('wards').select('*').order('name').limit(1);
          if (data && data.length > 0) {
            availableWards = data;
          }
        }
        if (availableWards.length === 0) {
          toast({
            title: "No wards available",
            description: "Please contact admin to set up wards.",
            variant: "destructive"
          });
          return;
        }

        // Assign first available ward
        const firstWard = availableWards[0];
        const {
          error: updateError
        } = await supabase.from('users').update({
          ward_id: firstWard.id
        }).eq('auth_user_id', userProfile?.auth_user_id);
        if (updateError) throw updateError;
        await refreshProfile();
        wardId = firstWard.id;
        toast({
          title: "Ward auto-assigned",
          description: `Assigned to ${firstWard.name} - ${firstWard.zone}`
        });
      }

      // Create pickup request
      const {
        error
      } = await supabase.from('waste_collections').insert({
        collector_id: null,
        ward_id: wardId,
        date: new Date().toISOString(),
        waste_type: 'dry',
        status: 'pending',
        location: 'Resident pickup request'
      });
      if (error) throw error;
      toast({
        title: "Pickup requested",
        description: "Your waste pickup request has been submitted successfully."
      });
    } catch (error) {
      toast({
        title: "Request failed",
        description: "Failed to submit pickup request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRequestingPickup(false);
    }
  };
  const handleSubmitComplaint = () => {
    if (!newComplaint.title || !newComplaint.description) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    const complaint = {
      id: complaints.length + 1,
      title: newComplaint.title,
      description: newComplaint.description,
      status: "open",
      date: new Date().toISOString().split('T')[0]
    };
    setComplaints(prev => [complaint, ...prev]);
    setNewComplaint({
      title: "",
      description: ""
    });
    toast({
      title: "Complaint submitted",
      description: "Your complaint has been submitted and will be reviewed shortly."
    });
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-success text-success-foreground';
      case 'in_progress':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-destructive text-destructive-foreground';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };
  return <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hello, thank you for keeping your city clean 🌱</h1>
          <p className="text-muted-foreground">Together, we're making our community cleaner and greener</p>
        </div>
        
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-[2px] px-0 py-[22px]">
        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="mx-0 py-0 my-0 px-0">
            <CardTitle className="text-foreground flex items-center gap-2 mx-[22px] my-0 py-0 px-[2px]">
              <Package className="h-5 w-5 text-primary" />
              Request Waste Pickup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRequestPickup} disabled={isRequestingPickup} className="w-full gradient-primary text-white shadow-primary">
              <Package className="w-4 h-4 mr-2" />
              {isRequestingPickup ? "Requesting..." : "Request Pickup 📦"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Updates & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Collection</CardTitle>
            <Truck className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Tomorrow</div>
            <p className="text-xs text-muted-foreground">
              Dry waste at 8:00 AM • Collector: Raj Kumar
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Green Points 🌟</CardTitle>
            <Star className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{greenPoints}</div>
            <p className="text-xs text-success">
              Earned for responsible segregation
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{complaints.length}</div>
            <p className="text-xs text-muted-foreground">
              {complaints.filter(c => c.status === 'resolved').length} resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submit New Complaint */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Submit New Complaint</CardTitle>
          <CardDescription>Report issues with waste collection or management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title</Label>
              <Input id="title" placeholder="Brief description of the issue" value={newComplaint.title} onChange={e => setNewComplaint(prev => ({
              ...prev,
              title: e.target.value
            }))} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea id="description" placeholder="Provide detailed information about the issue..." value={newComplaint.description} onChange={e => setNewComplaint(prev => ({
            ...prev,
            description: e.target.value
          }))} rows={4} />
          </div>

          <Button onClick={handleSubmitComplaint} className="gradient-primary text-white shadow-primary">
            Submit Complaint
          </Button>
        </CardContent>
      </Card>

      {/* My Complaints */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">My Complaints</CardTitle>
          <CardDescription>Track the status of your submitted complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaints.map(complaint => <div key={complaint.id} className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-quick">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-foreground">{complaint.title}</h3>
                    <Badge className={getStatusColor(complaint.status as any)}>
                      {getStatusIcon(complaint.status as any)}
                      <span className="ml-1 capitalize">{complaint.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{complaint.description}</p>
                  <p className="text-xs text-muted-foreground">Submitted on {complaint.date}</p>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Collection Schedule */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Collection Schedule</CardTitle>
          <CardDescription>Upcoming waste collection in your area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[{
            day: "Tomorrow",
            type: "Dry Waste",
            time: "8:00 AM",
            color: "text-accent"
          }, {
            day: "Day After",
            type: "Wet Waste",
            time: "8:00 AM",
            color: "text-success"
          }, {
            day: "Friday",
            type: "Hazardous Waste",
            time: "10:00 AM",
            color: "text-destructive"
          }].map((schedule, index) => <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium text-foreground">{schedule.day}</p>
                    <p className={`text-sm ${schedule.color}`}>{schedule.type}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{schedule.time}</span>
              </div>)}
          </div>
        </CardContent>
      </Card>
    </div>;
}