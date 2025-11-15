# Spa Owner - Complete Guide

## 🔑 How Spa Owner Login Works

### Important: There's NO Separate Spa Owner Login!

**Everyone uses the SAME login process:**
- Admin ✅
- Spa Owner ✅
- Customer ✅

All use phone number + OTP authentication at: http://localhost:3000/login

---

## 📋 Step-by-Step: Spa Owner Flow

### Step 1: Create Spa Owner Account

A spa owner is just a regular user with `role: "spa_owner"` in the database.

**Method 1: Register First, Then Upgrade**
```bash
# 1. User registers normally at /login
# Phone: +919111111111
# Name: Raj Spa Owner

# 2. Admin upgrades their role in MongoDB
mongosh bookyourspa

db.users.updateOne(
  { phone: "+919111111111" },
  { $set: { role: "spa_owner" } }
)

# 3. User logs out and logs back in
# Now they have spa owner access!
```

**Method 2: Create Directly in Database**
```bash
mongosh bookyourspa

db.users.insertOne({
  name: "Raj Spa Owner",
  phone: "+919111111111",
  role: "spa_owner",
  bookmarks: [],
  createdAt: new Date()
})

# Now they can login with this phone number
```

---

## 🏢 How Spa Owner Sees Their Bookings

### The System Works Like This:

```
1. Spa Owner creates a spa listing
   └─> Spa is saved with ownerId = spa_owner's user ID

2. Customer books that spa
   └─> Booking is saved with spaId = spa's ID

3. Spa Owner visits "My Bookings"
   └─> System finds all spas owned by them
   └─> Shows all bookings for those spas
```

### Code Flow:

**File: `/app/app/api/bookings/route.js`**

```javascript
// When spa owner requests bookings:

if (user.role === 'spa_owner') {
  // Step 1: Find all spas owned by this user
  const ownedSpas = await Spa.find({ 
    ownerId: user.id 
  }).select('_id');
  
  // Result: [{ _id: "spa1" }, { _id: "spa2" }]
  
  // Step 2: Get spa IDs
  const spaIds = ownedSpas.map(spa => spa._id);
  // Result: ["spa1", "spa2"]
  
  // Step 3: Find all bookings for these spas
  bookings = await Booking.find({ 
    spaId: { $in: spaIds } 
  });
  
  // Result: All bookings for spa1 and spa2
}
```

---

## 🎯 Complete Spa Owner Journey

### Scenario: Raj Opens a New Spa

#### Phase 1: Become Spa Owner
```
1. Raj registers at /login
   - Phone: +919111111111
   - Name: Raj Kumar
   - Gets role: "customer" (default)

2. Admin makes him spa owner:
   db.users.updateOne(
     { phone: "+919111111111" },
     { $set: { role: "spa_owner" } }
   )

3. Raj logs out and logs back in
   - Now sees "Add Listing" in menu ✅
```

#### Phase 2: Add Spa Listing
```
4. Raj clicks "Add Listing"
   - Fills form: "Raj's Wellness Spa"
   - Services: Swedish Massage, Hot Stone
   - Location: Ahmedabad
   - Pricing: ₹2000 per session

5. System creates spa:
   {
     title: "Raj's Wellness Spa",
     ownerId: "raj_user_id_here",  ← Links to Raj!
     services: [...],
     location: {...}
   }
```

#### Phase 3: Customer Books
```
6. Customer "Priya" searches for spas
   - Finds "Raj's Wellness Spa"
   - Books Swedish Massage for Feb 10, 2025

7. System creates booking:
   {
     userId: "priya_user_id",
     spaId: "rajs_spa_id",        ← Links to Raj's spa!
     customerName: "Priya",
     customerPhone: "+919222222222",
     service: "Swedish Massage",
     date: "2025-02-10",
     time: "14:00"
   }

8. Notifications sent:
   - WhatsApp to Priya ✅
   - WhatsApp to Raj ✅
```

#### Phase 4: Raj Checks Bookings
```
9. Raj goes to "My Bookings"
   
10. System logic:
    - Finds Raj is spa_owner
    - Finds all spas where ownerId = Raj's ID
    - Finds: ["Raj's Wellness Spa"]
    - Gets all bookings for this spa
    - Shows: Priya's booking ✅

11. Raj sees:
    ┌─────────────────────────────────┐
    │ Customer: Priya                 │
    │ Phone: +919222222222            │
    │ Service: Swedish Massage        │
    │ Date: Feb 10, 2025              │
    │ Time: 14:00                     │
    │ Status: Confirmed               │
    └─────────────────────────────────┘
```

---

## 🔍 How System Identifies Spa Owner's Bookings

### Database Structure:

