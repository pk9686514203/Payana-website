# Payana Travel Hub - Backend API

A production-ready REST API for a travel booking platform built with Express.js and MongoDB.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Seed database with initial data
node seed.js
```

Server runs on `http://localhost:5000`

## 📚 API Documentation

### Base URL: `http://localhost:5000/api`

All endpoints require `Content-Type: application/json` except file uploads which require `multipart/form-data`.

### Authentication

Protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### POST `/auth/signup`
Create a new user account

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "secure_password",
  "role": "customer"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "user": { /* user object */ },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST `/auth/login`
Login with email and password

**Request:**
```json
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": { /* user object */ },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET `/auth/profile`
Get current user profile (Protected)

**Response:** `200 OK`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "customer"
}
```

---

## 🏢 Agency Endpoints

### POST `/agencies/register`
Register a new travel agency (Protected)

**Request:**
```json
{
  "name": "SoaringX Tours",
  "location": "Bengaluru",
  "description": "Premium tour packages",
  "phone": "9390071812",
  "email": "soaring@example.com",
  "instagram": "https://instagram.com/soaring"
}
```

**Response:** `201 Created`

### GET `/agencies`
Get all verified agencies (Public)

**Response:** `200 OK`
```json
[
  {
    "_id": "agency_id",
    "name": "SoaringX Tours",
    "location": "Bengaluru",
    "verified": true,
    ...
  }
]
```

### GET `/agencies/:id`
Get agency details (Public)

### GET `/agencies/my-agency`
Get current user's agency (Protected)

### PUT `/agencies/:id`
Update agency details (Protected - owner only)

---

## 📦 Package Endpoints

### POST `/packages/add`
Create a new tour package (Protected)

**Request:** `multipart/form-data`
```
name: "Kerala Adventure"
price: 6499
duration: "3 Days"
description: "Amazing Kerala trip"
locations: "Munnar, Alleppey"
itinerary: "Day 1: ...\nDay 2: ..."
includes: "Transport, Stay, Food"
agencyId: "agency_id"
image: <file>
```

**Response:** `201 Created`

### GET `/packages`
Get all tour packages (Public)

### GET `/packages/:id`
Get package details (Public)

### GET `/packages/agency/:agencyId`
Get packages by agency (Public)

### PUT `/packages/:id`
Update package (Protected - creator only)

### DELETE `/packages/:id`
Delete package (Protected - creator only)

---

## 🚗 Vehicle Endpoints

### POST `/vehicles/add`
Add a new vehicle (Protected)

**Request:** `multipart/form-data`
```
name: "Toyota Innova Crysta"
type: "suv"
seats: 7
pricePerKm: 16
location: "Bengaluru"
agencyId: "agency_id" (optional)
features: "AC, GPS, WiFi"
image: <file>
```

**Supported Types:** car, suv, van, bus, bike

### GET `/vehicles`
Get all vehicles (Public)

### GET `/vehicles/:id`
Get vehicle details (Public)

### GET `/vehicles/agency/:agencyId`
Get vehicles by agency (Public)

### PUT `/vehicles/:id`
Update vehicle (Protected - owner only)

### DELETE `/vehicles/:id`
Delete vehicle (Protected - owner only)

---

## 📅 Booking Endpoints

### POST `/bookings`
Create a booking (Protected)

**Request:**
```json
{
  "packageId": "package_id",
  "vehicleId": "vehicle_id",
  "bookingDate": "2026-04-15",
  "fromLocation": "Bengaluru",
  "toLocation": "Kerala",
  "numberOfPeople": 4,
  "notes": "Family trip"
}
```

**Response:** `201 Created`

### GET `/bookings/my-bookings`
Get user's bookings (Protected)

### GET `/bookings/:id`
Get booking details (Protected - user only)

### PUT `/bookings/:id`
Update booking (Protected - user only)

**Request:**
```json
{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

### POST `/bookings/:id/cancel`
Cancel booking (Protected - user only)

**Response:** `200 OK`
```json
{
  "message": "Booking cancelled successfully",
  "booking": { /* booking object with status: 'cancelled' */ }
}
```

---

## 📁 Image Upload

Upload images via multipart/form-data on package or vehicle creation:

```bash
curl -X POST http://localhost:5000/api/vehicles/add \
  -H "Authorization: Bearer <token>" \
  -F "name=Innova" \
  -F "type=suv" \
  -F "seats=7" \
  -F "pricePerKm=16" \
  -F "location=Bengaluru" \
  -F "image=@vehicle.jpg"
