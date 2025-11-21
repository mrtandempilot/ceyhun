# Email Setup for Oludeniz Tours 🚀

## ⚙️ Production Email Configuration (Recommended: SendGrid)

For production, **SendGrid** is recommended over Gmail for better reliability and higher sending limits:

### 1. Sign Up for SendGrid
- Go to [SendGrid](https://sendgrid.com) and create a free account
- Verify your email and set up single sender
- Get your API key from Settings > API Keys

### 2. Configure Environment Variables
Update your production environment variables:

```env
# SendGrid SMTP (Production Recommended)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key-here
FROM_EMAIL=bookings@yourdomain.com

# OR Gmail SMTP (Development/Testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=noreply@oludeniztours.com
```

## 🔐 Gmail App Password Setup

### 1. Enable 2-Factor Authentication
Go to [Google Account Settings](https://myaccount.google.com/security)
- Enable 2-Step Verification

### 2. Generate App Password
- Go to [App Passwords](https://support.google.com/accounts/answer/185833)
- Generate a new app password
- Copy the 16-character password (ignore spaces)

## 📧 Test Your Email Setup

### Using curl:

```bash
# Simple test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@your-email.com","type":"test"}'

# Booking notification test
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@your-email.com","type":"booking"}'

# Customer confirmation test
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@your-email.com","type":"confirmation"}'
```

### Available Test Types:
- `test` - Basic email functionality test
- `booking` - Admin booking notification
- `confirmation` - Customer booking confirmation

## 🔄 Email Flow

### Sending Emails (Outgoing):
1. Your web app sends booking confirmations to customers
2. Admin receives notifications for new bookings
3. Automatic email templates are used

### Receiving Emails (Incoming):
1. Go to `/dashboard/mail` to view incoming emails
2. Set up email forwarding from your Gmail account
3. Customer inquiries appear in your dashboard automatically

## 📋 Current Email Features

✅ **Outgoing Emails:**
- Booking confirmations to customers
- Admin notifications for new bookings
- Payment confirmations
- Cancellation notifications
- Professional HTML templates

✅ **Incoming Emails:**
- Customer inquiries via `/dashboard/mail`
- Email filtering and search
- Read/unread status
- Auto-forwarding rules
- Spam management

## 🧪 Testing Checklist

1. ✅ Update `.env.local` with your Gmail credentials
2. ✅ Test email sending with `/api/test-email`
3. ✅ Check email inbox at `/dashboard/mail`
4. ✅ Set up Gmail forwarding (optional for receiving emails)
5. ✅ Verify booking email templates work

## 📈 Production Usage

**Gmail Daily Limits:**
- Personal Gmail: ~500 emails/day
- Workspace/G Suite: 500-5000 emails/day depending on plan

**For Higher Volumes:**
Consider upgrading to SendGrid or Amazon SES when you exceed these limits.

## 🔧 Troubleshooting

**Email Not Sending:**
```bash
# Check server logs for SMTP errors
npm run dev
```

**Gmail Security Settings:**
- Enable "Less secure app access" OR
- Generate app password as described above

**Emails Going to Spam:**
- Check your Gmail sender reputation
- Add SPF/DKIM records (for production domains)
- Use consistent sending patterns

## 🚀 Production Deployment to Vercel

### Step 1: Create GitHub Repository
```bash
git init
git add .
git commit -m "Complete paragliding app with email system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up/login
2. Click "Import Git Repository"
3. Connect your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables in Vercel
In the Vercel dashboard → Project Settings → Environment Variables:

```env
# Production Database
NEXT_PUBLIC_SUPABASE_URL=https://your-production-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# SendGrid Production Email (Recommended)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
FROM_EMAIL=bookings@yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### Step 4: Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain (e.g., oludeniztours.com)
- Configure DNS settings

### Step 5: DNS Configuration for Email
For proper email deliverability, set up SPF/DKIM:

```
Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com include:sendgrid.net ~all"

Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com"
```

## 📊 Production Email Limits Comparison

| Service | Free Plan | Paid Starting |
|---------|-----------|---------------|
| SendGrid | 100 emails/day | $19.95/month (50k emails) |
| Gmail | 500 emails/day | Upgrade to G Suite |
| Mailgun | 5,000 emails/month | $35/month (50k emails) |
| Amazon SES | 62,000 emails/month * | $0.10 per 1,000 emails |

\*) SES has free tier that expires after 1 year

## 🔄 Production Email Flow

1. **Customer Books Tour** → Instant email confirmation sent
2. **Admin Gets Notification** → New booking alert in dashboard
3. **Customer Emails Back** → Appears in admin mail inbox
4. **24/7 Availability** → Email system handles inquiries

## 📞 Support

🎉 **Email system successfully configured for production!**
- Ready for Vercel deployment
- Professional email templates included
- SendGrid integration recommended
- Full inbox management setup

Your paragliding business is now online with professional email communication!
