import {
  BookingRequest, UserProfile, VillaListing, CarListing, YachtListing,
  type AdminUser,
} from "./types";
import type { CatalogVilla } from "@/components/inventory/ImportCatalogSheet";

export const mockCatalogVillas: CatalogVilla[] = [
  { id: "cat-v1", name: "Villa Serena", provider: "Guesty", location: "Tulum, Mexico", pricePerNight: 650, bedrooms: 3, bathrooms: 2, maxGuests: 6, photo: "" },
  { id: "cat-v2", name: "Casa del Mare", provider: "Hostaway", location: "Amalfi Coast, Italy", pricePerNight: 1800, bedrooms: 5, bathrooms: 4, maxGuests: 12, photo: "" },
  { id: "cat-v3", name: "The Lake House", provider: "Guesty", location: "Lake Como, Italy", pricePerNight: 2200, bedrooms: 4, bathrooms: 3, maxGuests: 8, photo: "" },
  { id: "cat-v4", name: "Palm Grove Estate", provider: "Hostaway", location: "Bali, Indonesia", pricePerNight: 450, bedrooms: 4, bathrooms: 4, maxGuests: 10, photo: "" },
  { id: "cat-v5", name: "Sunset Penthouse", provider: "Guesty", location: "Dubai, UAE", pricePerNight: 1500, bedrooms: 3, bathrooms: 3, maxGuests: 8, photo: "" },
  { id: "cat-v6", name: "Chalet Blanc", provider: "Hostaway", location: "Aspen, Colorado", pricePerNight: 3200, bedrooms: 6, bathrooms: 5, maxGuests: 14, photo: "" },
];

export const mockAdminUsers: AdminUser[] = [
  { uid: "a1", email: "owner@shiftrentals.com", role: "owner", name: "Marcus Cole" },
  { uid: "a2", email: "admin@shiftrentals.com", role: "admin", name: "Sofia Reyes" },
  { uid: "a3", email: "viewer@shiftrentals.com", role: "viewer", name: "Alex Kim" },
];

