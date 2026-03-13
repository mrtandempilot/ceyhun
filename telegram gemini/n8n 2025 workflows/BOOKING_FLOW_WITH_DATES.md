# 📅 Booking Flow with Calculated Dates

## Your Request:

When customer says "tomorrow", the bot should display the actual calculated date in the question.

## Example Format You Want:

```
Mükemmel! Rezervasyon için gerekli bilgilere ihtiyacım var:

1. Adınız Soyadınız:
2. E-posta Adresiniz:
3. Telefon Numaranız: (Lütfen ülke kodu ile birlikte, örneğin +90 5xx xxx xx xx)
4. Tarih: Yarın için, yani 2025-12-17
5. Saat:
6. Yetişkin Sayısı:
7. Çocuk Sayısı:
8. Otel: (Otelinizden alınmak mı istersiniz, yoksa ofiste buluşalım mı?)
```

## How This Works:

When customer says "yarın" or "tomorrow", the AI should:

1. Calculate: Today (2025-12-16) + 1 day = 2025-12-17
2. Show in response: "Tarih: Yarın için, yani 2025-12-17"

## Current Implementation:

The bot **already has** today and tomorrow's dates available:

```
📅 Today's Date: {{ $now.format('YYYY-MM-DD') }}
Tomorrow: {{ $now.plus({ days: 1 }).format('YYYY-MM-DD') }}
```

So when bot starts, it knows:
- Today = 2025-12-16
- Tomorrow = 2025-12-17

## What AI Should Do:

### English Example:
```
Customer: "I want to book paragliding for tomorrow"

Bot: "Perfect! Let me collect your details:

1. Full Name:
2. Email Address:
3. Phone Number: (Please include country code, e.g., +90 5xx xxx xx xx)
4. Date: Tomorrow, which is 2025-12-17
5. Time:
6. Number of Adults:
7. Number of Children:
8. Hotel: (Pickup from hotel or meet at office?)

Please provide these details!"
```

### Turkish Example:
```
Customer: "Yarın için yamaç paraşütü rezervasyon yapmak istiyorum"

Bot: "Mükemmel! Rezervasyon için gerekli bilgilere ihtiyacım var:

1. Adınız Soyadınız:
2. E-posta Adresiniz:
3. Telefon Numaranız: (Lütfen ülke kodu ile birlikte, örneğin +90 5xx xxx xx xx)
4. Tarih: Yarın için, yani 2025-12-17
5. Saat:
6. Yetişkin Sayısı:
7. Çocuk Sayısı:
8. Otelinizden alınmak mı istersiniz, yoksa ofiste buluşalım mı?

Lütfen bu bilgileri paylaşır mısınız!"
```

## Updated Instruction for AI:

Add to booking flow in system prompt:

```
📋 BOOKING FLOW - DETAILED:

When customer wants to book:

1. Show enthusiasm: "Mükemmel!" or "Perfect choice!"

2. If customer mentioned a date, CONFIRM THE CALCULATED DATE:
   - Customer says "tomorrow" → Show: "Yarın için, yani [YYYY-MM-DD]"
   - Customer says "next Monday" → Calculate and show: "Pazartesi için, yani [YYYY-MM-DD]"
   - Customer says specific date → Confirm: "[Date they said]"

3. Ask for details in numbered list format:

TURKISH:
"Mükemmel! Rezervasyon için gerekli bilgilere ihtiyacım var:

1. Adınız Soyadınız:
2. E-posta Adresiniz:
3. Telefon Numaranız: (Lütfen ülke kodu ile birlikte, örneğin +90 5xx xxx xx xx)
4. Tarih: [If they said tomorrow: Yarın için, yani 2025-12-17]
5. Saat: (Hangi saat dilimini tercih edersiniz?)
6. Yetişkin Sayısı:
7. Çocuk Sayısı:
8. Otelinizden alınmak mı istersiniz, yoksa ofiste buluşalım mı?

Lütfen bu bilgileri paylaşır mısınız!"

ENGLISH:
"Perfect! I need to collect your booking details:

1. Full Name:
2. Email Address:
3. Phone Number: (Please include country code, e.g., +90 5xx xxx xx xx)
4. Date: [If they said tomorrow: Tomorrow, which is 2025-12-17]
5. Time: (What time works best for you?)
6. Number of Adults:
7. Number of Children:
8. Hotel: (Pickup from hotel or meet at office?)

Please share these details!"
```

## Key Points:

✅ Bot knows today's date: 2025-12-16
✅ Bot knows tomorrow's date: 2025-12-17
✅ When customer says "tomorrow", bot shows: "Yarın için, yani 2025-12-17"
✅ When customer says "next week", bot calculates and shows: "Gelecek hafta için, yani 2025-12-23"

## Implementation:

The AI is smart enough (Gemini 2.5 Flash) to:
1. Understand "tomorrow" = today + 1 day
2. Calculate the actual date
3. Show it in the format you want

Just needs clear instruction in the system prompt to ALWAYS show the calculated date when asking for booking details.

## Example Conversations:

### Scenario 1:
```
Customer: "Tomorrow paragliding"
Bot: "Awesome! That's for tomorrow, December 17, 2025. Let me get your details:
1. Full Name:
2. Email:
3. Phone (+90):
4. Date: Tomorrow (2025-12-17) ✅
5. Time:
..."
```

### Scenario 2:
```
Müşteri: "3 gün sonra rezervasyon"
Bot: "Harika! 3 gün sonra, yani 19 Aralık 2025 için. Bilgilerinizi alalım:
1. Adınız Soyadınız:
2. E-posta:
3. Telefon (+90):
4. Tarih: 3 gün sonra (2025-12-19) ✅
5. Saat:
..."
```

This makes it crystal clear to the customer what date they're booking for! 📅✅
