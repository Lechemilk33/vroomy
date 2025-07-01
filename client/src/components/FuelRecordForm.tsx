import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import type { Vehicle, FuelStation } from "@shared/schema";

const fuelRecordFormSchema = z.object({
  vehicleId: z.number().min(1, "Please select a vehicle"),
  vehicleName: z.string().min(1, "Vehicle name is required"),
  stationId: z.number().min(1, "Please select a fuel station"),
  stationName: z.string().min(1, "Station name is required"),
  amount: z.number().min(0.1, "Amount must be greater than 0"),
  pricePerGallon: z.number().min(0.01, "Price must be greater than 0"),
  totalCost: z.number().min(0.01, "Total cost must be greater than 0"),
  mileage: z.number().optional(),
  notes: z.string().optional(),
});

type FuelRecordFormData = z.infer<typeof fuelRecordFormSchema>;

interface FuelRecordFormProps {
  vehicles: Vehicle[];
  fuelStations: FuelStation[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function FuelRecordForm({ vehicles, fuelStations, onClose, onSuccess }: FuelRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FuelRecordFormData>({
    resolver: zodResolver(fuelRecordFormSchema),
    defaultValues: {
      amount: 0,
      pricePerGallon: 0,
      totalCost: 0,
      notes: "",
    },
  });

  const selectedVehicleId = form.watch("vehicleId");
  const selectedStationId = form.watch("stationId");
  const amount = form.watch("amount");
  const pricePerGallon = form.watch("pricePerGallon");

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const selectedStation = fuelStations.find(s => s.id === selectedStationId);

  // Update vehicle name when vehicle is selected
  useEffect(() => {
    if (selectedVehicle && form.getValues("vehicleName") !== selectedVehicle.name) {
      form.setValue("vehicleName", selectedVehicle.name);
      form.setValue("mileage", selectedVehicle.mileage);
    }
  }, [selectedVehicle, form]);

  // Update station name when station is selected
  useEffect(() => {
    if (selectedStation && form.getValues("stationName") !== selectedStation.name) {
      form.setValue("stationName", selectedStation.name);
      form.setValue("pricePerGallon", selectedStation.currentPrice);
    }
  }, [selectedStation, form]);

  // Auto-calculate total cost
  useEffect(() => {
    if (amount > 0 && pricePerGallon > 0) {
      const total = amount * pricePerGallon;
      form.setValue("totalCost", parseFloat(total.toFixed(2)));
    }
  }, [amount, pricePerGallon, form]);

  const onSubmit = async (data: FuelRecordFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/fuel-records", data);
      onSuccess();
    } catch (error) {
      console.error("Failed to create fuel record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rentxotic-card mb-8">
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Add Fuel Record</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-grid">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Vehicle</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="form-control">
                        <SelectValue placeholder="Select Vehicle..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Fuel Amount (Gallons)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.1" 
                      placeholder="12.5"
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
              name="pricePerGallon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Cost per Gallon</FormLabel>
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
              name="totalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Total Cost</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01" 
                      placeholder="53.13"
                      className="form-control"
                      readOnly
                      value={field.value.toFixed(2)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Fuel Station</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="form-control">
                        <SelectValue placeholder="Select Station..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fuelStations.map((station) => (
                        <SelectItem key={station.id} value={station.id.toString()}>
                          {station.name} - ${station.currentPrice.toFixed(2)}/gal
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Current Mileage</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      placeholder="15234"
                      className="form-control"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ''}
                    />
                  </FormControl>
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
                  <Textarea {...field} rows={2} placeholder="Additional notes..." className="form-control" />
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
              {isSubmitting ? "Adding..." : "⛽ Add Record"}
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