export const mockBookings: BookingRequest[] = [
  {
    id: "BR-1001",
    createdAt: new Date("2026-01-28T14:30:00"),
    updatedAt: new Date("2026-01-28T14:30:00"),
    customer: { uid: "u1", name: "James Whitfield", email: "james@whitfield.com", phone: "+1 (305) 555-0142" },
    villa: { id: "v1", name: "Villa Azure", location: "Mykonos, Greece", checkIn: new Date("2026-02-15"), checkOut: new Date("2026-02-20"), nights: 5, pricePerNight: 2400, price: 12000, status: "Pending" },
    car: { id: "c1", name: "Lamborghini Huracán EVO", pickupDate: new Date("2026-02-15"), dropoffDate: new Date("2026-02-18"), days: 3, pricePerDay: 800, price: 2400, status: "Pending" },
    yacht: null,
    grandTotal: 14400,
    notes: [],
    activityLog: [{ action: "Booking submitted", actor: "system", timestamp: new Date("2026-01-28T14:30:00") }],
  },
  {
    id: "BR-1002",
    createdAt: new Date("2026-01-26T09:15:00"),
    updatedAt: new Date("2026-01-27T11:00:00"),
    customer: { uid: "u2", name: "Sophia Laurent", email: "sophia@laurent.co", phone: "+33 6 12 34 56 78" },
    villa: { id: "v2", name: "Casa Bianca", location: "Amalfi Coast, Italy", checkIn: new Date("2026-03-01"), checkOut: new Date("2026-03-08"), nights: 7, pricePerNight: 3200, price: 22400, status: "Approved" },
    car: { id: "c2", name: "Porsche 911 Turbo S", pickupDate: new Date("2026-03-01"), dropoffDate: new Date("2026-03-04"), days: 3, pricePerDay: 650, price: 1950, status: "Declined" },
    yacht: { id: "y1", name: "Azimut Grande", date: new Date("2026-03-05"), startTime: "10:00 AM", endTime: "6:00 PM", hours: 8, pricePerHour: 1200, price: 9600, status: "Approved" },
    grandTotal: 33950,
    notes: [
      { text: "VIP client — returning customer. Prefers dock-side pickup.", author: "owner@shiftrentals.com", timestamp: new Date("2026-01-27T10:00:00") },
    ],
    activityLog: [
      { action: "Booking submitted", actor: "system", timestamp: new Date("2026-01-26T09:15:00") },
      { action: "Approved villa", actor: "owner@shiftrentals.com", timestamp: new Date("2026-01-27T10:30:00") },
      { action: "Declined car", actor: "owner@shiftrentals.com", timestamp: new Date("2026-01-27T10:31:00") },
      { action: "Approved yacht", actor: "owner@shiftrentals.com", timestamp: new Date("2026-01-27T10:32:00") },
      { action: "Added note", actor: "owner@shiftrentals.com", timestamp: new Date("2026-01-27T10:33:00") },
    ],
  },
  {
    id: "BR-1003",
    createdAt: new Date("2026-01-30T18:45:00"),
    updatedAt: new Date("2026-01-30T18:45:00"),
    customer: { uid: "u3", name: "Ahmed Al-Rashidi", email: "ahmed@alrashidi.ae", phone: "+971 50 123 4567" },
    villa: null,
    car: { id: "c3", name: "Rolls-Royce Cullinan", pickupDate: new Date("2026-02-10"), dropoffDate: new Date("2026-02-14"), days: 4, pricePerDay: 1100, price: 4400, status: "Pending" },
    yacht: { id: "y2", name: "Sunseeker Predator", date: new Date("2026-02-12"), startTime: "2:00 PM", endTime: "8:00 PM", hours: 6, pricePerHour: 900, price: 5400, status: "Pending" },
    grandTotal: 9800,
    notes: [],
    activityLog: [{ action: "Booking submitted", actor: "system", timestamp: new Date("2026-01-30T18:45:00") }],
  },
  {
    id: "BR-1004",
    createdAt: new Date("2026-01-25T12:00:00"),
    updatedAt: new Date("2026-01-26T15:00:00"),
    customer: { uid: "u4", name: "Elena Vasquez", email: "elena@vasquez.mx", phone: "+52 55 1234 5678" },
    villa: { id: "v3", name: "Penthouse Royal", location: "Dubai Marina, UAE", checkIn: new Date("2026-02-01"), checkOut: new Date("2026-02-05"), nights: 4, pricePerNight: 4500, price: 18000, status: "Approved" },
    car: null,
    yacht: null,
    grandTotal: 18000,
    notes: [
      { text: "Requested early check-in at 10 AM. Confirmed with property.", author: "admin@shiftrentals.com", timestamp: new Date("2026-01-26T14:00:00") },
    ],
    activityLog: [
      { action: "Booking submitted", actor: "system", timestamp: new Date("2026-01-25T12:00:00") },
      { action: "Approved villa", actor: "admin@shiftrentals.com", timestamp: new Date("2026-01-26T15:00:00") },
      { action: "Added note", actor: "admin@shiftrentals.com", timestamp: new Date("2026-01-26T14:00:00") },
    ],
  },
  {
    id: "BR-1005",
    createdAt: new Date("2026-02-01T08:00:00"),
    updatedAt: new Date("2026-02-02T10:00:00"),
    customer: { uid: "u5", name: "Oliver Chen", email: "oliver@chen.hk", phone: "+852 9876 5432" },
    villa: { id: "v4", name: "Villa Serenity", location: "Bali, Indonesia", checkIn: new Date("2026-03-10"), checkOut: new Date("2026-03-17"), nights: 7, pricePerNight: 1800, price: 12600, status: "Declined" },
    car: { id: "c4", name: "Mercedes-AMG GT", pickupDate: new Date("2026-03-10"), dropoffDate: new Date("2026-03-13"), days: 3, pricePerDay: 500, price: 1500, status: "Declined" },
    yacht: null,
    grandTotal: 14100,
    notes: [{ text: "Client cancelled — rescheduling for April.", author: "admin@shiftrentals.com", timestamp: new Date("2026-02-02T10:00:00") }],
    activityLog: [
      { action: "Booking submitted", actor: "system", timestamp: new Date("2026-02-01T08:00:00") },
      { action: "Declined villa", actor: "admin@shiftrentals.com", timestamp: new Date("2026-02-02T10:00:00") },
      { action: "Declined car", actor: "admin@shiftrentals.com", timestamp: new Date("2026-02-02T10:01:00") },
    ],
  },
];

