import { pgTable, text, serial, integer, boolean, real, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name"),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  status: text("status").notNull().default("available"), // available, rented, maintenance
  location: text("location").default("Main Office"),
  fuel_level: integer("fuel_level").default(100),
  fuel_type: text("fuel_type").default("premium"), // regular, premium, diesel
  tank_capacity: real("tank_capacity").default(20), // gallons
  mileage: integer("mileage").default(0),
  condition: text("condition").default("excellent"), // pristine, excellent, good
  image_url: text("image_url"),
  last_washed: date("last_washed"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  vehicle_id: integer("vehicle_id").references(() => vehicles.id),
  priority: text("priority").default("normal"), // normal, high, urgent
  status: text("status").default("pending"), // pending, in-progress, completed
  due_date: date("due_date"),
  assigned_to: text("assigned_to"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

export const fuel_reimbursements = pgTable("fuel_reimbursements", {
  id: serial("id").primaryKey(),
  receipt_image_url: text("receipt_image_url").notNull(),
  vehicle_id: integer("vehicle_id").references(() => vehicles.id).notNull(),
  staff_member: text("staff_member").notNull(),
  gallons: real("gallons").notNull(),
  price_per_gallon: real("price_per_gallon").notNull(),
  total_amount: real("total_amount").notNull(),
  ca_average_price: real("ca_average_price"),
  receipt_date: date("receipt_date").notNull(),
  approved: boolean("approved").default(false),
  approved_by: text("approved_by"),
  approved_at: timestamp("approved_at"),
  created_at: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertFuelReimbursementSchema = createInsertSchema(fuel_reimbursements).omit({
  id: true,
  created_at: true,
  approved_at: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertFuelReimbursement = z.infer<typeof insertFuelReimbursementSchema>;
export type FuelReimbursement = typeof fuel_reimbursements.$inferSelect;