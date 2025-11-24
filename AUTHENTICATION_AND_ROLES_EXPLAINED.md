# BookYourSpa - Authentication & Roles System Explained

## 🔐 How Login Works (Same for Everyone)

### Login Flow (OTP-Based)
**Everyone uses the same login page** - Admin, Spa Owner, and Customer all login the same way:

```
1. User visits /login
2. Enters Name + Phone Number
3. Clicks "Send OTP"
4. System sends 6-digit OTP to phone via Fast2SMS
5. User enters OTP
6. System verifies OTP
7. User is logged in ✅
```

**There's NO separate admin login page or password!** 🎯

---

## 👥 How Roles Work

### Three User Roles:

1. **Customer** (default) - Regular users who book spas
2. **Spa Owner** - Can add/manage their own spa listings
3. **Admin** - Can see everything and manage all spas

### Role Assignment:

```javascript
// When a NEW user logs in for the first time:
// They automatically get "customer" role

// Database User Model:
{
  name: "John Doe",
  phone: "+919876543210",
  role: "customer",  // ← Default role
  bookmarks: [],
  createdAt: Date
}
```

---

## 🔧 How to Create Admin or Spa Owner

### **IMPORTANT**: Roles are assigned in the DATABASE, not during login!

### Method 1: Using Seed Script (Already Done)
When you ran the seed script, an admin was created:

```javascript
// From /app/scripts/seed.js
await User.create({
  name: 'Dipak Parmar',
  phone: '+919999999999',
  role: 'admin'  // ← Admin role assigned
});
```

**So right now you have:**
- Admin: `+919999999999` (Dipak Parmar)

### Method 2: Manually Update Database

To make someone an admin or spa owner, update their role in MongoDB:

```bash
# Connect to MongoDB
mongosh bookyourspa

# Make a user admin
db.users.updateOne(
  { phone: "+919876543210" },
  { $set: { role: "admin" } }
)

# Make a user spa owner
db.users.updateOne(
  { phone: "+919123456789" },
  { $set: { role: "spa_owner" } }
)
```

### Method 3: Create Admin Panel Feature (TODO)
You could build an admin page where existing admins can change user roles:

```
Admin Dashboard → User Management → Change Role
```

---

## 🎭 How the System Knows User Role

### During Login:
```javascript
// When user verifies OTP successfully:
// /app/app/api/auth/verify-otp/route.js

const user = await User.findOne({ phone });

// Create JWT token with role info
const token = signToken({
  userId: user._id,
  phone: user.phone,
  name: user.name,
  role: user.role  // ← Role included in token!
});

// Store token in cookie
response.cookies.set('token', token);
```

### On Every Request:
```javascript
// Middleware checks token and extracts role
// /app/middleware.js

const token = request.cookies.get('token');
const decoded = verifyToken(token);

// decoded contains:
{
  userId: "abc123",
  phone: "+919876543210",
  name: "John Doe",
  role: "admin"  // ← Available in all API requests!
}
```

---

## 🚪 Role-Based Access Control

### Navigation Menu
```javascript
// /app/components/Navbar.jsx

{user.role === 'admin' || user.role === 'spa_owner' ? (
  <Link href="/dashboard/add-listing">
    Add Listing  {/* Only Admin & Spa Owner see this */}
  </Link>
) : null}
```

### API Endpoints
```javascript
// Example: Creating a spa listing
// /app/app/api/spas/route.js (POST)

const decoded = verifyToken(token);

if (decoded.role !== 'admin' && decoded.role !== 'spa_owner') {
  return NextResponse.json(
    { error: 'Unauthorized' }, 
    { status: 403 }
  );
}

// Only admin and spa_owner can create spas ✅
```

### Dashboard Pages
```javascript
// Example: My Bookings page
// /app/app/dashboard/bookings/page.js

if (user.role === 'admin') {
  // Show ALL bookings from ALL spas
  bookings = await Booking.find();
  
} else if (user.role === 'spa_owner') {
  // Show ONLY bookings for their own spa
  const ownedSpas = await Spa.find({ ownerId: user.id });
  bookings = await Booking.find({ spaId: { $in: ownedSpas } });
  
} else {
  // Show ONLY their own bookings
  bookings = await Booking.find({ userId: user.id });
}
```

---

## 📝 Step-by-Step Example

### Scenario: Creating a Spa Owner

**Step 1: New user registers**
```
1. User goes to /login
2. Enters: Name: "Raj Patel", Phone: "+919111111111"
3. Receives OTP: 456789
4. Logs in successfully
5. Role: "customer" (default)
```

**Step 2: Admin upgrades to Spa Owner**
```bash
# In MongoDB
mongosh bookyourspa

db.users.updateOne(
  { phone: "+919111111111" },
  { $set: { role: "spa_owner" } }
)

# Result: { acknowledged: true, modifiedCount: 1 }
```

