import { db } from "./db";  
import { vehicles } from "@shared/schema";  
  
const seedVehicles = [  
  {  
    name: "Ferrari 488 GTB",  
    make: "Ferrari",  
    model: "488 GTB",  
    year: 2023,  
    status: "available",  
    location: "La Jolla Showroom",  
    fuel_level: 85,  
    fuel_type: "premium",  
    tank_capacity: 22.7,  
    mileage: 12500,  
    condition: "pristine",  
    image_url: "https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC06599+2-49154e52-1920w.JPEG"  
  },  
  {  
    name: "Lamborghini Urus",  
    make: "Lamborghini",  
    model: "Urus",  
    year: 2024,  
    status: "available",  
    location: "La Jolla Showroom",  
    fuel_level: 65,  
    fuel_type: "premium",  
    tank_capacity: 22.5,  
    mileage: 8200,  
    condition: "excellent",  
    image_url: "https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/Urus-Front-1000h.PNG"  
  },  
  {  
    name: "McLaren 720S",  
    make: "McLaren",  
