# Car Booking System - Complete Guide

A modern, responsive car rental management system built with Node.js, Express, MongoDB, and EJS with a professional blue theme.

## 🚀 Features

### For Regular Users
- **User Registration & Login**: Secure authentication system with session management
- **Browse Cars**: View cars in an attractive card-based grid layout with images and descriptions
- **Car Details**: Detailed view of each car with full specifications and booking button
- **Make Bookings**: Easy booking system with date selection and automatic price calculation
- **Manage Bookings**: View all your bookings with status tracking
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### For Administrators
- **User Management**: View all registered users and their roles
- **Car Management**: Add, edit, and manage vehicles in the system
- **Booking Management**: View and manage all system bookings
- **Dashboard**: Complete overview with statistics and quick actions

## 🎨 Design Features

- **Blue Color Scheme**: Professional xanh dương (blue) primary colors throughout
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Card-based Layout**: Cars and content displayed in beautiful card grids
- **Gradient Headers**: Stylish gradient backgrounds for headers and sections
- **Interactive Elements**: Hover effects, transitions, and visual feedback
- **Mobile Responsive**: Fully responsive design for all screen sizes

## 📋 System Flow

```
1. Login Page
   ↓
2. Dashboard (Choose action based on role)
   ├── Browse Cars → Car List (Card Grid) → Car Details → Book
   ├── View Bookings → Booking List → Booking Details
   └── (Admin) User Management
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- `express` - Web framework
- `ejs` - Template engine
- `mongoose` - MongoDB ODM
- `express-session` - Session management
- `dotenv` - Environment variables

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/car_booking
SESSION_SECRET=your-secret-key-here
```

### Step 3: Start MongoDB
Make sure MongoDB is running:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### Step 4: Start the Server
```bash
npm start
```

The application will start at `http://localhost:3000`

## 👤 Demo Credentials

### Admin Account
- Email: `admin@test.com`
- Password: `123456`

### Regular User
- Email: `user@test.com`
- Password: `123456`

## 📁 Project Structure

```
chapter_3/
├── app.js                          # Main application file
├── package.json                    # Dependencies
├── config/
│   └── db.js                      # MongoDB connection
├── models/
│   ├── User.js                    # User schema
│   ├── Car.js                     # Car schema with image & description
│   ├── Booking.js                 # Booking schema
│   └── Contract.js                # Contract schema
├── controllers/
│   ├── authController.js          # Authentication logic
│   ├── userController.js          # User operations
│   ├── carController.js           # Car operations
│   └── bookingController.js       # Booking operations
├── routes/
│   ├── authRoutes.js              # Login/Register routes
│   ├── uiRoutes.js                # UI page routes
│   ├── userRoutes.js              # User API routes
│   ├── carRoutes.js               # Car API routes
│   └── bookingRoutes.js           # Booking API routes
├── middleware/
│   ├── auth.js                    # API authentication
│   └── checkAuth.js               # Session authentication
├── views/
│   ├── auth/
│   │   ├── login.ejs              # Login page
│   │   └── register.ejs           # Registration page
│   ├── dashboard.ejs              # Main dashboard
│   ├── cars/
│   │   ├── list.ejs               # Car listing (card grid)
│   │   ├── detail.ejs             # Car detail page
│   │   └── create.ejs             # Add new car form
│   ├── bookings/
│   │   ├── list.ejs               # Booking listing
│   │   ├── detail.ejs             # Booking details
│   │   └── create.ejs             # Create booking form
│   └── users/
│       └── list.ejs               # User management (Admin)
└── public/
    └── style.css                  # Global styles (blue theme)
```

## 🎯 Key Pages

### 1. Login Page (`/auth/login`)
- Clean login form with email and password
- Demo credentials display
- Link to registration
- Session-based authentication

### 2. Dashboard (`/dashboard`)
- Welcome message personalized to user
- Quick action cards (Browse Cars, My Bookings, etc.)
- Different menu based on user role (Admin/User)
- Getting started guide

