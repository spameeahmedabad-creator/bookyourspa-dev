# How to Create Admin & Spa Owner Accounts

## 🎯 Quick Answer

**There's NO special admin or spa owner registration!**

Everyone uses the same login page. Roles are assigned in the **database**.

---

## 📋 Step-by-Step Guide

### Option 1: Using MongoDB Shell (Easiest)

#### Create a Spa Owner:

```bash
# Step 1: New user registers normally
# They go to /login and enter:
# Name: "Raj Spa Owner"
# Phone: "+919111111111"
# They get OTP and login (now they're a "customer")

# Step 2: Upgrade them to spa_owner in database
mongosh bookyourspa

db.users.updateOne(
  { phone: "+919111111111" },
  { $set: { role: "spa_owner" } }
)

# Step 3: User logs out and logs back in
# Now they'll see "Add Listing" option! ✅
```

#### Create an Admin:

```bash
# Same process but with "admin" role
mongosh bookyourspa

db.users.updateOne(
  { phone: "+919222222222" },
  { $set: { role: "admin" } }
)
```

---

### Option 2: Create User Directly in Database

If the user hasn't logged in yet, create them directly:

```bash
mongosh bookyourspa

# Create a spa owner
db.users.insertOne({
  name: "New Spa Owner",
  phone: "+919333333333",
  role: "spa_owner",
  bookmarks: [],
  createdAt: new Date()
})

# Create an admin
db.users.insertOne({
  name: "New Admin",
  phone: "+919444444444",
  role: "admin",
  bookmarks: [],
  createdAt: new Date()
})
```

Now these users can login with their phone numbers!

---

### Option 3: Using Node.js Script

Create `/app/scripts/create_user.js`:

```javascript
const mongoose = require('mongoose');

async function createUser(name, phone, role) {
  await mongoose.connect('mongodb://localhost:27017/bookyourspa');
  
  const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    role: { type: String, default: 'customer' },
    bookmarks: [mongoose.Schema.Types.ObjectId],
    createdAt: { type: Date, default: Date.now }
  });
  
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  
  // Check if user exists
  const existing = await User.findOne({ phone });
  
  if (existing) {
    // Update role
    existing.role = role;
    await existing.save();
    console.log(`✓ Updated ${phone} to ${role}`);
  } else {
    // Create new
    await User.create({ name, phone, role });
    console.log(`✓ Created new ${role}: ${name} (${phone})`);
  }
  
  process.exit(0);
}

// Run this function:
createUser("Spa Owner Name", "+919555555555", "spa_owner");
```

Run it:
```bash
node /app/scripts/create_user.js
```

---

## 🧪 Testing

### Test Admin Login:

```bash
# 1. Go to: http://localhost:3000/login

# 2. Enter:
Name: Dipak Parmar
Phone: +919999999999

# 3. Click "Send OTP"
# 4. Check terminal/logs for OTP (it will show in development)
# 5. Enter OTP and login

# 6. Once logged in, you'll see:
✓ Add Listing (in menu)
✓ My Bookings shows ALL bookings
✓ Can see all spas
```

### Test Spa Owner:

```bash
# First create a spa owner (in MongoDB):
mongosh bookyourspa
db.users.insertOne({
  name: "Test Spa Owner",
  phone: "+919666666666",
  role: "spa_owner",
  bookmarks: [],
  createdAt: new Date()
})

# Then login:
# Go to /login
# Phone: +919666666666
# Name: Test Spa Owner

# After login:
✓ Can see "Add Listing"
✓ Can create spas
✓ My Bookings shows only their spa's bookings
```

### Test Customer:

```bash
# Login with any new number:
# Go to /login
# Phone: +919777777777
# Name: Regular Customer

# After login:
✓ Can book spas
✓ Can search spas
✗ Cannot see "Add Listing"
✗ Cannot access admin features
```

---

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                     │
│                                                          │
│  1. User goes to /login                                 │
│  2. Enters Name + Phone                                 │
│  3. Gets OTP → Enters OTP                              │
│  4. ✅ Logged in as "customer" (default)                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              ADMIN UPGRADES ROLE (MongoDB)              │
│                                                          │
│  db.users.updateOne(                                    │
│    { phone: "+919XXXXXXXXX" },                         │
│    { $set: { role: "spa_owner" } }  ← Change role      │
│  )                                                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  USER LOGS OUT & BACK IN                │
│                                                          │
│  1. User logs out                                       │
│  2. Logs back in with same phone                       │
│  3. JWT token includes new role                        │
│  4. ✅ Now has spa_owner permissions!                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Current Admin Account

**Already created for you:**

```
Name: Dipak Parmar
Phone: +919999999999
Role: admin
```

You can login RIGHT NOW with this number! 🎉

---

## ⚡ Quick Command Cheat Sheet

```bash
# View all users with roles
mongosh bookyourspa --eval "db.users.find({}, {name:1, phone:1, role:1})"

# Make user admin
mongosh bookyourspa --eval 'db.users.updateOne({phone:"+91XXXXXXXXXX"}, {$set:{role:"admin"}})'

# Make user spa owner
mongosh bookyourspa --eval 'db.users.updateOne({phone:"+91XXXXXXXXXX"}, {$set:{role:"spa_owner"}})'

# Make user customer (downgrade)
mongosh bookyourspa --eval 'db.users.updateOne({phone:"+91XXXXXXXXXX"}, {$set:{role:"customer"}})'

# Delete a user
mongosh bookyourspa --eval 'db.users.deleteOne({phone:"+91XXXXXXXXXX"})'
```

---

## 💡 Pro Tips

1. **Always log out and back in** after changing roles in database
2. **Use admin account** (+919999999999) to test admin features
3. **Create test accounts** with different roles for testing
4. **Check role in browser console**: 
   ```javascript
   fetch('/api/auth/me').then(r=>r.json()).then(d=>console.log(d.user.role))
   ```

---

## 🎯 Summary

| Action | How To Do It |
|--------|-------------|
| **Create Customer** | Just register normally via /login |
| **Create Spa Owner** | Register, then update role in MongoDB |
| **Create Admin** | Register, then update role in MongoDB |
| **Change Role** | Update in MongoDB, user logs out/in |
| **Check Role** | MongoDB query or `/api/auth/me` API |

**Remember**: Everyone uses the same login page. Roles determine what they can access! 🚀
