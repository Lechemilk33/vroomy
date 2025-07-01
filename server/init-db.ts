import { db } from './db';
import { vehicles, fuelStations, fuelRecords } from '@shared/schema';

async function initializeDatabase() {
  console.log('Initializing database with sample data...');

  // Check if vehicles already exist
  const existingVehicles = await db.select().from(vehicles).limit(1);
  if (existingVehicles.length > 0) {
    console.log('Database already initialized');
    return;
  }

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

  const vehiclesWithData = vehicleData.map(vehicleInfo => ({
    ...vehicleInfo,
    status: Math.random() > 0.7 ? 'rented' as const : Math.random() > 0.5 ? 'available' as const : 'maintenance' as const,
    fuelLevel: Math.floor(Math.random() * 100),
    condition: Math.random() > 0.8 ? 'fair' as const : Math.random() > 0.3 ? 'good' as const : 'excellent' as const,
    location: Math.random() > 0.6 ? 'La Jolla Office' : 'Customer Location',
    mileage: Math.floor(Math.random() * 50000) + 10000,
    washed: Math.random() > 0.6,
    lastWash: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
    issues: [] as string[]
  }));

  // Add issues based on conditions
  vehiclesWithData.forEach(vehicle => {
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
  });

  await db.insert(vehicles).values(vehiclesWithData);
  console.log(`Inserted ${vehiclesWithData.length} vehicles`);

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

  await db.insert(fuelStations).values(stationData);
  console.log(`Inserted ${stationData.length} fuel stations`);

  // Initialize some sample fuel records
  const insertedVehicles = await db.select().from(vehicles);
  const insertedStations = await db.select().from(fuelStations);
  
  const sampleRecords = [];
  for (let i = 0; i < 15; i++) {
    const vehicle = insertedVehicles[Math.floor(Math.random() * insertedVehicles.length)];
    const station = insertedStations[Math.floor(Math.random() * insertedStations.length)];
    const amount = parseFloat((Math.random() * 15 + 5).toFixed(1));
    const price = station.currentPrice + (Math.random() * 0.2 - 0.1);
    
    sampleRecords.push({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      stationId: station.id,
      stationName: station.name,
      amount,
      pricePerGallon: parseFloat(price.toFixed(2)),
      totalCost: parseFloat((amount * price).toFixed(2)),
      mileage: vehicle.mileage - Math.floor(Math.random() * 500),
      notes: null
    });
  }

  await db.insert(fuelRecords).values(sampleRecords);
  console.log(`Inserted ${sampleRecords.length} fuel records`);

  console.log('Database initialization complete!');
}

// Run initialization if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().catch(console.error);
}

export { initializeDatabase };