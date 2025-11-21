import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Calendar, Download, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CollectionRecord {
  id: string;
  date: string;
  waste_type?: string;
  status: string;
  location?: string;
  notes?: string;
  created_at?: string;
}

const MONTHS = [
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

const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "collected":
      return <Badge className="bg-success text-success-foreground">Collected</Badge>;
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    default:
      return <Badge variant="destructive">Missed</Badge>;
  }
};

export function CollectionHistoryPage() {
  const { userProfile, userRole } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCollections = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const startDate = startOfMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth)));
      const endDate = endOfMonth(startDate);

      let query = supabase
        .from('waste_collections')
        .select('*')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      // Filter based on role
      if (userRole === 'resident') {
        query = query.eq('ward_id', userProfile.ward_id);
      } else if (userRole === 'collector') {
        query = query.eq('collector_id', userProfile.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate missed collections for the month
      const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
      const collectionDates = new Set(data?.map(d => d.date) || []);
      
      const enrichedData = [...(data || [])];
      
      // Add "missed" entries for days without collections (only for past dates)
      const today = new Date();
        allDaysInMonth.forEach(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        if (!collectionDates.has(dayStr) && day < today) {
          enrichedData.push({
            id: `missed-${dayStr}`,
            date: dayStr,
            waste_type: undefined,
            status: 'missed',
            created_at: undefined,
          } as any);
        }
      });

      // Sort by date descending
      enrichedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setCollections(enrichedData);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch collection history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [selectedMonth, selectedYear, userProfile, userRole]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Garbage Collection History", 14, 20);
    
    // Add subtitle with month and year
    doc.setFontSize(12);
    const monthName = MONTHS[parseInt(selectedMonth)].label;
    doc.text(`${monthName} ${selectedYear}`, 14, 30);
    
    // Add user info
    doc.setFontSize(10);
    doc.text(`User: ${userProfile?.name}`, 14, 38);
    doc.text(`Role: ${userRole}`, 14, 44);
    
    // Prepare table data
    const tableData = collections.map(collection => [
      format(new Date(collection.date), 'dd/MM/yyyy'),
      format(new Date(collection.date), 'EEEE'),
      collection.created_at ? format(new Date(collection.created_at), 'HH:mm') : '-',
      collection.status.charAt(0).toUpperCase() + collection.status.slice(1),
      collection.waste_type || '-',
      collection.location || '-',
    ]);
    
    // Add table
    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Day', 'Time', 'Status', 'Type', 'Location']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
    });
    
    // Save the PDF
    doc.save(`collection-history-${monthName}-${selectedYear}.pdf`);
    
    toast({
      title: "Success",
      description: "PDF downloaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Collection History</h1>
        <p className="text-muted-foreground mt-2">
          View your monthly garbage collection records
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly History
              </CardTitle>
              <CardDescription>
                Select a month and year to view collection records
              </CardDescription>
            </div>
            
            <Button 
              onClick={downloadPDF} 
              disabled={collections.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Month
              </label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Year
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {getYears().map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:self-end">
              <Button 
                onClick={fetchCollections} 
                variant="outline"
                className="gap-2 w-full sm:w-auto"
              >
                <Filter className="h-4 w-4" />
                Apply Filter
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No collection history found
              </h3>
              <p className="text-muted-foreground">
                There are no collection records for {MONTHS[parseInt(selectedMonth)].label} {selectedYear}
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">
                        {format(new Date(collection.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(collection.date), 'EEEE')}
                      </TableCell>
                      <TableCell>
                        {collection.created_at 
                          ? format(new Date(collection.created_at), 'HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(collection.status)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {collection.waste_type || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {collection.location || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {collections.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  {collections.filter(c => c.status === 'collected').length}
                </div>
                <div className="text-sm text-muted-foreground">Collected</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {collections.filter(c => c.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <div className="text-2xl font-bold text-destructive">
                  {collections.filter(c => c.status === 'missed').length}
                </div>
                <div className="text-sm text-muted-foreground">Missed</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
