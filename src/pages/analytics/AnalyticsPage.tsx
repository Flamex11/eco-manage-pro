import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Download, Calendar, MapPin, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  date: string;
  ward_id: string;
  total_collections: number;
  segregated_percentage: number;
  complaints_count: number;
}

interface Ward {
  id: string;
  name: string;
  zone: string;
}

export function AnalyticsPage() {
  const { userProfile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWards();
    fetchAnalytics();
  }, [selectedWard, selectedPeriod]);

  const fetchWards = async () => {
    try {
      const { data, error } = await supabase
        .from('wards')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching wards:', error);
        return;
      }

      setWards(data || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      let query = supabase.from('analytics').select('*');

      if (selectedWard !== 'all') {
        query = query.eq('ward_id', selectedWard);
      }

      // Filter by date range
      const daysAgo = parseInt(selectedPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      query = query.gte('date', startDate.toISOString().split('T')[0]);

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        return;
      }

      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return analytics.reduce((acc, curr) => ({
      totalCollections: acc.totalCollections + curr.total_collections,
      avgSegregation: acc.avgSegregation + curr.segregated_percentage,
      totalComplaints: acc.totalComplaints + curr.complaints_count,
    }), { totalCollections: 0, avgSegregation: 0, totalComplaints: 0 });
  };

  const totals = calculateTotals();
  const avgSegregation = analytics.length > 0 ? totals.avgSegregation / analytics.length : 0;

  const exportData = () => {
    const csvContent = [
      ['Date', 'Ward', 'Total Collections', 'Segregation %', 'Complaints'],
      ...analytics.map(row => [
        row.date,
        wards.find(w => w.id === row.ward_id)?.name || 'Unknown',
        row.total_collections,
        row.segregated_percentage,
        row.complaints_count
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        </div>
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive waste management insights and reports</p>
        </div>
        
        <Button onClick={exportData} className="gradient-primary text-white shadow-primary">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-soft border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Ward</label>
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.id}>
                      {ward.name} ({ward.zone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collections</CardTitle>
            <Trash2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totals.totalCollections.toLocaleString()}</div>
            <p className="text-xs text-success">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              Across all selected wards
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Segregation Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgSegregation.toFixed(1)}%</div>
            <p className="text-xs text-success">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              Quality waste separation
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Complaints</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totals.totalComplaints}</div>
            <p className="text-xs text-muted-foreground">
              Issues reported
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Chart Placeholder */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Collection Trends</CardTitle>
          <CardDescription>Daily waste collection and segregation rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive charts will be displayed here</p>
              <p className="text-sm text-muted-foreground mt-2">
                Showing data for {selectedPeriod} days 
                {selectedWard !== 'all' && ` in ${wards.find(w => w.id === selectedWard)?.name}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Data Table */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Analytics Data</CardTitle>
          <CardDescription>Latest waste management statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-quick">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {wards.find(w => w.id === item.ward_id)?.name || 'Unknown Ward'}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="font-medium text-foreground">{item.total_collections}</p>
                    <p className="text-muted-foreground">collections</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{item.segregated_percentage}%</p>
                    <p className="text-muted-foreground">segregated</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{item.complaints_count}</p>
                    <p className="text-muted-foreground">complaints</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}