# Troubleshooting AI Insights on Vercel

## Issue: AI Insights Not Working in Production

### Most Common Cause: Missing Environment Variables

The AI insights feature requires the `OPENAI_API_KEY` environment variable to be configured in Vercel.

## Quick Fix Steps

### 1. Add Environment Variables to Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project
3. Click on **Settings**
4. Click on **Environment Variables** in the left sidebar
5. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | Your Supabase connection string | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Your NextAuth secret | Production, Preview, Development |
| `NEXTAUTH_URL` | Your production URL (e.g., https://your-app.vercel.app) | Production |
| `NEXTAUTH_URL` | Your preview URL | Preview |
| `NEXTAUTH_URL` | http://localhost:3000 | Development |
| `OPENAI_API_KEY` | Your OpenAI API key | Production, Preview, Development |

**Important:** After adding environment variables, you MUST redeploy your application for the changes to take effect.

### 2. Redeploy Your Application

After adding the environment variables:

1. Go to the **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Select **Redeploy**
4. Wait for the deployment to complete

OR

Simply push a new commit to your repository (Vercel will automatically redeploy).

## Verify Environment Variables Are Set

To check if your environment variables are properly configured, you can add a debug endpoint temporarily:

### Create Debug API Route (Remove after testing)

Create a file: `app/api/debug/env/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasDatabase: !!process.env.DATABASE_URL,
    hasNextAuth: !!process.env.NEXTAUTH_SECRET,
  });
}
```

Then visit: `https://your-app.vercel.app/api/debug/env`

**IMPORTANT:** Delete this file after testing for security reasons!

## Check Vercel Logs for Errors

1. Go to your Vercel dashboard
2. Select your project
3. Click on **Deployments**
4. Click on the latest deployment
5. Click on **Functions** tab
6. Look for any error logs related to `/api/analyze`

Common error messages:
- `"No AI API key configured, using basic analysis"` - API key is missing
- `"OpenAI API error: model_not_found"` - Invalid API key or insufficient permissions
- `"Failed to analyze session"` - Check function logs for detailed error

## Fallback Behavior

The app is designed to gracefully fall back to basic analysis if:
- No OpenAI API key is configured
- The OpenAI API call fails
- The API key is invalid

**Basic analysis provides:**
- Category-based performance scores
- Strong areas (>70% correct)
- Knowledge gaps (<50% correct)
- Hints usage patterns
- Basic recommendations

**AI analysis provides:**
- More detailed, contextual insights
- Personalized recommendations
- Pattern recognition across questions
- Deeper understanding of knowledge gaps

## Testing Locally Before Deploying

1. Ensure your `.env` file has the OpenAI API key:
```bash
OPENAI_API_KEY=sk-...your-key...
```

2. Run the app locally:
```bash
npm run dev
```

3. Play a game session and check if AI insights appear

4. Check the terminal logs for:
```
Attempting OpenAI analysis...
```

If you see `"No AI API key configured, using basic analysis"`, then your local `.env` is not set up correctly.

## Verify OpenAI API Key is Valid

Test your API key with curl:

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

If you get an error, your API key may be:
- Invalid or expired
- Not activated (needs billing set up)
- Not authorized for the `gpt-4o-mini` model

## Database Connection Issues

If responses aren't saving, check:

1. **DATABASE_URL** is correct in Vercel
2. Use the **Direct Connection** string (port 5432) for development
3. Use the **Pooled Connection** string (port 6543) for production
4. Add `?pgbouncer=true&connection_limit=1` for pooled connections

Example production DATABASE_URL:
```
postgresql://user:password@host.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

## Still Having Issues?

Check the browser console (F12) for any errors when viewing results:
- Look for failed API calls to `/api/analyze`
- Check network tab for 500 errors
- Look for authentication errors

If the analysis is being created but not displaying:
- Check that the database has the `AnalysisReport` table
- Verify the analysis is being saved (check Supabase/Prisma Studio)
- Check the results page console for parsing errors