**Step 3: User logs out and logs back in**
```
1. User clicks Logout
2. Logs back in with same phone
3. New JWT token generated with role: "spa_owner"
4. Now sees "Add Listing" in menu! ✅
```

**Step 4: Spa Owner creates listing**
```
1. Clicks "Add Listing"
2. Fills spa details
3. Submits form
4. API checks: user.role === 'spa_owner' ✅
5. Spa created with ownerId = user.id
6. Now can see bookings for their spa!
```

---

## 🧪 Testing Different Roles

### Test as Admin
```bash
# Login with admin account
Phone: +919999999999
Name: Dipak Parmar

# After OTP verification, you'll see:
✓ My Bookings → All bookings from all spas
✓ Add Listing → Can add new spas
✓ Can see all data
```

### Test as Spa Owner
```bash
# First, create a spa owner:
mongosh bookyourspa

db.users.insertOne({
  name: "Spa Owner Test",
  phone: "+919222222222",
  role: "spa_owner",
  bookmarks: [],
  createdAt: new Date()
})

# Then login:
Phone: +919222222222
Name: Spa Owner Test

# After login:
✓ Add Listing → Can add spas
✓ My Bookings → Only sees bookings for their own spa
✗ Cannot see other spas' bookings
```

### Test as Customer
```bash
# Login with any new number:
Phone: +919333333333
Name: Test Customer

# After login:
✓ Can search and book spas
✓ My Bookings → Only their own bookings
✗ Cannot see "Add Listing"
✗ Cannot access admin features
```

---

## 🔍 How to Check Current User Role

### Method 1: In Browser Console
```javascript
// On any page after login:
// Open browser console and run:

fetch('/api/auth/me')
  .then(r => r.json())
  .then(d => console.log('Your role:', d.user.role))

// Output: "Your role: admin" or "spa_owner" or "customer"
```

### Method 2: Check Database
```bash
mongosh bookyourspa

# Find all users with their roles
db.users.find({}, { name: 1, phone: 1, role: 1 })

# Output:
{
  _id: ObjectId("..."),
  name: "Dipak Parmar",
  phone: "+919999999999",
  role: "admin"
}
```

### Method 3: Check Navbar
After login, the navigation menu changes based on role:
- **Customer**: Only sees "Book Now", "My Bookings", "Bookmarks", "Messages"
- **Spa Owner**: Also sees "Add Listing"
- **Admin**: Sees everything

---

## 🛠️ How to Manually Create Users with Roles

### Quick Script to Add Users:

Create `/app/scripts/add_user.js`:

```javascript
const mongoose = require('mongoose');

async function addUser(name, phone, role) {
  await mongoose.connect('mongodb://localhost:27017/bookyourspa');
  
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    phone: String,
    role: String,
    bookmarks: [mongoose.Schema.Types.ObjectId],
    createdAt: { type: Date, default: Date.now }
  }));

  const user = await User.create({ name, phone, role });
  console.log(`✓ Created ${role}:`, name, phone);
  
  process.exit(0);
}

// Usage:
addUser(
  "Spa Owner Name", 
  "+919888888888", 
  "spa_owner"
);
```

Run it:
```bash
cd /app
node scripts/add_user.js
```

---

## 📊 Current Users in System

After running the seed script, you have:

```javascript
// Admin User
{
  name: "Dipak Parmar",
  phone: "+919999999999",
  role: "admin"
}

// All spas are owned by admin
// So admin can see their bookings
```

---

## 🎯 Key Takeaways

1. **Same Login for Everyone** - No separate admin/owner login pages
2. **Roles in Database** - Role is stored in user document
3. **Role in JWT Token** - Role is included in authentication token
4. **Default is Customer** - New users automatically get customer role
5. **Manual Role Update** - Admin/Spa Owner must be set via database
6. **Role-Based UI** - Different menus/pages based on role
7. **Role-Based API** - Different data access based on role

---

## 🚀 Quick Commands Reference

```bash
# Check all users and roles
mongosh bookyourspa
db.users.find({}, {name:1, phone:1, role:1})

# Make someone admin
db.users.updateOne(
  {phone: "+91XXXXXXXXXX"}, 
  {$set: {role: "admin"}}
)

# Make someone spa owner
db.users.updateOne(
  {phone: "+91XXXXXXXXXX"}, 
  {$set: {role: "spa_owner"}}
)

# Make someone customer (downgrade)
db.users.updateOne(
  {phone: "+91XXXXXXXXXX"}, 
  {$set: {role: "customer"}}
)
```

---

## 💡 Recommendation: Build Admin Panel

Consider adding an admin-only page to manage users:

```
/dashboard/admin/users
```

Where admins can:
- See all users
- Change user roles via UI
- Delete users
- View user activity

This would make role management much easier! 🎉
