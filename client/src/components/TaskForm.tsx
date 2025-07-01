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
import type { Vehicle } from "@shared/schema";

const taskFormSchema = z.object({
  vehicleId: z.number().min(1, "Please select a vehicle"),
  vehicleName: z.string().min(1, "Vehicle name is required"),
  type: z.enum(["wash", "delivery", "pickup", "service", "fuel", "inspection", "photos", "other"]),
  priority: z.enum(["normal", "high", "urgent"]),
  assigned: z.string().min(1, "Please enter who this task is assigned to"),
  description: z.string().min(1, "Please enter a task description"),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  vehicles: Vehicle[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskForm({ vehicles, onClose, onSuccess }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      type: "wash",
      priority: "normal",
      assigned: "",
      description: "",
    },
  });

  const selectedVehicleId = form.watch("vehicleId");
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Update vehicle name when vehicle is selected
  if (selectedVehicle && form.getValues("vehicleName") !== selectedVehicle.name) {
    form.setValue("vehicleName", selectedVehicle.name);
  }

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/tasks", {
        ...data,
        completed: false,
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rentxotic-card mb-8">
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Add New Task</h3>
      
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Task Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="form-control">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="wash">Wash & Detail</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="fuel">Fuel</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="photos">Photos</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="form-control">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">URGENT</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assigned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Assigned To</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter name..." className="form-control" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} placeholder="Task details..." className="form-control" />
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
              {isSubmitting ? "Adding..." : "➕ Add Task"}
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
