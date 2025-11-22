# Zello Work Web Integration Setup Guide

## Overview

This integration connects your paragliding dashboard to your existing **Skywalker Zello Work network** (https://skywalker.zellowork.com/). Instead of building custom PTT functionality, we embed the official Zello Work web client directly in your dashboard.

## Features

- **Official Zello Work Integration**: Uses the official web client instead of custom SDK
- **Embedded Interface**: Full Zello Work web interface accessible directly from dashboard
- **Direct Link**: Quick access to open Zello in new tab
- **Skywalker Network**: Pre-configured for your existing network
- **Zero Setup**: No additional configuration needed if you already have the network

## Current Status

✅ **Already Configured**: The integration is set to use `https://skywalker.zellowork.com/` - your existing Zello Work network.

## How It Works

### In the Dashboard

The Zello component appears on the **Bookings Management** page (`/dashboard/bookings`) above the booking tables and provides:

1. **Quick Access**: Direct link to open Zello Work in a new tab
2. **Embedded Option**: Button to embed the full Zello Work web interface directly in the dashboard
3. **Network Info**: Shows which network you're connecting to

### Using Embedded Mode

1. Click **"Embed Here"** button in the Zello component
2. The full Zello Work login interface will appear in an iframe
3. Login with your existing Zello Work credentials
4. Access all channels, including operations communication
5. Click **"Hide"** to collapse the embedded interface

### Using External Mode

1. Click **"Open Zello"** button to open in a new tab
2. Login directly on the official Zello Work site
3. Use all features normally

## For Your Operations

### Communication Channels

Once logged into your Skywalker network, you can:
- **Operations Channel**: Coordinate flight schedules, weather updates, safety briefings
- **Pilot Ground Communication**: Direct voice contact with pilots during flights
- **Emergency Alerts**: Priority communication for critical situations
- **Weather Updates**: Real-time condition broadcasts

### Usage Scenarios

- **Flight Coordination**: "Pilot to base - on final approach"
- **Weather Alerts**: "Winds picking up at 2000ft, suspend tandem flights"
- **Passenger Updates**: "Flight delayed 15 minutes, stronger winds"
- **Safety Coordination**: "Emergency in sector 3, dispatch team now"

## Technical Details

### Integration Method
- **No SDK Required**: Uses iframe embedding instead of API integration
- **Official Web Client**: https://skywalker.zellowork.com/ (your network)
- **Environment Variable**: `NEXT_PUBLIC_ZELLO_WEB_URL=https://skywalker.zellowork.com/`
- **Permission Requirements**: Microphone access granted through browser

### Security & Privacy
- **End-to-End Encryption**: All voice communication encrypted by Zello
- **Authentication**: Uses your existing Zello Work account system
- **No Data Storage**: App doesn't store any Zello credentials or data
- **Secure iframe**: Proper CSP and content isolation

## Updating the Network URL

If you change your Zello Work network URL in the future:

1. Update `.env.local`:
```bash
NEXT_PUBLIC_ZELLO_WEB_URL=https://your-new-network.zellowork.com/
```

2. Restart the development server
3. The component will automatically use the new URL

## Troubleshooting

### Embedded Interface Issues
- **Loading Problems**: Some browsers block cross-origin iframes - use "Open Zello" external link
- **Permission Denied**: Grant microphone permission when prompted
- **Size Issues**: Embedded iframe is 600px height - can be adjusted in component

### Network Connection
- **Can't Access**: Verify your Zello Work account has permission for the Skywalker network
- **Login Fails**: Reset password through Zello Work admin if needed
- **Channel Missing**: Contact network admin to add you to operations channels

### Browser Compatibility
- **Chrome/Edge**: Full support with microphone permissions
- **Firefox/Safari**: May have iframe restrictions - use external links
- **Mobile**: Limited iframe support - use dedicated Zello apps

## Support

### For Zello Work Account Issues
- **Password Reset**: Use Zello Work admin panel
- **User Management**: Contact your Zello Work network administrator
- **Billing/Support**: https://zellyoo.com/zellowork/support

### For Integration Issues
- **Component Not Showing**: Check browser console for JavaScript errors
- **Environment Variables**: Verify `NEXT_PUBLIC_ZELLO_WEB_URL` is set correctly
- **Build Issues**: Ensure component file compiles without TypeScript errors

---

**Ready to Use**: Your Skywalker Zello Work network integration is active and ready for use. Just click "Open Zello" or "Embed Here" in the bookings dashboard to start communicating!
