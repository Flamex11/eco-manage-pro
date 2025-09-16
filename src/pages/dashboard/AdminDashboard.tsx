import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle, Users, MapPin, TrendingUp, CheckCircle, FileText, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">City at a glance 🌍</h1>
          <p className="text-muted-foreground">Monitor and manage waste collection to keep our city clean and healthy</p>
        </div>
        <Button className="gradient-primary text-white shadow-primary">
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collections</CardTitle>
            <Trash2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2,847</div>
            <p className="text-xs text-success">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recycling Statistics ♻️</CardTitle>
            <Recycle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">87.3%</div>
            <p className="text-xs text-success">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +5.2% segregation rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Complaints</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">23</div>
            <p className="text-xs text-destructive">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +3 new today
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Collectors</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">45</div>
            <p className="text-xs text-success">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              92% availability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Waste Type Analytics</CardTitle>
            <CardDescription>Pie chart: Waste type ratio (wet/dry/hazardous) ♻️</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Pie chart: 45% Wet, 35% Dry, 15% Recyclable, 5% Hazardous</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Collection Trends</CardTitle>
            <CardDescription>Line graph: Collection trends across wards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { ward: "Ward 1", percentage: 92, zone: "North Zone" },
                { ward: "Ward 2", percentage: 88, zone: "North Zone" },
                { ward: "Ward 3", percentage: 84, zone: "South Zone" },
                { ward: "Ward 4", percentage: 91, zone: "South Zone" },
                { ward: "Ward 5", percentage: 86, zone: "East Zone" },
              ].map((item) => (
                <div key={item.ward} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.ward}</p>
                    <p className="text-sm text-muted-foreground">{item.zone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full gradient-primary transition-smooth"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-10 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <CardDescription>Latest updates from the waste management system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Complaint resolved",
                details: "Overflowing bin at Sector 15 - Ward 3",
                time: "2 minutes ago",
                type: "success"
              },
              {
                action: "Collection completed",
                details: "Wet waste collection in Ward 1 by Collector #23",
                time: "15 minutes ago",
                type: "info"
              },
              {
                action: "New complaint",
                details: "Irregular collection reported in Ward 5",
                time: "1 hour ago",
                type: "warning"
              },
              {
                action: "User registered",
                details: "New resident joined Ward 2",
                time: "2 hours ago",
                type: "info"
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-quick">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-success' :
                  activity.type === 'warning' ? 'bg-warning' :
                  'bg-info'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}