# ✅ MANDATORY Lead Capture - NOW ACTIVE!

## 🎯 What Changed:

Lead saving is now **MANDATORY** and **GUARANTEED** for every meaningful conversation.

## 🚨 New Behavior:

The AI **MUST** use `Save_Lead` tool before ending any conversation where:
- Customer asks about tours (any tour)
- Customer shows interest
- Customer provides any info (name, email, phone)
- Has 2+ message exchanges

## 📊 What Gets Saved:

Every lead saved to Supabase `leads` table includes:

```
✅ Name: "Unknown Visitor" or actual name
✅ Email: null or actual email
✅ Phone: null or actual phone
✅ Interested In: "Paragliding, Boat Tour" (tours discussed)
✅ Stage: browsing | interested | ready
✅ Source: "telegram"
✅ Preferred Date: YYYY-MM-DD or null
✅ Number of People: 2 or null
✅ Notes: "Brief conversation summary"
✅ Created At: Timestamp
```

## 🔥 Critical Changes Made:

### Before:
```
"For EVERY conversation, use Save_Lead tool..."
```
- AI decided when to save
- Could skip if deemed unnecessary
- Lost some potential leads

### After:
```
"🚨 MANDATORY LEAD CAPTURE:
⚡ CRITICAL: After EVERY conversation...
You MUST use Save_Lead tool BEFORE ending conversation!
Even if customer just browses, SAVE THE LEAD!
This is NON-NEGOTIABLE for business tracking."
```
- Explicit mandatory instruction
- Cannot skip
- Saves even browsers
- Guaranteed capture

## 🧪 Testing Instructions:

### Test 1: Quick Browse
```
You: "Hi, how much is paragliding?"
Bot: [responds with price]
You: "Thanks, bye"
Bot: [saves lead as "Unknown Visitor", browsing stage]
```

### Test 2: Interested Customer
```
You: "I'm John, interested in boat tours"
Bot: [responds]
You: "I'll think about it"
Bot: [saves lead as "John", interested stage, toured mentioned]
```

### Test 3: Full Booking
```
You: "I want to book paragliding"
Bot: [collects info]
You: [provides all details]
Bot: [creates booking + saves lead as "ready" stage]
```

## 📈 Check Your Leads:

1. Go to: https://supabase.com/dashboard
2. Select project: **skywalker**
3. Click: **Table Editor** → **leads**
4. See all captured conversations!

## 📊 Lead Stages Explained:

| Stage | Meaning | Example |
|-------|---------|---------|
| **browsing** | Just looking, asking questions | "How much is X?" |
| **interested** | Shows real interest, considering | "I might want to book" |
| **ready** | Completed booking | Actual booking made |

## 🎯 Business Value:

### Now You Can:
- ✅ Track EVERY inquiry
- ✅ Follow up with browsers
- ✅ Convert interested leads
- ✅ Measure conversion rates
- ✅ Build email lists
- ✅ Remarket to prospects
- ✅ Never lose a potential customer

### Example Follow-Up Strategy:
```
After 2 days:
- browsing → "Still interested in [tour]? Special offer!"
- interested → "Ready to book? We saved your dates!"
- ready → "Thanks for booking! Reminder for [date]"
```

## 🔧 Technical Details:

**Tool Name**: `Save_Lead`
**Type**: Supabase Tool
**Operation**: INSERT
**Table**: `leads`
**Trigger**: AI Agent decision (now mandatory)
**Frequency**: Once per conversation
**Connection**: Direct to Supabase via Supabase Tool

## ✅ Verification:

After importing workflow:
1. Import `telegram_working.json`
2. Activate workflow
3. Send test message
4. Check Supabase leads table
5. Should see new row within seconds!

## 🚀 You're All Set!

Every conversation is now captured and stored for future follow-up.

**Next: Import the workflow and start capturing leads!** 💰
