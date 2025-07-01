import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { FuelRecord } from "@shared/schema";

interface FuelRecordCardProps {
  record: FuelRecord;
  onDelete: () => void;
}

export default function FuelRecordCard({ record, onDelete }: FuelRecordCardProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this fuel record?')) {
      onDelete();
    }
  };

  return (
    <div className="fuel-record-card">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-base font-semibold text-[var(--text-primary)]">{record.vehicleName}</h4>
        <span className="text-lg font-bold text-[var(--primary)]">${record.totalCost.toFixed(2)}</span>
      </div>
      
      <div className="text-sm text-[var(--text-secondary)] space-y-1 mb-2">
        <div>⛽ {record.amount} gallons @ ${record.pricePerGallon.toFixed(2)}/gal</div>
        <div>🏪 {record.stationName}</div>
        <div>📅 {formatDate(record.createdAt)}</div>
        <div>🛣️ {record.mileage?.toLocaleString() || 'N/A'} miles</div>
      </div>
      
      {record.notes && (
        <div className="text-sm text-[var(--text-muted)] italic mb-2">
          "{record.notes}"
        </div>
      )}
      
      <div>
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
