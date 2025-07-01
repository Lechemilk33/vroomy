import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Fuel, 
  Wrench, 
  MapPin, 
  Calendar,
  Users,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Download,
  Bell,
  Settings,
  Star,
  Zap,
  Shield,
  X,
  Loader2,
  Droplets
} from 'lucide-react';

const FleetDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();

  // API calls
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      return response.json();
    }
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }
  });

  // Mutations
  const createVehicleMutation = useMutation({
    mutationFn: async (vehicleData) => {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
      });
      if (!response.ok) throw new Error('Failed to create vehicle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowVehicleModal(false);
    }
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update vehicle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setEditingVehicle(null);
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowTaskModal(false);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // AI Chat Processing
  const processAICommand = async (command) => {
    setIsProcessing(true);
    
    try {
      const prompt = `
You are Vroom, the friendly AI assistant for RentXotic luxury car rental fleet management.

Parse this command: "${command}"

Available vehicles: ${vehicles.map(v => `${v.name} (ID: ${v.id}, Status: ${v.status})`).join(', ')}

Return JSON only:
{
  "action": "create_task" | "update_vehicle" | "unknown",
  "details": {
    "vehicle_id": number | null,
    "task_title": "brief title",
    "description": "what was done/needed",
    "priority": "normal" | "high" | "urgent",
    "status": "pending" | "completed",
    "fuel_level": number | null,
    "vehicle_status": "available" | "rented" | "maintenance" | null,
    "last_washed": "ISO date string" | null
  },
  "confirmation": "friendly confirmation message from Vroom"
}

For "washed the ferrari" = completed cleaning task AND update last_washed to today
For "needs oil change" = pending maintenance task
For "fuel at 85%" = update fuel level
For "now available" = update status

Your entire response MUST be valid JSON only.
`;

      const response = await window.claude.complete(prompt);
      const aiResponse = JSON.parse(response);
      
      // Execute the action
      switch (aiResponse.action) {
        case 'create_task':
          await createTaskMutation.mutateAsync({
            title: aiResponse.details.task_title,
            description: aiResponse.details.description,
            vehicle_id: aiResponse.details.vehicle_id,
            priority: aiResponse.details.priority || 'normal',
            status: aiResponse.details.status || 'pending',
            due_date: new Date().toISOString().split('T')[0],
            assigned_to: 'Vroom AI'
          });
          
          // If it's a wash task, update the vehicle's last_washed date
          if (aiResponse.details.last_washed && aiResponse.details.vehicle_id) {
            await updateVehicleMutation.mutateAsync({
              id: aiResponse.details.vehicle_id,
              last_washed: aiResponse.details.last_washed
            });
          }
          break;
          
        case 'update_vehicle':
          const updates = {};
          if (aiResponse.details.fuel_level !== null) updates.fuel_level = aiResponse.details.fuel_level;
          if (aiResponse.details.vehicle_status) updates.status = aiResponse.details.vehicle_status;
          if (aiResponse.details.last_washed) updates.last_washed = aiResponse.details.last_washed;
          
          await updateVehicleMutation.mutateAsync({
            id: aiResponse.details.vehicle_id,
            ...updates
          });
          break;
      }
      
      setChatMessages(prev => [...prev, 
        { type: 'user', text: command, time: new Date().toLocaleTimeString() },
        { type: 'assistant', text: aiResponse.confirmation, time: new Date().toLocaleTimeString() }
      ]);
      
    } catch (error) {
      setChatMessages(prev => [...prev, 
        { type: 'user', text: command, time: new Date().toLocaleTimeString() },
        { type: 'assistant', text: 'Oops! I didn\'t quite understand that. Try "washed the Ferrari 488" or "BMW needs oil change" 🚗', time: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setIsProcessing(false);
      setChatInput('');
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;
    await processAICommand(chatInput.trim());
  };

  // Calculate stats from real data
  const fleetStats = {
    totalVehicles: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    rented: vehicles.filter(v => v.status === 'rented').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    utilization: vehicles.length > 0 ? Math.round((vehicles.filter(v => v.status === 'rented').length / vehicles.length) * 100) : 0,
    activeTasks: tasks.filter(t => t.status !== 'completed').length,
    urgentTasks: tasks.filter(t => t.priority === 'urgent').length,
    topPerformer: vehicles.find(v => v.status === 'rented')?.name || 'No active rentals'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rented': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'maintenance': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'normal': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'pristine': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'excellent': return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      case 'good': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const getDaysSinceWash = (lastWashed) => {
    if (!lastWashed) return null;
    const washDate = new Date(lastWashed);
    const today = new Date();
    const diffTime = Math.abs(today - washDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getWashStatusColor = (days) => {
    if (!days) return 'text-gray-500';
    if (days === 0) return 'text-emerald-600';
    if (days <= 3) return 'text-green-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCompleteTask = (taskId) => {
    updateTaskMutation.mutate({ id: taskId, status: 'completed' });
  };

  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Vehicle,Status,Location,Fuel,Mileage,Last Washed\n" +
      vehicles.map(v => `${v.name},${v.status},${v.location},${v.fuel_level || 'N/A'},${v.mileage || 'N/A'},${v.last_washed || 'Never'}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fleet-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, gradient, iconColor = "white" }) => (
    <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className={`h-7 w-7 text-${iconColor}`} />
          </div>
        </div>
      </div>
    </div>
  );

  const VehicleCard = ({ vehicle }) => {
    const daysSinceWash = getDaysSinceWash(vehicle.last_washed);
    
    return (
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
        {/* Vehicle Image */}
        <div className="relative h-48 overflow-hidden">
          {vehicle.image_url ? (
            <>
              <img 
                src={vehicle.image_url} 
                alt={vehicle.name || `${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white z-10">
                  <p className="text-2xl font-bold">{vehicle.make || 'Luxury'}</p>
                  <p className="text-sm opacity-90">{vehicle.year || '2024'}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white z-10">
                <p className="text-2xl font-bold">{vehicle.make || 'Luxury'}</p>
                <p className="text-sm opacity-90">{vehicle.year || '2024'}</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 left-4 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(vehicle.status)}`}>
              {vehicle.status?.toUpperCase()}
            </span>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getConditionBadge(vehicle.condition || 'good')}`}>
              <Star className="inline h-3 w-3 mr-1" />
              {(vehicle.condition || 'GOOD').toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Vehicle Details */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {vehicle.name || `${vehicle.make} ${vehicle.model}`}
            </h3>
            <p className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {vehicle.location || 'Unknown Location'}
            </p>
          </div>
          
          {/* Wash Status */}
          <div className="mb-3">
            <div className="flex items-center text-sm">
              <Droplets className="h-4 w-4 mr-2 text-blue-500" />
              <span className={`font-medium ${getWashStatusColor(daysSinceWash)}`}>
                {daysSinceWash === null ? 'Never washed' : 
                 daysSinceWash === 0 ? 'Washed today' :
                 daysSinceWash === 1 ? 'Washed yesterday' :
                 `Washed ${daysSinceWash} days ago`}
              </span>
            </div>
          </div>
          
          {/* Fuel Level */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-sm text-gray-600">
                <Fuel className="h-4 w-4 mr-2" />
                Fuel Level
              </div>
              <span className="text-sm font-semibold">{vehicle.fuel_level || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  (vehicle.fuel_level || 0) > 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 
                  (vehicle.fuel_level || 0) > 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                  (vehicle.fuel_level || 0) > 25 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${vehicle.fuel_level || 0}%` }}
              ></div>
            </div>
          </div>
          
          {/* Mileage */}
          <div className="text-sm text-gray-600 mb-4">
            <span className="font-medium">Mileage:</span> {(vehicle.mileage || 0).toLocaleString()} miles
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button 
              onClick={() => setEditingVehicle(vehicle)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Manage
            </button>
            <button 
              onClick={() => updateVehicleMutation.mutate({ 
                id: vehicle.id, 
                status: vehicle.status === 'available' ? 'maintenance' : 'available' 
              })}
              className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Toggle Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TaskCard = ({ task }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-gray-300">
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-gray-900 leading-tight">{task.title}</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
          {task.priority?.toUpperCase()}
        </span>
      </div>
      
      <div className="space-y-3 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <Car className="h-4 w-4 mr-3 text-gray-400" />
          <span className="font-medium">Vehicle:</span>
          <span className="ml-1">{task.vehicle_id}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-3 text-gray-400" />
          <span className="font-medium">Due:</span>
          <span className="ml-1">{task.due_date}</span>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-3 text-gray-400" />
          <span className="font-medium">Assigned:</span>
          <span className="ml-1">{task.assigned_to || 'Unassigned'}</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={() => handleCompleteTask(task.id)}
          disabled={task.status === 'completed'}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {task.status === 'completed' ? 'Completed' : 'Complete'}
        </button>
        <button 
          onClick={() => setEditingTask(task)}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
        >
          Edit
        </button>
      </div>
    </div>
  );

  const VehicleModal = ({ vehicle, onClose }) => {
    const [formData, setFormData] = useState({
      name: vehicle?.name || '',
      make: vehicle?.make || '',
      model: vehicle?.model || '',
      year: vehicle?.year || new Date().getFullYear(),
      location: vehicle?.location || '',
      fuel_level: vehicle?.fuel_level || 100,
      mileage: vehicle?.mileage || 0,
      status: vehicle?.status || 'available',
      condition: vehicle?.condition || 'excellent',
      image_url: vehicle?.image_url || '',
      last_washed: vehicle?.last_washed || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (vehicle) {
        updateVehicleMutation.mutate({ id: vehicle.id, ...formData });
      } else {
        createVehicleMutation.mutate(formData);
      }
    };

    // Updated with actual RentXotic inventory images
    const rentXoticInventory = [
      { name: 'Ferrari 488 GTB', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC06599+2-49154e52-1920w.JPEG' },
      { name: 'Lamborghini Huracán', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC04749-0b2317a1-640w.JPG' },
      { name: 'McLaren 720S', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC04990-1000h.jpg' },
      { name: 'Rolls-Royce Ghost', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC07660-640w.JPEG' },
      { name: 'Bentley Continental GT', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC09064-Enhanced-NR-1000h.JPEG' },
      { name: 'Porsche 911 Turbo S', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC08327-1000h.JPEG' },
      { name: 'Mercedes G63 AMG', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC09282-1000h.JPEG' },
      { name: 'BMW M8', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/IMG_0596-1000h.JPG' },
      { name: 'Audi R8', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/IMG_7868-1000h.jpg' },
      { name: 'Lamborghini Urus', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/Urus-Front-1000h.PNG' },
      { name: 'Aston Martin DB11', url: 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/Aston8-5ae8bb34-1920w.jpg' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Ferrari 488 GTB"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Ferrari"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 488 GTB"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="2018"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., La Jolla Showroom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/car-image.jpg"
              />
              
              {/* RentXotic Inventory Quick Select */}
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">Quick select from RentXotic inventory:</p>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                  {rentXoticInventory.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: item.url })}
                      className="text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 truncate"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="Vehicle preview" 
                    className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Level (%)</label>
                <input
                  type="number"
                  value={formData.fuel_level}
                  onChange={(e) => setFormData({ ...formData, fuel_level: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Washed Date</label>
              <input
                type="date"
                value={formData.last_washed}
                onChange={(e) => setFormData({ ...formData, last_washed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {(createVehicleMutation.isPending || updateVehicleMutation.isPending) ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  vehicle ? 'Update Vehicle' : 'Add Vehicle'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TaskModal = ({ task, onClose }) => {
    const [formData, setFormData] = useState({
      title: task?.title || '',
      description: task?.description || '',
      vehicle_id: task?.vehicle_id || '',
      priority: task?.priority || 'normal',
      due_date: task?.due_date || new Date().toISOString().split('T')[0],
      assigned_to: task?.assigned_to || '',
      status: task?.status || 'pending'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (task) {
        updateTaskMutation.mutate({ id: task.id, ...formData });
      } else {
        createTaskMutation.mutate(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {task ? 'Edit Task' : 'Create Task'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name || `${vehicle.make} ${vehicle.model}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., John Smith"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {(createTaskMutation.isPending || updateTaskMutation.isPending) ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  task ? 'Update Task' : 'Create Task'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (vehiclesLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">Loading Fleet Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-xl mr-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  RentXotic Fleet
                </h1>
                <p className="text-sm text-gray-500">Luxury Fleet Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleExportReport}
                className="p-2 text-gray-500 hover:text-gray-700 group"
              >
                <Download className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 relative group">
                <Bell className="h-6 w-6" />
                {fleetStats.urgentTasks > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {fleetStats.urgentTasks} alerts
                </span>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="h-6 w-6" />
              </button>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">RX</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
              { id: 'fleet', name: 'Fleet Status', icon: Car },
              { id: 'tasks', name: 'Task Management', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center py-8">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">RentXotic</h2>
              <p className="text-lg text-gray-500 mt-2">San Diego's Premier Exotic Car Rental Service</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Car}
                title="Total Vehicles"
                value={fleetStats.totalVehicles}
                gradient="from-blue-600 to-blue-800"
              />
              <StatCard
                icon={CheckCircle}
                title="Available Now"
                value={fleetStats.available}
                subtitle={`${Math.round((fleetStats.available / Math.max(fleetStats.totalVehicles, 1)) * 100)}% ready to rent`}
                gradient="from-emerald-600 to-emerald-800"
              />
              <StatCard
                icon={TrendingUp}
                title="Fleet Utilization"
                value={`${fleetStats.utilization}%`}
                subtitle="Current efficiency"
                gradient="from-purple-600 to-purple-800"
              />
              <StatCard
                icon={AlertTriangle}
                title="Priority Tasks"
                value={fleetStats.urgentTasks}
                subtitle={`${fleetStats.activeTasks} total active`}
                gradient="from-amber-600 to-amber-800"
              />
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Vroom AI Assistant - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-3 rounded-xl mr-4 shadow-lg">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Vroom Assistant</h3>
                      <p className="text-gray-600">Natural language fleet management</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-500">Active</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="mb-6">
                  <div className="h-80 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-center mt-24">
                        <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Zap className="h-10 w-10 text-purple-700" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">Welcome to Vroom</p>
                        <p className="text-sm text-gray-600 mb-4">I can help you manage your fleet with simple commands</p>
                        <div className="bg-white rounded-lg p-4 text-left max-w-sm mx-auto">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Try these commands:</p>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p className="flex items-center"><span className="text-purple-600 mr-2">•</span> "Washed the Ferrari 488"</p>
                            <p className="flex items-center"><span className="text-purple-600 mr-2">•</span> "McLaren needs oil change"</p>
                            <p className="flex items-center"><span className="text-purple-600 mr-2">•</span> "Lamborghini fuel at 85%"</p>
                            <p className="flex items-center"><span className="text-purple-600 mr-2">•</span> "Bentley is now available"</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((message, index) => (
                        <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                              {message.time}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isProcessing && (
                      <div className="flex justify-start animate-fadeIn">
                        <div className="bg-white border border-gray-200 text-gray-900 max-w-xs px-4 py-3 rounded-2xl shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span className="text-sm text-gray-600">Vroom is processing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Input */}
                <form onSubmit={handleChatSubmit} className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Tell me what's happening with your fleet..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                      disabled={isProcessing}
                    />
                    <div className="absolute right-3 top-3.5">
                      <Car className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isProcessing}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span className="mr-2">Send</span>
                        <Zap className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Fleet Highlights - Single column */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Fleet Highlights</h3>
                  <button 
                    onClick={() => setShowVehicleModal(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Vehicle
                  </button>
                </div>
                <div className="space-y-4">
                  {vehicles.slice(0, 4).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-gray-800 to-black p-2.5 rounded-lg mr-3">
                          <Car className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {vehicle.name || `${vehicle.make} ${vehicle.model}`}
                          </p>
                          <p className="text-xs text-gray-600">{vehicle.location}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('fleet')}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium pt-2"
                  >
                    View All Vehicles →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Luxury Fleet Status</h2>
                <p className="text-gray-600 mt-1">Manage your exotic and luxury vehicle collection</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <button 
                  onClick={() => setShowVehicleModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Vehicle
                </button>
              </div>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Service & Task Management</h2>
                <p className="text-gray-600 mt-1">Maintain luxury standards across your fleet</p>
              </div>
              <button 
                onClick={() => setShowTaskModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Task
              </button>
            </div>

            {/* Task Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center mb-3">
                  <Clock className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-900">Pending Tasks</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Awaiting assignment</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center mb-3">
                  <Wrench className="h-6 w-6 text-orange-600 mr-3" />
                  <span className="font-semibold text-gray-900">In Progress</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'in-progress').length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Active work orders</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                  <span className="font-semibold text-gray-900">Completed</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Total finished</p>
              </div>
            </div>

            {/* Task List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showVehicleModal && (
        <VehicleModal onClose={() => setShowVehicleModal(false)} />
      )}
      
      {editingVehicle && (
        <VehicleModal 
          vehicle={editingVehicle} 
          onClose={() => setEditingVehicle(null)} 
        />
      )}

      {showTaskModal && (
        <TaskModal onClose={() => setShowTaskModal(false)} />
      )}
      
      {editingTask && (
        <TaskModal 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
        />
      )}
    </div>
  );
};

export default FleetDashboard;