# Quick Fix: AI Insights Not Working on Vercel

## The Problem

AI insights aren't working because the `OPENAI_API_KEY` environment variable is not configured in Vercel.

## The Solution (5 Minutes)

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your **DoctorSim** project
3. Click **Settings** (top navigation bar)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add OpenAI API Key
Click **Add New** and enter:

| Field | Value |
|-------|-------|
| **Key** | `OPENAI_API_KEY` |
| **Value** | Your OpenAI API key (starts with `sk-...`) |
| **Environments** | ✅ Production, ✅ Preview, ✅ Development |

Click **Save**.

### Step 3: Redeploy
You have two options:

**Option A: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Select **Redeploy**
4. ✅ Done!

**Option B: Push a New Commit**
```bash
cd /Users/paramgattupalli/Desktop/DoctorSim
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

### Step 4: Verify It's Working

1. Wait for deployment to complete (~2 minutes)
2. Play a game session on your Vercel app
3. View the results page
4. Look for the **"✨ AI-Generated"** badge at the top

If you see **"📊 Basic Analysis"** badge with a yellow notice, the API key is still not configured properly.

## Check Vercel Logs

To see what's happening:

1. Go to Vercel dashboard → Your project
2. Click **Deployments**
3. Click the latest deployment
4. Click **Functions** tab
5. Find `/api/analyze` in the list
6. Look for these log messages:

**If API key is missing:**
```
⚠️  No AI API key configured, using basic analysis
```

**If API key is working:**
```
🤖 Attempting OpenAI analysis with model: gpt-4o-mini
✅ OpenAI analysis completed successfully
```

## Still Not Working?

### Check Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Verify your API key is:
   - ✅ Active (not revoked)
   - ✅ Has billing set up
   - ✅ Has access to `gpt-4o-mini` model

Test your API key with curl:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 10
  }'
```

If you get an error, your API key needs attention.

### Common Issues

1. **Forgot to redeploy**: Environment variables only take effect after redeploying
2. **Wrong environment**: Make sure the variable is checked for "Production"
3. **Typo in variable name**: Must be exactly `OPENAI_API_KEY`
4. **Invalid API key**: Check that your key is active and has billing enabled
5. **Database connection**: Make sure `DATABASE_URL` is also correctly set

## The Good News

The app is designed to work without an API key! If the API key is missing or fails:
- ✅ App continues to work
- ✅ Automatic fallback to statistical analysis
- ✅ Still provides valuable insights

Basic analysis includes:
- Category performance scores
- Strong areas identification (>70% correct)
- Knowledge gaps identification (<50% correct)
- Hints usage patterns

AI analysis adds:
- More contextual insights
- Personalized recommendations
- Pattern recognition
- Deeper understanding of concepts

## Need More Help?

See [VERCEL_TROUBLESHOOTING.md](./VERCEL_TROUBLESHOOTING.md) for comprehensive troubleshooting steps.

