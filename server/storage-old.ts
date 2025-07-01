import { 
  users, vehicles, tasks,
  type User, type InsertUser,
  type Vehicle, type InsertVehicle,
  type Task, type InsertTask
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;


}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private tasks: Map<number, Task>;

  private currentUserId: number;
  private currentVehicleId: number;
  private currentTaskId: number;


  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.tasks = new Map();

    this.currentUserId = 1;
    this.currentVehicleId = 1;
    this.currentTaskId = 1;


    this.initializeData();
  }

  private initializeData() {
    // Initialize vehicles
    const vehicleData = [
      { name: "Ferrari 488 Spider", type: "Convertible", color: "Red" },
      { name: "Lamborghini Huracan Evo Spyder", type: "Convertible", color: "Orange" },
      { name: "McLaren 720S Spider", type: "Convertible", color: "Blue" },
      { name: "Porsche 911 Turbo S Cabrio", type: "Convertible", color: "White" },
      { name: "Audi R8 Spyder", type: "Convertible", color: "Black" },
      { name: "BMW i8 Roadster", type: "Hybrid Convertible", color: "Blue" },
      { name: "Ferrari F8 Tributo", type: "Coupe", color: "Yellow" },
      { name: "Lamborghini Aventador SVJ", type: "Coupe", color: "Green" },
      { name: "McLaren 570S", type: "Coupe", color: "Orange" },
      { name: "Porsche 911 GT3", type: "Coupe", color: "White" },
      { name: "Aston Martin Vantage", type: "Coupe", color: "Silver" },
      { name: "Mercedes-AMG GT", type: "Coupe", color: "Red" },
      { name: "Bentley Continental GT", type: "Luxury Coupe", color: "Black" },
      { name: "Rolls-Royce Wraith", type: "Luxury Coupe", color: "White" },
      { name: "Maserati GranTurismo", type: "Luxury Coupe", color: "Blue" },
      { name: "Jaguar F-Type R", type: "Coupe", color: "Red" },
      { name: "Nissan GT-R", type: "Coupe", color: "Silver" },
      { name: "Chevrolet Corvette Z06", type: "Coupe", color: "Yellow" },
      { name: "Dodge Challenger SRT Hellcat", type: "Muscle Car", color: "Black" },
      { name: "Ford Mustang Shelby GT500", type: "Muscle Car", color: "Blue" },
      { name: "Tesla Model S Plaid", type: "Electric Sedan", color: "White" },
      { name: "Lamborghini Urus", type: "Luxury SUV", color: "Gray" },
      { name: "Bentley Bentayga", type: "Luxury SUV", color: "Black" }
    ];

    vehicleData.forEach(vehicleInfo => {
      const vehicle: Vehicle = {
        id: this.currentVehicleId++,
        ...vehicleInfo,
        status: Math.random() > 0.7 ? 'rented' : Math.random() > 0.5 ? 'available' : 'maintenance',
        fuelLevel: Math.floor(Math.random() * 100),
        condition: Math.random() > 0.8 ? 'fair' : Math.random() > 0.3 ? 'good' : 'excellent',
        location: Math.random() > 0.6 ? 'La Jolla Office' : 'Customer Location',
        mileage: Math.floor(Math.random() * 50000) + 10000,
        lastService: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        issues: [],
        washed: Math.random() > 0.6,
        lastWash: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
      };

      if (vehicle.fuelLevel < 25) {
        vehicle.issues?.push('Low Fuel');
      }
      if (Math.random() > 0.8) {
        vehicle.issues?.push('Service Due');
      }
      if (Math.random() > 0.9) {
        vehicle.issues?.push('Minor Cosmetic');
      }
      if (!vehicle.washed) {
        vehicle.issues?.push('Needs Wash');
      }

      this.vehicles.set(vehicle.id, vehicle);
    });

    // Initialize fuel stations
    const stationData = [
      {
        name: "Shell La Jolla",
        address: "7535 Girard Ave, La Jolla, CA 92037",
        currentPrice: 4.25,
        rating: 4,
        notes: "Premium location, clean facilities"
      },
      {
        name: "Chevron UTC",
        address: "4445 Eastgate Mall, San Diego, CA 92121",
        currentPrice: 4.15,
        rating: 5,
        notes: "Best prices, quick service"
      },
      {
        name: "76 Station Torrey Pines",
        address: "10456 N Torrey Pines Rd, La Jolla, CA 92037",
        currentPrice: 4.35,
        rating: 3,
        notes: "Convenient location"
      }
    ];

    stationData.forEach(stationInfo => {
      const station: FuelStation = {
        id: this.currentFuelStationId++,
        name: stationInfo.name,
        address: stationInfo.address,
        currentPrice: stationInfo.currentPrice,
        rating: stationInfo.rating,
        notes: stationInfo.notes,
        createdAt: new Date()
      };
      this.fuelStations.set(station.id, station);
    });

    // Initialize sample fuel records
    const vehicleArray = Array.from(this.vehicles.values());
    const stationArray = Array.from(this.fuelStations.values());
    
    for (let i = 0; i < 15; i++) {
      const vehicle = vehicleArray[Math.floor(Math.random() * vehicleArray.length)];
      const station = stationArray[Math.floor(Math.random() * stationArray.length)];
      const amount = parseFloat((Math.random() * 15 + 5).toFixed(1));
      const price = station.currentPrice + (Math.random() * 0.2 - 0.1);
      
      const record: FuelRecord = {
        id: this.currentFuelRecordId++,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        stationId: station.id,
        stationName: station.name,
        amount,
        pricePerGallon: parseFloat(price.toFixed(2)),
        totalCost: parseFloat((amount * price).toFixed(2)),
        mileage: vehicle.mileage - Math.floor(Math.random() * 500),
        notes: "",
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };
      
      this.fuelRecords.set(record.id, record);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id,
      lastService: new Date(),
      issues: insertVehicle.issues || [],
      washed: insertVehicle.washed || false,
      lastWash: insertVehicle.lastWash || null
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<InsertVehicle>): Promise<Vehicle> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }
    const updatedVehicle = { ...vehicle, ...updates };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    this.vehicles.delete(id);
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id,
      priority: insertTask.priority || 'normal',
      assigned: insertTask.assigned || 'Unassigned',
      completed: insertTask.completed || false,
      createdAt: new Date(),
      completedAt: null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    const updatedTask = { ...task, ...updates };
    if (updates.completed === true && !task.completed) {
      updatedTask.completedAt = new Date();
    }
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }

  // Fuel Station methods
  async getFuelStations(): Promise<FuelStation[]> {
    return Array.from(this.fuelStations.values());
  }

  async getFuelStation(id: number): Promise<FuelStation | undefined> {
    return this.fuelStations.get(id);
  }

  async createFuelStation(insertStation: InsertFuelStation): Promise<FuelStation> {
    const id = this.currentFuelStationId++;
    const station: FuelStation = { 
      ...insertStation, 
      id,
      createdAt: new Date()
    };
    this.fuelStations.set(id, station);
    return station;
  }

  async updateFuelStation(id: number, updates: Partial<InsertFuelStation>): Promise<FuelStation> {
    const station = this.fuelStations.get(id);
    if (!station) {
      throw new Error(`Fuel station with id ${id} not found`);
    }
    const updatedStation = { ...station, ...updates };
    this.fuelStations.set(id, updatedStation);
    return updatedStation;
  }

  async deleteFuelStation(id: number): Promise<void> {
    this.fuelStations.delete(id);
  }

  // Fuel Record methods
  async getFuelRecords(): Promise<FuelRecord[]> {
    return Array.from(this.fuelRecords.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFuelRecord(id: number): Promise<FuelRecord | undefined> {
    return this.fuelRecords.get(id);
  }

  async createFuelRecord(insertRecord: InsertFuelRecord): Promise<FuelRecord> {
    const id = this.currentFuelRecordId++;
    const record: FuelRecord = { 
      ...insertRecord, 
      id,
      mileage: insertRecord.mileage || null,
      notes: insertRecord.notes || null,
      createdAt: new Date()
    };
    this.fuelRecords.set(id, record);
    
    // Update vehicle fuel level
    const vehicle = this.vehicles.get(insertRecord.vehicleId);
    if (vehicle) {
      const updatedFuelLevel = Math.min(100, vehicle.fuelLevel + (insertRecord.amount * 2));
      const updatedIssues = (vehicle.issues || []).filter(issue => issue !== 'Low Fuel');
      
      this.vehicles.set(vehicle.id, {
        ...vehicle,
        fuelLevel: updatedFuelLevel,
        mileage: insertRecord.mileage || vehicle.mileage,
        issues: updatedIssues
      });
    }
    
    return record;
  }

  async deleteFuelRecord(id: number): Promise<void> {
    this.fuelRecords.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<InsertVehicle>): Promise<Vehicle> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(tasks.createdAt);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Fuel Station methods
  async getFuelStations(): Promise<FuelStation[]> {
    return await db.select().from(fuelStations);
  }

  async getFuelStation(id: number): Promise<FuelStation | undefined> {
    const [station] = await db.select().from(fuelStations).where(eq(fuelStations.id, id));
    return station || undefined;
  }

  async createFuelStation(insertStation: InsertFuelStation): Promise<FuelStation> {
    const [station] = await db
      .insert(fuelStations)
      .values(insertStation)
      .returning();
    return station;
  }

  async updateFuelStation(id: number, updates: Partial<InsertFuelStation>): Promise<FuelStation> {
    const [station] = await db
      .update(fuelStations)
      .set(updates)
      .where(eq(fuelStations.id, id))
      .returning();
    return station;
  }

  async deleteFuelStation(id: number): Promise<void> {
    await db.delete(fuelStations).where(eq(fuelStations.id, id));
  }

  // Fuel Record methods
  async getFuelRecords(): Promise<FuelRecord[]> {
    return await db.select().from(fuelRecords).orderBy(fuelRecords.createdAt);
  }

  async getFuelRecord(id: number): Promise<FuelRecord | undefined> {
    const [record] = await db.select().from(fuelRecords).where(eq(fuelRecords.id, id));
    return record || undefined;
  }

  async createFuelRecord(insertRecord: InsertFuelRecord): Promise<FuelRecord> {
    const [record] = await db
      .insert(fuelRecords)
      .values(insertRecord)
      .returning();
    
    // Update vehicle fuel level
    const vehicle = await this.getVehicle(insertRecord.vehicleId);
    if (vehicle) {
      const updatedFuelLevel = Math.min(100, vehicle.fuelLevel + (insertRecord.amount * 2));
      const updatedIssues = (vehicle.issues || []).filter(issue => issue !== 'Low Fuel');
      
      await this.updateVehicle(vehicle.id, {
        fuelLevel: updatedFuelLevel,
        mileage: insertRecord.mileage || vehicle.mileage,
        issues: updatedIssues
      });
    }
    
    return record;
  }

  async deleteFuelRecord(id: number): Promise<void> {
    await db.delete(fuelRecords).where(eq(fuelRecords.id, id));
  }
}

export const storage = new MemStorage();