```

Images are stored in `public/images/` and served at:
```
http://localhost:5000/images/<filename>
```

---

## 🗂️ Project Structure

```
backend/
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Agency.js
│   ├── Vehicle.js
│   ├── Package.js
│   └── Booking.js
│
├── controllers/         # Business logic
│   ├── authController.js
│   ├── agencyController.js
│   ├── vehicleController.js
│   ├── packageController.js
│   └── bookingController.js
│
├── routes/             # API routes
│   ├── authRoutes.js
│   ├── agencyRoutes.js
│   ├── vehicleRoutes.js
│   ├── packageRoutes.js
│   └── bookingRoutes.js
│
├── middleware/         # Authentication
│   └── auth.js
│
├── public/             # Static files
│   └── images/         # Uploaded images
│
├── server.js           # Express server
├── seed.js             # Database seeding
├── package.json
├── .env
└── .gitignore
```

---

## ⚙️ Environment Configuration

Create `.env` file:

```env
# MongoDB connection (local or Atlas)
MONGODB_URI=mongodb://localhost:27017/payana-travel-hub

# JWT configuration
JWT_SECRET=your_jwt_secret_key_change_in_production

# Server port
PORT=5000

# Environment
NODE_ENV=development
```

---

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (customer|agency|vehicleOwner),
  verified: Boolean,
  timestamps: true
}
```

### Agency
```javascript
{
  name: String,
  owner: ObjectId (User reference),
  location: String,
  description: String,
  logo: String,
  phone: String,
  email: String,
  verified: Boolean,
  rating: Number,
  packagesCount: Number,
  timestamps: true
}
```

### Package
```javascript
{
  name: String,
  price: Number,
  duration: String,
  image: String,
  description: String,
  locations: [String],
  itinerary: [String],
  includes: [String],
  agency: ObjectId (Agency reference),
  rating: Number,
  reviews: Number,
  verified: Boolean,
  timestamps: true
}
```

### Vehicle
```javascript
{
  name: String,
  type: String (car|suv|van|bus|bike),
  seats: Number,
  pricePerKm: Number,
  owner: ObjectId (User reference),
  agency: ObjectId (Agency reference),
  location: String,
  image: String,
  rating: Number,
  verified: Boolean,
  features: [String],
  timestamps: true
}
```

### Booking
```javascript
{
  user: ObjectId (User reference),
  package: ObjectId (Package reference),
  vehicle: ObjectId (Vehicle reference),
  bookingDate: Date,
  fromLocation: String,
  toLocation: String,
  numberOfPeople: Number,
  totalPrice: Number,
  status: String (pending|confirmed|cancelled|completed),
  notes: String,
  timestamps: true
}
```

---

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT authentication for protected routes
- CORS enabled for frontend
- Input validation on all endpoints
- Environment variables for secrets

---

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "customer"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Agencies
```bash
curl http://localhost:5000/api/agencies
```

### Get Packages
```bash
curl http://localhost:5000/api/packages
```

---

## 🚀 Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri
```

### Railway
1. Connect GitHub repo
2. Set environment variables
3. Deploy

### Render
1. Create new Web Service
2. Connect GitHub
3. Set environment variables
4. Deploy

---

## 📝 Error Handling

All errors return appropriate HTTP status codes:

- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - No permission
- `404 Not Found` - Resource not found
- `500 Server Error` - Server error

Example error response:
```json
{
  "message": "Invalid email or password"
}
```

---

## 📊 Response Format

All successful responses follow this format:
```json
{
  "message": "Operation successful",
  "data": { /* resource object */ }
}
```

List endpoints return array:
```json
[
  { /* resource 1 */ },
  { /* resource 2 */ }
]
```

---

## 🔄 Development Workflow

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend**
   ```bash
   npm run dev
   ```

3. **Seed Database** (optional)
   ```bash
   node seed.js
   ```

4. **Test APIs**
   - Use Postman/Insomnia/cURL
   - Check responses
   - Verify database updates

---

## 📞 Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in .env
- Verify MongoDB Atlas whitelist IP

**JWT Errors**
- Check token in Authorization header
- Verify JWT_SECRET is set
- Ensure token hasn't expired

**File Upload Errors**
- Check multer configuration
- Verify public/images folder exists
- Check file size limits

---

**Build Status:** ✅ Production Ready  
**Last Updated:** March 18, 2026
