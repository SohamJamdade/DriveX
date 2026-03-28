/**
 * SEED DATA SCRIPT
 * Run: npm run seed
 * Populates the DB with demo vehicles, users, and bookings
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

// Import models
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

// ─── SEED USERS ───────────────────────────────
const users = [
  {
    name: "Admin User",
    email: "admin@drivex.com",
    password: "admin123",
    role: "admin",
    phone: "+91 98765 00001",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  },
  {
    name: "Rahul Sharma",
    email: "rahul@example.com",
    password: "password123",
    role: "user",
    phone: "+91 98765 43210",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
  },
  {
    name: "Priya Patel",
    email: "priya@example.com",
    password: "password123",
    role: "user",
    phone: "+91 91234 56789",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
  },
  {
    name: "Arjun Nair",
    email: "arjun@example.com",
    password: "password123",
    role: "user",
    phone: "+91 99887 76543",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
  },
];

// ─── SEED VEHICLES ────────────────────────────
const vehicles = [
  // CARS
  {
    name: "Swift Dezire",
    brand: "Maruti Suzuki",
    type: "car",
    fuelType: "petrol",
    transmission: "manual",
    pricePerDay: 1200,
    seats: 5,
    year: 2022,
    city: "Mumbai",
    description: "Compact and fuel-efficient sedan perfect for city commutes and weekend getaways. Smooth drive with great AC and music system.",
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    ],
    features: ["AC", "Bluetooth", "Power Windows", "Central Locking", "Airbags"],
    mileage: "22 km/l",
    rating: 4.3,
    reviewCount: 12,
    bookingCount: 28,
  },
  {
    name: "Creta SUV",
    brand: "Hyundai",
    type: "suv",
    fuelType: "diesel",
    transmission: "automatic",
    pricePerDay: 2500,
    seats: 5,
    year: 2023,
    city: "Delhi",
    description: "Premium SUV with commanding road presence. Perfect for highway trips and family outings. Features sunroof and advanced safety.",
    images: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    ],
    features: ["Sunroof", "360 Camera", "Ventilated Seats", "Wireless Charging", "Lane Assist"],
    mileage: "18 km/l",
    rating: 4.7,
    reviewCount: 23,
    bookingCount: 45,
  },
  {
    name: "Thar 4x4",
    brand: "Mahindra",
    type: "suv",
    fuelType: "diesel",
    transmission: "manual",
    pricePerDay: 3200,
    seats: 4,
    year: 2023,
    city: "Pune",
    description: "The iconic off-roader for adventure seekers. Tackle any terrain with confidence — from Sahyadri mountains to coastal roads.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    ],
    features: ["4WD", "Convertible Top", "Rock Crawl Mode", "Differential Lock", "Roll Cage"],
    mileage: "14 km/l",
    rating: 4.9,
    reviewCount: 31,
    bookingCount: 67,
  },
  {
    name: "Nexon EV",
    brand: "Tata",
    type: "car",
    fuelType: "electric",
    transmission: "automatic",
    pricePerDay: 2000,
    seats: 5,
    year: 2023,
    city: "Bangalore",
    description: "India's #1 electric SUV with 312km range. Smooth, silent, and sustainable. Perfect for eco-conscious travelers exploring the city.",
    images: [
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
      "https://images.unsplash.com/photo-1608461571579-c8b71ae87d79?w=800&q=80",
    ],
    features: ["312km Range", "Fast Charging", "Auto AC", "Regen Braking", "Connected Tech"],
    mileage: "312 km/charge",
    rating: 4.6,
    reviewCount: 18,
    bookingCount: 38,
  },
  {
    name: "City Sedan",
    brand: "Honda",
    type: "car",
    fuelType: "petrol",
    transmission: "automatic",
    pricePerDay: 1800,
    seats: 5,
    year: 2022,
    city: "Chennai",
    description: "Elegant and refined, the Honda City is perfect for business travel and airport transfers. Comfortable, spacious and fuel-efficient.",
    images: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    ],
    features: ["Lane Watch", "Honda Sensing", "LaneKeep Assist", "Adaptive Cruise", "Heated Seats"],
    mileage: "17 km/l",
    rating: 4.4,
    reviewCount: 15,
    bookingCount: 29,
  },
  {
    name: "Fortuner",
    brand: "Toyota",
    type: "suv",
    fuelType: "diesel",
    transmission: "automatic",
    pricePerDay: 4500,
    seats: 7,
    year: 2023,
    city: "Hyderabad",
    description: "The premium 7-seater SUV that commands respect on any road. Ideal for large family trips or corporate outings.",
    images: [
      "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=800&q=80",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
    ],
    features: ["7 Seats", "4WD", "Premium Audio", "Powered Tailgate", "Multi-terrain Select"],
    mileage: "13 km/l",
    rating: 4.8,
    reviewCount: 27,
    bookingCount: 52,
  },
  // BIKES
  {
    name: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    type: "bike",
    fuelType: "petrol",
    transmission: "manual",
    pricePerDay: 800,
    seats: 2,
    year: 2022,
    city: "Goa",
    description: "The iconic thumper for unforgettable coastal rides. Feel the wind and explore Goa's hidden beaches on this classic machine.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80",
    ],
    features: ["ABS", "Tripper Navigation", "LED Lights", "USB Charging"],
    mileage: "37 km/l",
    rating: 4.5,
    reviewCount: 20,
    bookingCount: 41,
  },
  {
    name: "Dominar 400",
    brand: "Bajaj",
    type: "bike",
    fuelType: "petrol",
    transmission: "manual",
    pricePerDay: 700,
    seats: 2,
    year: 2022,
    city: "Manali",
    description: "Purpose-built adventure tourer with 40HP. Conquer Himachal mountain passes in style. Preferred by serious riders.",
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80",
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80",
    ],
    features: ["Dual Channel ABS", "Slipper Clutch", "Full-LED", "45L Tank"],
    mileage: "27 km/l",
    rating: 4.4,
    reviewCount: 14,
    bookingCount: 32,
  },
  {
    name: "Activa 6G",
    brand: "Honda",
    type: "scooter",
    fuelType: "petrol",
    transmission: "automatic",
    pricePerDay: 400,
    seats: 2,
    year: 2023,
    city: "Mumbai",
    description: "India's most trusted scooter for daily city rides. Easy to ride, excellent mileage, and great for navigating traffic.",
    images: [
      "https://images.unsplash.com/photo-1539805303808-8e26e55d5a4e?w=800&q=80",
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80",
    ],
    features: ["Silent Start", "LED DRL", "External Fuel Fill", "Mobile Charger"],
    mileage: "60 km/l",
    rating: 4.2,
    reviewCount: 35,
    bookingCount: 78,
  },
  {
    name: "KTM Duke 390",
    brand: "KTM",
    type: "bike",
    fuelType: "petrol",
    transmission: "manual",
    pricePerDay: 1100,
    seats: 2,
    year: 2023,
    city: "Bangalore",
    description: "The ultimate naked sportbike for adrenaline junkies. Sharp handling, aggressive power delivery — not for the faint-hearted.",
    images: [
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
      "https://images.unsplash.com/photo-1558981285-6f0c68d55a6f?w=800&q=80",
    ],
    features: ["Supermoto ABS", "Quickshifter+", "TFT Display", "Cornering ABS", "Lean-angle sensing"],
    mileage: "22 km/l",
    rating: 4.8,
    reviewCount: 19,
    bookingCount: 36,
  },
  {
    name: "Innova Crysta",
    brand: "Toyota",
    type: "van",
    fuelType: "diesel",
    transmission: "manual",
    pricePerDay: 3000,
    seats: 7,
    year: 2022,
    city: "Delhi",
    description: "India's most trusted MPV for family and group travel. Spacious, reliable, and comfortable for long road trips.",
    images: [
      "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80",
      "https://images.unsplash.com/photo-1516199423456-1f1e91b06f25?w=800&q=80",
    ],
    features: ["Captain Seats", "Auto Climate", "7 Airbags", "Rear AC Vents", "Push Start"],
    mileage: "16 km/l",
    rating: 4.6,
    reviewCount: 22,
    bookingCount: 48,
  },
  {
    name: "Ola S1 Pro",
    brand: "Ola Electric",
    type: "scooter",
    fuelType: "electric",
    transmission: "automatic",
    pricePerDay: 550,
    seats: 2,
    year: 2023,
    city: "Bangalore",
    description: "The future of urban commuting. Blazing fast acceleration, 181km range, and a massive 36L boot space. Smart, connected and green.",
    images: [
      "https://images.unsplash.com/photo-1626178793926-22b28830aa30?w=800&q=80",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
    ],
    features: ["181km Range", "Touch Dashboard", "Geo-fencing", "Navigation", "Remote Diagnostics"],
    mileage: "181 km/charge",
    rating: 4.1,
    reviewCount: 28,
    bookingCount: 55,
  },
];

// ─── SEED REVIEWS ─────────────────────────────
const reviewTemplates = [
  { rating: 5, comment: "Absolutely loved the ride! The vehicle was clean and in perfect condition. Pickup was smooth and hassle-free." },
  { rating: 4, comment: "Great experience overall. The car was comfortable and fuel-efficient. Will definitely book again." },
  { rating: 5, comment: "Exceeded my expectations! The vehicle was spotless and the booking process was super easy." },
  { rating: 4, comment: "Solid rental experience. Good value for money. Minor scratch on bumper but staff noted it beforehand." },
  { rating: 3, comment: "Decent experience. Vehicle was clean but a bit older than expected. AC worked fine though." },
  { rating: 5, comment: "Spectacular! This is exactly what a car rental should feel like. Premium experience at affordable prices." },
];

// ─── MAIN SEED FUNCTION ───────────────────────
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/vehicle_renting");
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create users (passwords auto-hashed by model hook)
    const createdUsers = await User.create(users);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create vehicles
    const createdVehicles = await Vehicle.create(vehicles);
    console.log(`🚗 Created ${createdVehicles.length} vehicles`);

    // Create bookings (past completed + upcoming confirmed)
    const regularUsers = createdUsers.filter(u => u.role === "user");
    const bookingData = [];

    for (let i = 0; i < 8; i++) {
      const user = regularUsers[i % regularUsers.length];
      const vehicle = createdVehicles[i % createdVehicles.length];
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - (20 - i * 2));
      const pastEnd = new Date(pastStart);
      pastEnd.setDate(pastEnd.getDate() + 3);
      const totalDays = 3;
      const totalAmount = totalDays * vehicle.pricePerDay;

      bookingData.push({
        user: user._id,
        vehicle: vehicle._id,
        startDate: pastStart,
        endDate: pastEnd,
        totalDays,
        pricePerDay: vehicle.pricePerDay,
        totalAmount,
        pickupCity: vehicle.city,
        status: "completed",
      });
    }

    // Add a couple of upcoming bookings
    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 5);
    const futureEnd = new Date(futureStart);
    futureEnd.setDate(futureEnd.getDate() + 2);

    bookingData.push({
      user: regularUsers[0]._id,
      vehicle: createdVehicles[1]._id,
      startDate: futureStart,
      endDate: futureEnd,
      totalDays: 2,
      pricePerDay: createdVehicles[1].pricePerDay,
      totalAmount: 2 * createdVehicles[1].pricePerDay,
      pickupCity: createdVehicles[1].city,
      status: "confirmed",
    });

    const createdBookings = await Booking.create(bookingData);
    console.log(`📅 Created ${createdBookings.length} bookings`);

    // Create reviews for completed bookings
    const reviewData = createdBookings
      .filter(b => b.status === "completed")
      .slice(0, 6)
      .map((booking, i) => ({
        user: booking.user,
        vehicle: booking.vehicle,
        booking: booking._id,
        ...reviewTemplates[i % reviewTemplates.length],
      }));

    await Review.create(reviewData);
    console.log(`⭐ Created ${reviewData.length} reviews`);

    console.log("\n✅ Database seeded successfully!");
    console.log("─".repeat(40));
    console.log("🔑 Login credentials:");
    console.log("   Admin: admin@drivex.com / admin123");
    console.log("   User:  rahul@example.com / password123");
    console.log("─".repeat(40));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