### 3. Cars Listing (`/ui/cars`)
- **Card-based grid layout** with images
- Car brand, model, and description
- Price per day display
- Available/Booked status badges
- "View Details" and "Book" buttons

### 4. Car Details (`/ui/cars/:id`)
- Full-size car image
- Complete vehicle information
- Detailed description
- Status badge
- "Book This Car" button
- Related cars section

### 5. Bookings (`/ui/bookings`)
- Table showing all user bookings
- Guest info with avatar
- Vehicle details
- Rental dates range
- Total price
- Status badge (Active/Confirmed/Cancelled)
- Details button for each booking

### 6. Create Booking (`/ui/bookings/create`)
- Car selection dropdown
- Start and end date pickers
- Automatic duration calculation
- Real-time price calculation
- Booking summary sidebar
- Submit button

### 7. User Management (`/ui/users`) - Admin Only
- Table of all system users
- User avatar with initials
- Email and role display
- Registration date
- User statistics cards

## 🎨 CSS Theme - Blue Color Scheme

### Primary Colors
- Main Blue: `#0066cc`
- Light Blue: `#1a7fd9`
- Dark Blue: `#004a99`
- Sky Blue (Background): `#e6f2ff`
- Accent Blue: `#00a8e8`

### Element Styling
- **Headers**: Gradient blue backgrounds
- **Buttons**: Blue gradients with hover effects
- **Cards**: White with blue shadows and borders
- **Tables**: Blue headers with light blue hover states
- **Badges**: Colorful gradient badges for status
- **Links**: Blue with underline on hover

## 🔐 Authentication Flow

1. User visits `/` → Redirected to `/auth/login` if not logged in
2. User enters email and password
3. Backend validates credentials
4. Session is created with user data
5. User redirected to `/dashboard`
6. All protected routes check session

## 📊 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String,
  role: "admin" | "user",
  createdAt: Date
}
```

### Car
```javascript
{
  brand: String,
  model: String,
  pricePerDay: Number,
  description: String,
  imageUrl: String,
  status: "AVAILABLE" | "BOOKED",
  ownerId: ObjectId,
  createdAt: Date
}
```

### Booking
```javascript
{
  userId: ObjectId,
  carId: ObjectId,
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  status: "ACTIVE" | "CONFIRMED" | "CANCELED",
  createdAt: Date
}
```

## 🚀 API Endpoints

### Authentication
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /auth/logout` - Logout

### Cars (API)
- `GET /api/cars` - Get all cars
- `POST /api/cars` - Create car (requires auth)

### Bookings (API)
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings
- `PUT /api/bookings/:id/confirm` - Confirm booking

### Users (API)
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user

## 🐛 Troubleshooting

### "Cannot GET /auth/login"
- Ensure `express-session` is installed
- Check that routes are properly registered in `app.js`

### MongoDB Connection Error
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- Ensure database credentials are correct

### Styling Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Verify `/public/style.css` exists
- Check that Bootstrap CDN is loading

### Session Issues
- Clear cookies in browser
- Ensure `SESSION_SECRET` is set in `.env`
- Check that session middleware is before routes in `app.js`

## 📝 Next Steps for Enhancement

1. **Payment Integration**: Add Stripe/PayPal payment processing
2. **Email Notifications**: Send confirmation emails for bookings
3. **Image Upload**: Allow users to upload car images
4. **Reviews & Ratings**: Add user reviews for cars
5. **Advanced Search**: Filter cars by brand, price range, features
6. **SMS Notifications**: Send booking confirmations via SMS
7. **Admin Reports**: Generate booking and revenue reports
8. **Cancellation Policy**: Implement refund and cancellation rules

## 📄 License

This project is created for educational purposes as part of SDN302 - Web Development.

## 👨‍💻 Author

SDN302 Class Project - Car Booking Management System

---

**Version**: 1.0.0  
**Last Updated**: February 5, 2026
