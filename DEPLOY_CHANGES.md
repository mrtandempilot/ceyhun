# Deploy Changes to Vercel

## 🚨 Issue
The phone number field and fixes are only on your local computer.  
They need to be deployed to Vercel to work on the live website.

---

## 🚀 Quick Deploy (Choose One Method)

### Method 1: Using Git (Recommended)

```bash
# Open terminal/command prompt in your project folder
cd c:\Users\mrtan\OneDrive\Desktop\paraglidingwebapp

# Add all changes
git add .

# Commit changes
git commit -m "Add phone field and automatic ticket generation"

# Push to GitHub
git push origin main
```

**After pushing:**
- Vercel will automatically detect the changes
- It will deploy in 1-2 minutes
- Check: https://ceyhun.vercel.app

---

### Method 2: Manual Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

### Method 3: Vercel Dashboard (Manual)

1. Go to: https://vercel.com/dashboard
2. Find your project: ceyhun
3. Click "Deployments"
4. Click "Redeploy" on latest deployment
5. Select "Use existing Build Cache" → Deploy

---

## ✅ After Deployment

### Verify Changes Live:

1. **Go to:** https://ceyhun.vercel.app/book
2. **Check:** Phone number field appears (required)
3. **Create test booking** with your phone
4. **Check dashboard:** Phone number shows in booking list

---

## 📋 Changed Files to Deploy:

These files have been updated locally:
- ✅ `components/BookingForm.tsx` - Added phone field
- ✅ `types/booking.ts` - Added customer_phone type
- ✅ `app/api/bookings/route.ts` - Saves phone to database
- ✅ `database/` - SQL scripts (run manually in Supabase)
- ✅ `docs/` - Documentation

---

## 🎯 Complete Deployment Checklist:

### On Your Computer (Local):
- [x] Phone field added to form
- [x] API updated to save phone
- [x] Types updated
- [x] SQL scripts created

### Deploy to Vercel:
- [ ] Git push (or manual deploy)
- [ ] Wait for deployment (1-2 min)
- [ ] Verify site live

### In Supabase (Manual):
- [ ] Run: `VERIFY_BEFORE_CLEAN.sql`
- [ ] Run: `CLEAN_ALL_DATA_KEEP_ADMIN.sql`
- [ ] Run: `AUTO_TICKET_GENERATION.sql`

### In n8n:
- [ ] Activate workflow (toggle ON)
- [ ] Verify webhook URL

---

## 🔍 Check Deployment Status

After git push, check:
- GitHub: https://github.com/mrtandempilot/ceyhun/actions
- Vercel: https://vercel.com/mrtandempilots-projects/ceyhun

---

## ⚡ Quick Command (All-in-One)

```bash
cd c:\Users\mrtan\OneDrive\Desktop\paraglidingwebapp
git add .
git commit -m "Add phone field and auto tickets"
git push origin main
```

Then wait 2 minutes and check: https://ceyhun.vercel.app/book

---

**Status:** Ready to deploy! 🚀
