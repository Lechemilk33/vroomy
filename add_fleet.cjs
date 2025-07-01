const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_JzFL2rOc9VCk@ep-yellow-grass-a83om5vb-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
});

async function addFleet() {
  try {
    await pool.query("ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url TEXT");
    
    const vehicles = [
      ['Aston Martin Vantage (Blue)', 'Aston Martin', 'Vantage', 2020, 'available', 'La Jolla Showroom', 95, 8500, 'pristine', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/Aston8-5ae8bb34-1920w.jpg'],
      ['Ferrari 488 Spider', 'Ferrari', '488 Spider', 2022, 'rented', 'Customer Location', 65, 3400, 'pristine', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC04749-0b2317a1-640w.JPG'],
      ['Lamborghini Urus (Black)', 'Lamborghini', 'Urus', 2023, 'available', 'La Jolla Showroom', 90, 2100, 'pristine', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/Urus-Front-1000h.PNG']
    ];
    
    for (const vehicle of vehicles) {
      await pool.query(
        'INSERT INTO vehicles (name, make, model, year, status, location, fuel_level, mileage, condition, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        vehicle
      );
    }
    
    console.log('Fleet added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

addFleet();