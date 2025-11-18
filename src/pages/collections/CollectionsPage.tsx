import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, Filter, Plus, MapPin, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface WasteCollection {
  id: string;
  date: string;
  waste_type: 'wet' | 'dry' | 'hazardous';
  status: 'pending' | 'collected';
  location: string;
  notes?: string;
  collector_id: string;
  ward_id: string;
}

export function CollectionsPage() {
  const { userProfile, userRole } = useAuth();
  const [collections, setCollections] = useState<WasteCollection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, [userProfile]);

  const fetchCollections = async () => {
    if (!userProfile) return;

    try {
      let query = supabase.from('waste_collections').select('*');

      if (userRole === 'collector') {
        query = query.eq('collector_id', userProfile.id);
      } else if (userRole === 'admin') {
        // Admins can see all collections
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Error fetching collections:', error);
        return;
      }

      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(collection =>
    collection.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.waste_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getWasteTypeColor = (type: string) => {
    switch (type) {
      case 'wet': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'dry': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'hazardous': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const toggleCollectionStatus = async (collectionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'collected' : 'pending';
    
    try {
      const { error } = await supabase
        .from('waste_collections')
        .update({ status: newStatus })
        .eq('id', collectionId);

      if (error) {
        console.error('Error updating collection:', error);
        return;
      }

      setCollections(prev => 
        prev.map(collection => 
          collection.id === collectionId 
            ? { ...collection, status: newStatus as 'pending' | 'collected' }
            : collection
        )
      );
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Collections</h1>
        </div>
        <div className="text-center py-8">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Collections</h1>
          <p className="text-muted-foreground">
            {userRole === 'collector' 
              ? 'Manage your assigned waste collections'
              : 'Monitor waste collections across all wards'
            }
          </p>
        </div>
        
        {userRole === 'admin' && (
          <Button className="gradient-primary text-white shadow-primary">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Collection
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by location or waste type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border focus:ring-primary"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <Card key={collection.id} className="shadow-soft border-border/50 hover:shadow-medium transition-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-primary" />
                  <Badge className={getWasteTypeColor(collection.waste_type)}>
                    {collection.waste_type}
                  </Badge>
                </div>
                <Badge className={getStatusColor(collection.status)}>
                  {collection.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{collection.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(collection.date).toLocaleDateString()}</span>
              </div>

              {collection.notes && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                  {collection.notes}
                </p>
              )}

              {userRole === 'collector' && (
                <Button
                  variant={collection.status === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => toggleCollectionStatus(collection.id, collection.status)}
                >
                  {collection.status === 'pending' ? 'Mark as Collected' : 'Mark as Pending'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <Card className="shadow-soft border-border/50">
          <CardContent className="text-center py-8">
            <Trash2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No collections found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No collections have been scheduled yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}