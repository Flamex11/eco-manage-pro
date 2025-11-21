import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface CollectionHistory {
  id: string;
  date: string;
  waste_type: string;
  status: string;
  location?: string;
  notes?: string;
  created_at: string;
}

export function CollectionHistoryPage() {
  const { userProfile } = useAuth();
  const [collections, setCollections] = useState<CollectionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const fetchCollectionHistory = async () => {
    if (!userProfile?.ward_id) return;

    setLoading(true);
    try {
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0);

      const { data, error } = await supabase
        .from("waste_collections")
        .select("*")
        .eq("ward_id", userProfile.ward_id)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"))
        .order("date", { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error("Error fetching collection history:", error);
      toast.error("Failed to load collection history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionHistory();
  }, [selectedMonth, selectedYear, userProfile?.ward_id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "collected":
        return "text-success";
      case "pending":
        return "text-warning";
      default:
        return "text-destructive";
    }
  };

  const downloadPDF = () => {
    const monthName = months.find(m => m.value === selectedMonth)?.label;
    const content = `
      <html>
        <head>
          <title>Collection History - ${monthName} ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #10b981; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #10b981; color: white; }
            .collected { color: #10b981; }
            .pending { color: #f59e0b; }
            .missed { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>Garbage Collection History</h1>
          <p><strong>Period:</strong> ${monthName} ${selectedYear}</p>
          <p><strong>Ward:</strong> ${userProfile?.ward_id}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Waste Type</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${collections.map(c => `
                <tr>
                  <td>${format(new Date(c.date), "MMM dd, yyyy")}</td>
                  <td>${format(new Date(c.date), "EEEE")}</td>
                  <td>${c.waste_type}</td>
                  <td class="${c.status}">${c.status.toUpperCase()}</td>
                  <td>${c.location || "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `collection-history-${monthName}-${selectedYear}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("History downloaded successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Collection History</h1>
            <p className="text-muted-foreground mt-1">View your garbage collection schedule and status</p>
          </div>
          <Calendar className="w-8 h-8 text-primary" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter by Month & Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-foreground mb-2 block">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-foreground mb-2 block">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={downloadPDF} disabled={collections.length === 0} className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">No collection history found</p>
                <p className="text-muted-foreground mt-1">
                  No garbage collections recorded for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Waste Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collections.map((collection) => (
                      <TableRow key={collection.id}>
                        <TableCell className="font-medium">
                          {format(new Date(collection.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{format(new Date(collection.date), "EEEE")}</TableCell>
                        <TableCell>{format(new Date(collection.created_at), "hh:mm a")}</TableCell>
                        <TableCell className="capitalize">{collection.waste_type}</TableCell>
                        <TableCell>
                          <span className={`font-medium uppercase ${getStatusColor(collection.status)}`}>
                            {collection.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {collection.location || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
