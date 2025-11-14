import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Package, ArrowLeft } from "lucide-react";

export function PickupRequestPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, refreshProfile } = useAuth();
  const [wards, setWards] = useState<Array<{ id: string; name: string; zone: string }>>([]);
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWards();
    if (userProfile?.ward_id) {
      setSelectedWard(userProfile.ward_id);
    }
  }, [userProfile]);

  const fetchWards = async () => {
    const { data, error } = await supabase.from('wards').select('*').order('name');
    if (data && !error) {
      setWards(data);
    }
  };

  const handleSubmit = async () => {
    if (!selectedWard) {
      toast({
        title: "No ward selected",
        description: "Please select a ward to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update user's ward if different
      if (userProfile?.ward_id !== selectedWard) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ ward_id: selectedWard })
          .eq('auth_user_id', userProfile?.auth_user_id);
        
        if (updateError) throw updateError;
        await refreshProfile();
      }

      // Create pickup request
      const { error } = await supabase.from('waste_collections').insert({
        collector_id: null,
        ward_id: selectedWard,
        date: new Date().toISOString(),
        waste_type: 'dry',
        status: 'pending',
        location: 'Resident pickup request'
      });

      if (error) throw error;

      toast({
        title: "Pickup requested successfully",
        description: "Your waste pickup request has been submitted."
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Request failed",
        description: "Failed to submit pickup request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Request Waste Pickup
            </CardTitle>
            <CardDescription>
              Select your ward and submit a pickup request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ward" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Select Your Ward
              </Label>
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger id="ward">
                  <SelectValue placeholder="Choose a ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.id}>
                      {ward.name} - {ward.zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="font-medium text-foreground mb-2">Request Details</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Waste Type: Dry Waste</li>
                <li>• Status: Pending Assignment</li>
                <li>• Location: Your registered address</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedWard}
              className="w-full gradient-primary text-white shadow-primary"
            >
              <Package className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Pickup Request"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}