# Debug: No WhatsApp Message - Step by Step

## 🔍 Let's Find Out Why:

### Question 1: Did you run the SQL in Supabase?
- [ ] Yes, I ran `COPY_THIS_TO_SUPABASE.sql`
- [ ] No, not yet

**If NO:** Please run it first, then test again.

---

### Question 2: After running SQL, what was the result?
Did you see this result?
```
trigger_name: trigger_auto_generate_ticket
event_manipulation: UPDATE
event_object_table: bookings
```

- [ ] Yes, I saw this
- [ ] No, I got an error
- [ ] I'm not sure

**If you got an error:** Tell me the error message

---

### Question 3: Did you create a NEW booking and confirm it?
Important: The trigger only works on bookings created AFTER the trigger is installed.

Steps to test properly:
1. Go to dashboard: https://ceyhun.vercel.app/dashboard/bookings
2. Click "Create New Booking"
3. Fill in details (make sure to add phone number!)
4. Set status = **pending** (not confirmed yet!)
5. Save the booking
6. Then EDIT the booking
7. Change status from **pending** → **confirmed**
8. Save again

- [ ] Yes, I did all these steps
- [ ] No, I tried with an existing booking
- [ ] I created it as confirmed directly

**Important:** Creating directly as "confirmed" might not trigger it. You need to CHANGE status from pending → confirmed.

---

### Question 4: Check n8n Executions

1. Go to: https://skywalkers.app.n8n.cloud
2. Click **"Executions"** in left sidebar
3. Look at the list of executions

**Do you see a NEW execution that appeared when you confirmed the booking?**
- [ ] Yes, I see a new execution
- [ ] No, no new execution appeared

---

## 📊 DIAGNOSIS:

### If NO execution in n8n:
**Problem:** Trigger is not firing or not installed correctly

**Solutions:**
1. Run this SQL to check if trigger exists:
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_generate_ticket';
```

2. If no results, trigger is NOT installed - run `COPY_THIS_TO_SUPABASE.sql` again

3. If trigger exists, try this test:
```sql
-- Update an existing booking to trigger it
UPDATE bookings 
SET status = 'confirmed' 
WHERE status = 'pending' 
LIMIT 1;
```

---

### If YES, execution appeared in n8n:
**Problem:** Trigger fired, but WhatsApp node failed

**Solutions:**
1. Click on that execution in n8n
2. Look for RED nodes (failed nodes)
3. Check specifically the **WhatsApp node** or **Send Message node**
4. Click on it to see error message

**Common errors:**
- "Session not found" → WhatsApp session expired, need to reconnect
- "Invalid number format" → Phone number format issue
- "Connection timeout" → WhatsApp API not responding

---

## 🧪 Quick Test - Manual Trigger

Run this SQL in Supabase to manually trigger a booking:

```sql
-- Find a booking with pending status
SELECT id, customer_name, customer_phone, status, ticket_id 
FROM bookings 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 1;

-- Copy the ID from above, then update it to confirmed:
-- (Replace 'YOUR_BOOKING_ID' with actual ID)
UPDATE bookings 
SET status = 'confirmed' 
WHERE id = 'YOUR_BOOKING_ID';

-- Then immediately check n8n executions!
```

---

## 📞 Tell Me:

Please answer these questions:

1. **Did the trigger install successfully?** (Did you see the verification result?)
   - Answer: _______

2. **Did you create a NEW booking or use an existing one?**
   - Answer: _______

3. **Did an execution appear in n8n?**
   - Answer: _______

4. **If yes, what does the execution show?** (All green? Any red nodes?)
   - Answer: _______

5. **What's your WhatsApp integration?** (Evolution API? Business API? Other?)
   - Answer: _______

---

## 🎯 Most Likely Issues:

### Issue 1: Trigger Not Installed
- **Symptom:** No execution in n8n
- **Fix:** Run `COPY_THIS_TO_SUPABASE.sql` 

### Issue 2: WhatsApp Session Expired
- **Symptom:** Execution in n8n but WhatsApp node is red
- **Fix:** Reconnect WhatsApp, scan QR code again

### Issue 3: Phone Number Format
- **Symptom:** WhatsApp node fails with "invalid number"
- **Fix:** Check phone format in booking (+905364616674 should work)

### Issue 4: Using Old Booking
- **Symptom:** No execution when confirming
- **Fix:** Create NEW booking AFTER trigger installed

---

**Please tell me the answers to the questions above and I'll help you fix it!**
