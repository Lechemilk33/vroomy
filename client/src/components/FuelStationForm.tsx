import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

const fuelStationFormSchema = z.object({
  name: z.string().min(1, "Station name is required"),
  address: z.string().min(1, "Address is required"),
  currentPrice: z.number().min(0.01, "Price must be greater than 0"),
  rating: z.number().min(1).max(5),
  notes: z.string().optional(),
});

type FuelStationFormData = z.infer<typeof fuelStationFormSchema>;

interface FuelStationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function FuelStationForm({ onClose, onSuccess }: FuelStationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FuelStationFormData>({
    resolver: zodResolver(fuelStationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      currentPrice: 0,
      rating: 5,
      notes: "",
    },
  });

  const onSubmit = async (data: FuelStationFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/fuel-stations", data);
      onSuccess();
    } catch (error) {
      console.error("Failed to create fuel station:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rentxotic-card mb-8">
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Add Fuel Station</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-grid">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Station Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Shell La Jolla" className="form-control" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Prospect St, La Jolla, CA" className="form-control" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currentPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Current Price ($/gal)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01" 
                      placeholder="4.25"
                      className="form-control"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Rating (1-5)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger className="form-control">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} placeholder="Station quality, amenities, etc..." className="form-control" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-rentxotic btn-success"
            >
              {isSubmitting ? "Adding..." : "🏪 Add Station"}
            </Button>
            <Button 
              type="button" 
              onClick={onClose}
              className="btn-rentxotic"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