export const mockUsers: UserProfile[] = [
  {
    uid: "u1", name: "James Whitfield", email: "james@whitfield.com", phone: "+1 (305) 555-0142",
    totalTrips: 3, lastTripDate: new Date("2025-12-20"), lifetimeValue: 42500, createdAt: new Date("2024-06-15"),
    notes: [{ text: "Prefers private transfers.", author: "owner@shiftrentals.com", timestamp: new Date("2025-10-01") }],
    bookings: ["BR-1001"], status: "active",
  },
  {
    uid: "u2", name: "Sophia Laurent", email: "sophia@laurent.co", phone: "+33 6 12 34 56 78",
    totalTrips: 7, lastTripDate: new Date("2026-01-10"), lifetimeValue: 128000, createdAt: new Date("2023-03-20"),
    notes: [], bookings: ["BR-1002"], status: "active",
  },
  {
    uid: "u3", name: "Ahmed Al-Rashidi", email: "ahmed@alrashidi.ae", phone: "+971 50 123 4567",
    totalTrips: 1, lastTripDate: null, lifetimeValue: 0, createdAt: new Date("2026-01-28"),
    notes: [], bookings: ["BR-1003"], status: "active",
  },
  {
    uid: "u4", name: "Elena Vasquez", email: "elena@vasquez.mx", phone: "+52 55 1234 5678",
    totalTrips: 5, lastTripDate: new Date("2026-01-05"), lifetimeValue: 87000, createdAt: new Date("2024-01-10"),
    notes: [], bookings: ["BR-1004"], status: "active",
  },
  {
    uid: "u5", name: "Oliver Chen", email: "oliver@chen.hk", phone: "+852 9876 5432",
    totalTrips: 2, lastTripDate: new Date("2025-11-15"), lifetimeValue: 31000, createdAt: new Date("2024-09-01"),
    notes: [], bookings: ["BR-1005"], status: "deactivated",
  },
];

export const mockVillas: VillaListing[] = [
  {
    id: "v1", type: "villa", name: "Villa Azure", description: "Stunning Cycladic villa with infinity pool overlooking the Aegean Sea.",
    location: "Mykonos, Greece", photos: [], sourceType: "shift_fleet", status: "active", featured: true,
    pricePerNight: 2400, bedrooms: 5, bathrooms: 4, maxGuests: 10, amenities: ["Pool", "Sea View", "Chef", "Helipad"],
    address: "Agios Lazaros, Mykonos 846 00", neighborhood: "Agios Lazaros", minimumStay: 3, market: "Mykonos",
    blockedDates: ["2026-02-10", "2026-02-11", "2026-02-12"], syncedBlockedDates: [],
  },
  {
    id: "v2", type: "villa", name: "Casa Bianca", description: "Elegant cliffside estate with panoramic Amalfi Coast views.",
    location: "Amalfi Coast, Italy", photos: [], sourceType: "pms", sourceName: "Guesty", status: "active", featured: true,
    pricePerNight: 3200, bedrooms: 6, bathrooms: 5, maxGuests: 12, amenities: ["Pool", "Spa", "Wine Cellar", "Private Beach"],
    address: "Via Cristoforo Colombo, Positano", neighborhood: "Positano", minimumStay: 5, market: "Amalfi",
    blockedDates: [], syncedBlockedDates: ["2026-01-20", "2026-01-21", "2026-01-22"], lastSynced: new Date("2026-02-01"),
  },
  {
    id: "v3", type: "villa", name: "Penthouse Royal", description: "Ultra-luxury penthouse in the heart of Dubai Marina.",
    location: "Dubai Marina, UAE", photos: [], sourceType: "shift_fleet", status: "active", featured: false,
    pricePerNight: 4500, bedrooms: 4, bathrooms: 3, maxGuests: 8, amenities: ["Rooftop Pool", "City View", "Butler Service"],
    address: "Marina Walk, Dubai Marina", neighborhood: "Dubai Marina", minimumStay: 2, market: "Dubai",
    blockedDates: ["2026-02-01", "2026-02-02", "2026-02-03", "2026-02-04"], syncedBlockedDates: [],
  },
  {
    id: "v4", type: "villa", name: "Villa Serenity", description: "Tropical paradise nestled in the rice terraces of Bali.",
    location: "Bali, Indonesia", photos: [], sourceType: "api", sourceName: "Hostaway", status: "active", featured: false,
    pricePerNight: 1800, bedrooms: 3, bathrooms: 3, maxGuests: 6, amenities: ["Pool", "Garden", "Yoga Deck", "Spa"],
    address: "Jl. Raya Ubud, Bali", neighborhood: "Ubud", minimumStay: 3, market: "Bali",
    blockedDates: [], syncedBlockedDates: [], lastSynced: new Date("2026-02-03"),
  },
];

