import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Calendar, Bell, Camera, CheckCircle, Clock, AlertTriangle, Package, Star, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function ResidentDashboard() {
  const {
    toast
  } = useToast();
  const [greenPoints] = useState(247); // Gamification points
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Request Waste Pickup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full gradient-primary text-white shadow-primary">
              <Package className="w-4 h-4 mr-2" />
              Request Pickup 📦
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Raise Complaint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-warning text-warning hover:bg-warning hover:text-warning-foreground">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Issue
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
            <div className="space-y-2">
              <Label htmlFor="photo">Add Photo (Optional)</Label>
              <Button variant="outline" className="w-full justify-start">
                <Camera className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
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