```javascript
// Users Collection
{
  _id: "raj_user_id",
  name: "Raj Kumar",
  phone: "+919111111111",
  role: "spa_owner"  ← This identifies him as spa owner
}

// Spas Collection
{
  _id: "rajs_spa_id",
  title: "Raj's Wellness Spa",
  ownerId: "raj_user_id"  ← Links spa to Raj
}

// Bookings Collection
{
  _id: "booking1",
  spaId: "rajs_spa_id",  ← Links booking to spa
  customerName: "Priya",
  customerPhone: "+919222222222",
  service: "Swedish Massage"
}
```

### The Connection Chain:
```
Spa Owner (Raj) 
    ↓ ownerId
Spa (Raj's Wellness Spa)
    ↓ spaId  
Booking (Priya's booking)
```

### Query Logic:
```javascript
// Find Raj's user ID
userId = "raj_user_id"

// Find all spas owned by Raj
spas = Spa.find({ ownerId: userId })
// Result: ["rajs_spa_id", "another_spa_id"]

// Find all bookings for these spas
bookings = Booking.find({ 
  spaId: { $in: ["rajs_spa_id", "another_spa_id"] } 
})
// Result: All bookings for Raj's spas
```

---

## 📊 What Different Roles See

### Customer (Priya)
**My Bookings Page:**
```
Only sees HER OWN bookings:
- Her booking at Raj's Wellness Spa
- Her booking at Another Spa
- (Does NOT see other customers' bookings)
```

### Spa Owner (Raj)
**My Bookings Page:**
```
Only sees bookings for HIS SPA(S):
- Priya's booking at Raj's Wellness Spa
- Kumar's booking at Raj's Wellness Spa
- Anita's booking at Raj's Wellness Spa
- (Does NOT see bookings at other spas)
```

### Admin (Dipak Parmar)
**My Bookings Page:**
```
Sees ALL bookings from ALL spas:
- All bookings at Raj's Wellness Spa
- All bookings at Serenity Spa
- All bookings at Royal Retreat
- (Sees EVERYTHING)
```

---

## 🧪 Testing Spa Owner Flow

### Quick Test:

```bash
# 1. Create spa owner
mongosh bookyourspa

db.users.insertOne({
  name: "Test Spa Owner",
  phone: "+919123456789",
  role: "spa_owner",
  bookmarks: [],
  createdAt: new Date()
})

# 2. Login
# Go to: http://localhost:3000/login
# Phone: +919123456789
# Get OTP from logs: tail -f /var/log/supervisor/frontend.out.log | grep MOCKED

# 3. After login, check navbar
# Should see: "Test Spa Owner" with "Spa Owner" role

# 4. Click "Add Listing"
# Should open form (NOT redirect to login)

# 5. Create a test spa
# Fill form and submit

# 6. Get the spa ID
mongosh bookyourspa --eval "db.spas.findOne({}, {title:1, ownerId:1})"

# 7. Create a test booking for this spa
# (Use the booking form or insert directly)

# 8. Go to "My Bookings"
# Should see the booking! ✅
```

---

## ❓ Common Questions

### Q: How does spa owner know they're a spa owner?
**A:** They see:
1. "Spa Owner" label under their name in navbar
2. "Add Listing" option in dropdown menu
3. Can create new spa listings

### Q: What if spa owner creates multiple spas?
**A:** They'll see bookings from ALL their spas in "My Bookings"

### Q: Can customer become spa owner?
**A:** Yes! Admin updates their role:
```bash
db.users.updateOne(
  { phone: "+91customer_phone" },
  { $set: { role: "spa_owner" } }
)
```

### Q: Can spa owner see other spas' bookings?
**A:** No! They only see bookings for spas they own (where ownerId matches their user ID)

### Q: What if spa has no owner?
**A:** Every spa MUST have an ownerId when created. If missing, bookings won't be visible to anyone except admin.

---

## 🔧 Current Implementation

### Files Involved:

1. **Login**: `/app/app/login/page.js`
   - Same for all users

2. **Auth API**: `/app/app/api/auth/verify-otp/route.js`
   - Creates user with role
   - Generates JWT with role info

3. **Bookings API**: `/app/app/api/bookings/route.js`
   - Line 27-40: Spa owner logic
   - Filters bookings by owned spas

4. **Bookings Page**: `/app/app/dashboard/bookings/page.js`
   - Displays bookings based on role

5. **Add Listing**: `/app/app/dashboard/add-listing/page.js`
   - Sets ownerId automatically
   - Line 79: `ownerId: decoded.userId`

---

## 🎯 Summary

### How It Works:

1. **No Special Login** → Same OTP login for everyone
2. **Role in Database** → `role: "spa_owner"` in MongoDB
3. **Create Spa** → Spa saved with ownerId
4. **Customer Books** → Booking saved with spaId
5. **Check Bookings** → System matches ownerId → spaId → bookings

### Key Points:

✅ Spa owner is just a role, not a different account type
✅ One spa owner can own multiple spas
✅ They only see bookings for their spas
✅ System automatically links via ownerId and spaId
✅ WhatsApp notifications sent to spa owner's phone

**The system is already fully implemented and working!** 🎉
