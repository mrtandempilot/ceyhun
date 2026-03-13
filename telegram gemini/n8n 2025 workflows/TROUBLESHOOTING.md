# 🔧 Troubleshooting: Bot Not Responding After Welcome

## Problem: Bot sends welcome message but then stops responding

### Common Causes & Solutions:

## 1. ✅ Workflow Not Active
**Solution:**
- Open n8n
- Open the workflow
- Click the toggle at top right to **Activate** the workflow
- Should say "Active" in green

## 2. ✅ Webhook Not Registered
**Solution:**
- Go to Telegram Trigger node
- Click "Test workflow" or "Execute workflow"
- This registers the webhook with Telegram
- Try messaging bot again

## 3. ✅ Execution Settings
**Solution:**
- Click workflow "Settings" (gear icon)
- Execution Order: **v1** (should already be set)
- Save if changed

## 4. ✅ n8n Running Mode
**Problem:** Running in "Manual" mode instead of "Webhook" mode

**Solution:**
- Make sure n8n is running as a service (not just test mode)
- Restart n8n if needed

## 5. ✅ Multiple Workflows
**Problem:** Multiple workflows listening to same bot

**Solution:**
- Deactivate other Skywalkers workflows
- Only keep ONE workflow active at a time

## 6. ✅ Telegram Bot Token
**Solution:**
- Check Telegram API credentials are correct
- Test with: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe
- Should return bot info

## 7. ✅ AI Agent Timeout
**Problem:** AI taking too long to respond

**Solution:**
- Check OpenRouter credits
- Check Gemini 2.5 Flash is available
- Try with lower temperature (0.7 instead of 0.9)

## 🧪 Quick Test:

1. **Deactivate ALL workflows**
2. **Activate ONLY telegram_with_pictures.json**
3. **Click "Test workflow"** in n8n
4. **Message your bot: "Hi"**
5. **Wait 5-10 seconds**
6. **Check n8n Executions tab** - see if workflow ran

## 📊 Check Execution Log:

In n8n:
1. Click "Executions" tab (left sidebar)
2. Find latest execution
3. Click to see details
4. Look for errors in red

**Common errors:**
- "Agent failed" → Check AI credentials
- "Chat ID not found" → Workflow structure issue
- "Timeout" → OpenRouter or network issue

## 🔄 Fresh Start Method:

1. **Stop n8n** (if self-hosted)
2. **Delete all Skywalkers workflows**
3. **Import telegram_with_pictures.json**
4. **Set credentials** (Telegram, OpenRouter, Supabase)
5. **Activate workflow**
6. **Test workflow** (click button in n8n)
7. **Message bot**

## 💡 Simple Test Workflow

If still not working, try this minimal test:

**Create new workflow:**
1. Telegram Trigger
2. Send Message node → Send "I received: {{$json.message.text}}"

If THIS works → Problem is with AI Agent
If THIS fails → Problem is with Telegram connection

## 🆘 If Nothing Works:

**Check:**
- n8n version (should be recent)
- Telegram bot is not blocked
- Internet connection stable
- OpenRouter API has credits
- Supabase project is running

**Try:**
- Use telegram_corrected.json instead (simpler, no pictures)
- Restart n8n completely
- Check n8n logs for errors

## 📞 Need More Help?

Share execution logs from n8n → I can diagnose the exact issue!
