import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { FuelStation } from "@shared/schema";

interface FuelStationCardProps {
  station: FuelStation;
  onUpdate: () => void;
}

export default function FuelStationCard({ station, onUpdate }: FuelStationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePrice = async () => {
    const newPrice = prompt(`Update price for ${station.name}:`, station.currentPrice.toString());
    
    if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
      setIsUpdating(true);
      try {
        await apiRequest("PUT", `/api/fuel-stations/${station.id}`, {
          currentPrice: parseFloat(newPrice)
        });
        onUpdate();
      } catch (error) {
        console.error("Failed to update station price:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this fuel station?')) {
      try {
        await apiRequest("DELETE", `/api/fuel-stations/${station.id}`);
        onUpdate();
      } catch (error) {
        console.error("Failed to delete station:", error);
      }
    }
  };

  return (
    <div className="fuel-station-card">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-lg font-semibold text-[var(--text-primary)]">{station.name}</h4>
        <span className="text-lg font-bold text-[var(--accent)]">${station.currentPrice.toFixed(2)}</span>
      </div>
      
      <div className="text-sm text-[var(--text-secondary)] mb-2">
        📍 {station.address}
      </div>
      
      <div className="station-rating mb-2">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`star ${i < station.rating ? '' : 'empty'}`}>★</span>
        ))}
        <span className="ml-1 text-sm text-[var(--text-secondary)]">({station.rating}/5)</span>
      </div>
      
      {station.notes && (
        <div className="text-sm text-[var(--text-muted)] mb-2">
          {station.notes}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          onClick={handleUpdatePrice}
          disabled={isUpdating}
          className="btn-rentxotic btn-sm"
        >
          💰 Update Price
        </Button>
        <Button 
          onClick={handleDelete}
          className="btn-rentxotic btn-danger btn-sm"
        >
          🗑️ Delete
        </Button>
      </div>
    </div>
  );
}
