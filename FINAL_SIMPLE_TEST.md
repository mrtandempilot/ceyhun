# FINAL SIMPLE TEST - Follow Exactly

## ⚠️ IMPORTANT: DON'T copy placeholder text like 'xxx' or 'PASTE_ID_HERE'!

---

## Step 1: Run in Supabase (change phone to yours!)

```sql
INSERT INTO bookings (customer_name, customer_email, customer_phone, tour_name, booking_date, tour_start_time, adults, children, status, total_amount, channel) 
VALUES ('Test Trigger', 'test@test.com', '+905364616674', 'Ölüdeniz Boat Tour', '2025-11-25', '10:00', 2, 0, 'pending', 100.00, 'manual');
```

Click RUN ▶️

---

## Step 2: Get the ID

```sql
SELECT id FROM bookings WHERE customer_name = 'Test Trigger' ORDER BY created_at DESC LIMIT 1;
```

Click RUN ▶️

### You'll see something like:
```
id
----------------------------
abc12345-1234-1234-1234-123456789abc
```

## 👉 COPY THAT ENTIRE ID! (the long text with letters and numbers)

---

## Step 3: Confirm the booking

### Example - If your ID was: `abc12345-1234-1234-1234-123456789abc`

Then run THIS (but with YOUR id):
```sql
UPDATE bookings SET status = 'confirmed' WHERE id = 'abc12345-1234-1234-1234-123456789abc';
```

### ✅ CORRECT Example:
```sql
UPDATE bookings SET status = 'confirmed' WHERE id = '2d81b106-dab9-435a-91f8-ae77aec6ffd7';
```

### ❌ WRONG - Don't do this:
```sql
UPDATE bookings SET status = 'confirmed' WHERE id = 'xxx';
UPDATE bookings SET status = 'confirmed' WHERE id = 'PASTE_ID_HERE';
```

---

## Step 4: Check n8n IMMEDIATELY

1. Go to: https://skywalkers.app.n8n.cloud
2. Click "Executions"  
3. Refresh the page
4. You should see a NEW execution!

---

## Summary:
1. ✅ Run step 1 (creates booking)
2. ✅ Run step 2 (shows you the ID)
3. ✅ COPY the actual ID from step 2
4. ✅ PASTE that ID in step 3 (replacing the example ID)
5. ✅ Run step 3
6. ✅ Check n8n

**The ID is like a long code with letters and numbers. Use THAT in step 3, not the words 'xxx' or 'PASTE_ID_HERE'!**
