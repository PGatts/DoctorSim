# Deployment Guide - DoctorSim Healthcare Education Game

## Prerequisites

Before deploying, ensure you have:
- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Vercel Postgres, Supabase, or Railway)
- OpenAI or Anthropic API key (optional, for AI analysis)

## Local Development Setup

### 1. Database Setup

First, set up your local PostgreSQL database:

```bash
# Install PostgreSQL locally or use Docker
docker run --name doctorsim-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Or use a cloud provider for development
# Recommended: Supabase (free tier with 500MB)
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example
cp .env.example .env
```

Update `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# AI (Optional - fallback to basic analysis if not provided)
OPENAI_API_KEY="sk-..."
# OR
ANTHROPIC_API_KEY="sk-ant-..."

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Migration & Seeding

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npm run db:push

# Seed with sample questions
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

**Demo Credentials:**
- Patient: `patient@example.com` / `patient123`
- Admin: `admin@doctorsim.com` / `admin123`

## Production Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit - DoctorSim healthcare game"
git push origin main
```

### Step 2: Set Up Database

#### Option A: Vercel Postgres

1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string

#### Option B: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy the connection string (Transaction mode)

#### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create new PostgreSQL database
3. Copy the connection string

### Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Click "Add New Project"**

3. **Import your GitHub repository**

4. **Configure Environment Variables:**

   Add these in the Environment Variables section:

   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
   NEXTAUTH_URL=https://your-app.vercel.app
   OPENAI_API_KEY=<your-key> (optional)
   ANTHROPIC_API_KEY=<your-key> (optional)
   GOOGLE_CLIENT_ID=<your-id> (optional)
   GOOGLE_CLIENT_SECRET=<your-secret> (optional)
   ```

5. **Deploy**

   Click "Deploy" and wait for build to complete.

### Step 4: Set Up Database in Production

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migration
vercel env pull .env.production
DATABASE_URL="..." npx prisma db push

# Seed database
DATABASE_URL="..." npm run db:seed
```

Alternatively, use Prisma Studio:

```bash
# Open Prisma Studio connected to production
DATABASE_URL="your-production-url" npx prisma studio
```

### Step 5: Configure Domain (Optional)

1. Go to your Vercel project settings
2. Domains section
3. Add custom domain
4. Update DNS records as instructed

## Post-Deployment Configuration

### 1. Update NextAuth URL

After getting your Vercel URL, update:
```bash
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

### 2. Google OAuth Setup (Optional)

If using Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
4. Update environment variables in Vercel

### 3. Test the Application

- ✅ Landing page loads
- ✅ Registration works
- ✅ Login works
- ✅ Game loads with questions
- ✅ Responses are saved
- ✅ Results page shows analysis
- ✅ Dashboard displays correctly

## Monitoring & Maintenance

### Check Logs

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

### Database Management

```bash
# Open Prisma Studio
npx prisma studio

# Create migration (when schema changes)
npx prisma migrate dev --name description

# Apply migration to production
npx prisma migrate deploy
```

### Adding More Questions

```bash
# Option 1: Use Prisma Studio GUI
npx prisma studio

# Option 2: Create a new seed file
# Edit prisma/seed.ts and run:
npm run db:seed
```

### Performance Optimization

1. **Enable Vercel Analytics** (free):
   - Go to project settings
   - Enable Web Analytics

2. **Add Caching Headers:**
   ```typescript
   // In API routes
   export const revalidate = 3600; // 1 hour
   ```

3. **Database Connection Pooling:**
   - Use Prisma Data Proxy or PgBouncer for better connection management

## Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel
# Common issues:
# 1. Missing environment variables
# 2. TypeScript errors
# 3. Missing dependencies

# Test build locally:
npm run build
```

### Database Connection Issues

```bash
# Test connection string format
# PostgreSQL format:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# Add SSL for production:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require
```

### Authentication Issues

```bash
# Check:
# 1. NEXTAUTH_SECRET is set
# 2. NEXTAUTH_URL matches your domain
# 3. Database has User, Account, Session tables
```

### AI Analysis Not Working

```bash
# Falls back to basic analysis if API keys not provided
# Check:
# 1. OPENAI_API_KEY or ANTHROPIC_API_KEY is set
# 2. API key has sufficient credits
# 3. Check Vercel function logs for errors
```

## Security Checklist

- [ ] Change default NEXTAUTH_SECRET
- [ ] Use strong database password
- [ ] Enable SSL for database connections
- [ ] Restrict database access to Vercel IPs
- [ ] Never commit .env file to git
- [ ] Keep API keys secure
- [ ] Enable CORS protection
- [ ] Set up rate limiting (Vercel free tier has built-in protection)

## Scaling Considerations

### Free Tier Limits
- Vercel: 100GB bandwidth, 100K function invocations/month
- Supabase: 500MB database, 2GB bandwidth
- Railway: $5 credit/month

### Upgrading
When you exceed free tier:
1. Vercel Pro ($20/month)
2. Supabase Pro ($25/month) 
3. Dedicated PostgreSQL (Railway, Digital Ocean)

## Support

For issues or questions:
- Check logs: `vercel logs`
- Review Prisma docs: [prisma.io/docs](https://prisma.io/docs)
- NextAuth docs: [next-auth.js.org](https://next-auth.js.org)

## Quick Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run linter

# Database
npm run db:push            # Push schema to DB
npm run db:seed            # Seed database
npm run db:studio          # Open Prisma Studio
npx prisma migrate dev     # Create migration
npx prisma migrate deploy  # Apply migrations

# Deployment
vercel                     # Deploy to preview
vercel --prod              # Deploy to production
vercel logs                # View logs
```

## Success!

Your DoctorSim healthcare education game should now be live! 🎉

Share the URL with your users and start helping patients learn about healthcare!

