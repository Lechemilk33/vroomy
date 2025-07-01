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
    // Initialize sample vehicles
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
        name: vehicleInfo.name,
        type: vehicleInfo.type,
        color: vehicleInfo.color,
        status: Math.random() > 0.7 ? 'rented' : Math.random() > 0.5 ? 'available' : 'maintenance',
        fuelLevel: Math.floor(Math.random() * 100),
        condition: Math.random() > 0.8 ? 'fair' : Math.random() > 0.3 ? 'good' : 'excellent',
        location: Math.random() > 0.6 ? 'La Jolla Office' : 'Customer Location',
        mileage: Math.floor(Math.random() * 50000) + 10000,
        lastService: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        issues: [],
        washed: Math.random() > 0.6,
        lastWash: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
      };

      // Add issues based on conditions
      if (vehicle.fuelLevel < 25) {
        vehicle.issues.push('Low Fuel');
      }
      if (Math.random() > 0.8) {
        vehicle.issues.push('Service Due');
      }
      if (Math.random() > 0.9) {
        vehicle.issues.push('Minor Cosmetic');
      }
      if (!vehicle.washed) {
        vehicle.issues.push('Needs Wash');
      }

      this.vehicles.set(vehicle.id, vehicle);
    });
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
    return Array.from(this.vehicles.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id,
      lastService: new Date()
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<InsertVehicle>): Promise<Vehicle> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
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
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error("Task not found");
    }
    const updatedTask = { ...task, ...updates };
    if (updates.completed && !task.completed) {
      updatedTask.completedAt = new Date();
    }
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
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
}

export const storage = new DatabaseStorage();