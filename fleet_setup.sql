-- RentXotic Fleet Setup 
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url TEXT; 
 
INSERT INTO vehicles (name, make, model, year, status, location, fuel_level, mileage, condition, image_url) VALUES 
('Aston Martin Vantage (Blue)', 'Aston Martin', 'Vantage', 2020, 'available', 'La Jolla Showroom', 95, 8500, 'pristine', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/Aston8-5ae8bb34-1920w.jpg'), 
('Aston Martin Vantage (Silver)', 'Aston Martin', 'Vantage', 2021, 'available', 'La Jolla Showroom', 88, 6200, 'excellent', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC06599+2-49154e52-1920w.JPEG'), 
('Ferrari 488 Spider', 'Ferrari', '488 Spider', 2022, 'rented', 'Customer Location', 65, 3400, 'pristine', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC04749-0b2317a1-640w.JPG'), 
('Ferrari 488 Coupe', 'Ferrari', '488 Coupe', 2021, 'available', 'La Jolla Showroom', 92, 4100, 'excellent', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC04990-1000h.jpg'), 
('Ferrari California T', 'Ferrari', 'California T', 2020, 'maintenance', 'Service Center', 45, 12000, 'excellent', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC07660-640w.JPEG'), 
('Lamborghini Huracan Evo Spyder', 'Lamborghini', 'Huracan Evo', 2023, 'available', 'La Jolla Showroom', 100, 1200, 'pristine', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC09064-Enhanced-NR-1000h.JPEG'), 
('Lamborghini Huracan Evo Coupe', 'Lamborghini', 'Huracan Evo', 2022, 'rented', 'Customer Location', 78, 2800, 'pristine', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC08327-1000h.JPEG'), 
('Lamborghini Huracan Spyder', 'Lamborghini', 'Huracan', 2021, 'available', 'La Jolla Showroom', 85, 5600, 'excellent', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/DSC09282-1000h.JPEG'), 
('Lamborghini Urus (Black)', 'Lamborghini', 'Urus', 2023, 'available', 'La Jolla Showroom', 90, 2100, 'pristine', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/Urus-Front-1000h.PNG'), 
('Lamborghini Urus (Yellow)', 'Lamborghini', 'Urus', 2022, 'rented', 'Customer Location', 72, 4300, 'excellent', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/IMG_0596-1000h.JPG'), 
('McLaren 600LT Spider', 'McLaren', '600LT Spider', 2021, 'available', 'La Jolla Showroom', 88, 3900, 'excellent', 'https://lirp.cdn-website.com/e3d3f173/dms3rep/multi/opt/IMG_7868-1000h.jpg'), 
('McLaren 570s Spider', 'McLaren', '570s Spider', 2020, 'maintenance', 'Service Center', 55, 8700, 'good', NULL), 
('Mercedes AMG GT C Roadster', 'Mercedes-Benz', 'AMG GT C', 2022, 'available', 'La Jolla Showroom', 95, 2600, 'pristine', NULL), 
('Mercedes G550 (G-Wagon)', 'Mercedes-Benz', 'G550', 2023, 'rented', 'Customer Location', 82, 1800, 'pristine', NULL), 
('Mercedes GLB 250', 'Mercedes-Benz', 'GLB 250', 2023, 'available', 'La Jolla Showroom', 100, 500, 'pristine', NULL), 
('BMW M4 Competition', 'BMW', 'M4 Competition', 2024, 'available', 'La Jolla Showroom', 93, 1100, 'pristine', NULL), 
('Porsche 911 Carrera 4S', 'Porsche', '911 Carrera 4S', 2023, 'available', 'La Jolla Showroom', 87, 2200, 'excellent', NULL), 
('Porsche 911 Carrera S', 'Porsche', '911 Carrera S', 2022, 'rented', 'Customer Location', 76, 3500, 'excellent', NULL), 
('Corvette C8 (Orange)', 'Chevrolet', 'Corvette C8', 2023, 'available', 'La Jolla Showroom', 100, 800, 'pristine', NULL), 
('Corvette C8 (Red)', 'Chevrolet', 'Corvette C8', 2022, 'available', 'La Jolla Showroom', 91, 2400, 'excellent', NULL), 
('Audi R8 V10', 'Audi', 'R8 V10', 2021, 'maintenance', 'Service Center', 60, 6800, 'excellent', NULL), 
('Audi SQ8', 'Audi', 'SQ8', 2023, 'available', 'La Jolla Showroom', 89, 1500, 'pristine', NULL), 
('Maserati Ghibli', 'Maserati', 'Ghibli', 2022, 'available', 'La Jolla Showroom', 94, 3200, 'excellent', NULL); 
