import { Button } from "@/components/ui/button";
import type { Vehicle } from "@shared/schema";

interface VehicleCardProps {
  vehicle: Vehicle;
  onUpdateStatus: (vehicle: Vehicle) => void;
  onMarkReady: (vehicle: Vehicle) => void;
  onCreateFuelTask: (vehicle: Vehicle) => void;
  onMarkWashed: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, onUpdateStatus, onMarkReady, onCreateFuelTask, onMarkWashed }: VehicleCardProps) {
  const fuelBarClass = vehicle.fuelLevel > 50 ? 'high' : vehicle.fuelLevel > 25 ? 'medium' : 'low';

  return (
    <div className="vehicle-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{vehicle.name}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{vehicle.type} • {vehicle.color}</p>
        </div>
        <div className="flex flex-col gap-1">
          <span className={`badge badge-${vehicle.status}`}>{vehicle.status.toUpperCase()}</span>
          <span className={`badge ${vehicle.washed ? 'badge-available' : 'badge-urgent'}`}>
            {vehicle.washed ? '🧽 CLEAN' : '🧽 NEEDS WASH'}
          </span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-[var(--text-secondary)]">Fuel Level</span>
          <span className="text-sm font-semibold">{vehicle.fuelLevel}%</span>
        </div>
        <div className="fuel-bar">
          <div className={`fuel-fill ${fuelBarClass}`} style={{ width: `${vehicle.fuelLevel}%` }}></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-[var(--text-secondary)]">Condition:</span>
          <span className="ml-2 font-semibold capitalize">{vehicle.condition}</span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)]">Mileage:</span>
          <span className="ml-2 font-semibold">{vehicle.mileage.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-[var(--text-secondary)]">Location:</span>
          <span className="ml-2 font-semibold">{vehicle.location}</span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)]">Last Wash:</span>
          <span className="ml-2 font-semibold">
            {vehicle.lastWash ? new Date(vehicle.lastWash).toLocaleDateString() : 'Never'}
          </span>
        </div>
      </div>
      
      {vehicle.issues && vehicle.issues.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Issues:</div>
          <div className="flex flex-wrap gap-1">
            {vehicle.issues.map((issue, index) => (
              <span 
                key={index} 
                className={`badge ${
                  issue === 'Low Fuel' || issue === 'Needs Wash' ? 'badge-urgent' : 'badge-normal'
                }`}
              >
                {issue}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => onUpdateStatus(vehicle)}
          className="btn-rentxotic btn-sm"
        >
          📊 Update
        </Button>
        <Button 
          onClick={() => onMarkReady(vehicle)}
          className="btn-rentxotic btn-success btn-sm"
        >
          ✅ Ready
        </Button>
        {!vehicle.washed && (
          <Button 
            onClick={() => onMarkWashed(vehicle)}
            className="btn-rentxotic btn-sm"
          >
            🧽 Wash
          </Button>
        )}
        {vehicle.fuelLevel < 30 && (
          <Button 
            onClick={() => onCreateFuelTask(vehicle)}
            className="btn-rentxotic btn-sm"
          >
            ⛽ Fuel
          </Button>
        )}
      </div>
    </div>
  );
}