export const mockCars: CarListing[] = [
  {
    id: "c1", type: "car", name: "Lamborghini Huracán EVO", description: "V10 naturally aspirated supercar.",
    location: "Mykonos, Greece", photos: [], sourceType: "shift_fleet", status: "active", featured: true,
    brand: "Lamborghini", model: "Huracán EVO", pricePerDay: 800, bodyStyle: "Coupe", seats: 2, transmission: "Automatic",
    blockedDates: [], syncedBlockedDates: [],
  },
  {
    id: "c2", type: "car", name: "Porsche 911 Turbo S", description: "The ultimate sports car experience.",
    location: "Amalfi Coast, Italy", photos: [], sourceType: "shift_fleet", status: "active", featured: true,
    brand: "Porsche", model: "911 Turbo S", pricePerDay: 650, bodyStyle: "Coupe", seats: 4, transmission: "Automatic",
    blockedDates: [], syncedBlockedDates: [],
  },
  {
    id: "c3", type: "car", name: "Rolls-Royce Cullinan", description: "Ultra-luxury SUV for the discerning traveler.",
    location: "Dubai, UAE", photos: [], sourceType: "pms", sourceName: "FleetSync", status: "active", featured: false,
    brand: "Rolls-Royce", model: "Cullinan", pricePerDay: 1100, bodyStyle: "SUV", seats: 5, transmission: "Automatic",
    blockedDates: [], syncedBlockedDates: ["2026-02-05", "2026-02-06"], lastSynced: new Date("2026-02-04"),
  },
  {
    id: "c4", type: "car", name: "Mercedes-AMG GT", description: "A grand tourer with blistering performance.",
    location: "Bali, Indonesia", photos: [], sourceType: "shift_fleet", status: "hidden", featured: false,
    brand: "Mercedes-Benz", model: "AMG GT", pricePerDay: 500, bodyStyle: "Roadster", seats: 2, transmission: "Manual",
    blockedDates: [], syncedBlockedDates: [],
  },
];

export const mockYachts: YachtListing[] = [
  {
    id: "y1", type: "yacht", name: "Azimut Grande", description: "77-foot luxury motor yacht with full crew.",
    location: "Amalfi Coast, Italy", photos: [], sourceType: "shift_fleet", status: "active", featured: true,
    pricePerHour: 1200, length: "77 ft", maxGuests: 12, captainIncluded: true, amenities: ["Jacuzzi", "Water Toys", "Full Bar", "Chef"],
    blockedDates: [], syncedBlockedDates: [],
  },
  {
    id: "y2", type: "yacht", name: "Sunseeker Predator", description: "68-foot performance yacht built for speed and luxury.",
    location: "Dubai Marina, UAE", photos: [], sourceType: "shift_fleet", status: "active", featured: true,
    pricePerHour: 900, length: "68 ft", maxGuests: 10, captainIncluded: true, amenities: ["Flybridge", "Sound System", "Snorkeling Gear"],
    blockedDates: [], syncedBlockedDates: [],
  },
  {
    id: "y3", type: "yacht", name: "Princess V65", description: "Elegant 65-foot cruiser for Mediterranean escapes.",
    location: "Mykonos, Greece", photos: [], sourceType: "api", sourceName: "Click&Boat", status: "active", featured: false,
    pricePerHour: 750, length: "65 ft", maxGuests: 8, captainIncluded: false, amenities: ["Sun Deck", "BBQ", "Diving Equipment"],
    blockedDates: [], syncedBlockedDates: [], lastSynced: new Date("2026-02-02"),
  },
];
