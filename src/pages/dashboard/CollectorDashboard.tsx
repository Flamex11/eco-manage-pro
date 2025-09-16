import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, MapPin, Clock, CheckCircle, AlertCircle, Route, AlertTriangle } from "lucide-react";

export function CollectorDashboard() {
  const [collections, setCollections] = useState([
    {
      id: 1,
      location: "Sector 12, Block A",
      wasteType: "wet",
      status: "pending",
      time: "09:00 AM",
      households: 45,
    },
    {
      id: 2,
      location: "Sector 12, Block B", 
      wasteType: "dry",
      status: "pending",
      time: "10:30 AM",
      households: 38,
    },
    {
      id: 3,
      location: "Sector 15, Commercial",
      wasteType: "hazardous",
      status: "pending", 
      time: "02:00 PM",
      households: 12,
    },
  ]);

  const markAsCollected = (id: number) => {
    setCollections(prev => 
      prev.map(collection => 
        collection.id === id 
          ? { ...collection, status: "collected" }
          : collection
      )
    );
  };

  const getWasteTypeColor = (type: string) => {
    switch (type) {
      case 'wet': return 'bg-success text-success-foreground';
      case 'dry': return 'bg-accent text-accent-foreground';
      case 'hazardous': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'collected' 
      ? 'bg-success text-success-foreground' 
      : 'bg-warning text-warning-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ready to make the city cleaner today? 🚛</h1>
          <p className="text-muted-foreground">Your daily collections make our community healthier and greener</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            View Map 🗺️
          </Button>
          <Button className="gradient-primary text-white shadow-primary">
            <Trash2 className="w-4 h-4 mr-2" />
            Start Route
          </Button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Collections</CardTitle>
            <Trash2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {collections.filter(c => c.status === 'collected').length} / {collections.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Collections completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Households Covered</CardTitle>
            <MapPin className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {collections.filter(c => c.status === 'collected').reduce((sum, c) => sum + c.households, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {collections.reduce((sum, c) => sum + c.households, 0)} total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Collection</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {collections.find(c => c.status === 'pending')?.time || "All Done!"}
            </div>
            <p className="text-xs text-muted-foreground">
              {collections.find(c => c.status === 'pending')?.location || "Great work today"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Collection Schedule */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Today's Collection Schedule</CardTitle>
          <CardDescription>Your assigned routes and collection points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collections.map((collection) => (
              <div 
                key={collection.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-quick"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {collection.status === 'collected' ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{collection.location}</p>
                      <p className="text-sm text-muted-foreground">
                        {collection.households} households • {collection.time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getWasteTypeColor(collection.wasteType)}>
                    {collection.wasteType.charAt(0).toUpperCase() + collection.wasteType.slice(1)} Waste
                  </Badge>
                  
                  <Badge className={getStatusColor(collection.status)}>
                    {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
                  </Badge>

                  {collection.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => markAsCollected(collection.id)}
                      className="gradient-primary text-white"
                    >
                      Mark Collected
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

          {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription>Report roadblocks and delays to admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-warning text-warning hover:bg-warning hover:text-warning-foreground" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Roadblock/Delay
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              View Full Route Map 🗺️
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              Request Schedule Change
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Weekly Progress</CardTitle>
            <CardDescription>Your collection performance this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { day: "Monday", collections: 12, target: 15 },
                { day: "Tuesday", collections: 15, target: 15 },
                { day: "Wednesday", collections: 14, target: 15 },
                { day: "Thursday", collections: 13, target: 15 },
                { day: "Today", collections: collections.filter(c => c.status === 'collected').length, target: collections.length },
              ].map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{day.day}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full gradient-primary transition-smooth"
                        style={{ width: `${(day.collections / day.target) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {day.collections}/{day.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}