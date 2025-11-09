# Healthcare Education Game - DoctorSim

An interactive 8-bit style educational game where patients learn about healthcare concepts while waiting in the doctor's office. Players act as doctors responding to patient questions about health, insurance, and medical care.

## Features

- 🎮 **8-bit Pokemon-style Graphics** - Retro pixel art aesthetic with animated characters
- 🏥 **Healthcare Education** - Learn about preventive care, insurance, medications, and more
- 💡 **Hint System** - Clickable notepad on desk for helpful hints
- 📊 **AI-Powered Analysis** - Personalized knowledge gap identification
- 👨‍⚕️ **Admin Panel** - Comprehensive analytics and question management
- 📱 **Mobile-First Design** - Responsive web app optimized for tablets and phones
- ⚡ **Real-time Feedback** - Instant explanations and progress tracking

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS v4
- **Animation**: Framer Motion for smooth sprite-based movements
- **State Management**: Zustand
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access
- **AI**: OpenAI GPT-4 or Anthropic Claude for analysis
- **Charts**: Recharts for analytics visualization

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Quick Start

1. **Clone and install:**
```bash
git clone <repository-url>
cd DoctorSim
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

3. **Set up the database:**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

**Demo Logins:**

Patient Account:
- Email: `patient@example.com`
- Password: `patient123`

Admin Account:
- Email: `admin@doctorsim.com`
- Password: `admin123`

### Admin Panel

Admins have access to a comprehensive dashboard with user analytics, question management, and data export features.

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for detailed admin panel documentation.

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── game/              # Game interface
│   ├── admin/             # Admin panel
│   └── dashboard/         # User dashboard
├── components/            # React components
│   ├── game/             # Game-specific components
│   ├── admin/            # Admin components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # Auth utilities
│   ├── ai.ts             # AI integration
│   ├── animations.ts     # Framer Motion variants
│   └── hints.ts          # Hint system logic
├── prisma/               # Database schema
└── public/               # Static assets
    └── assets/           # Game assets (sprites, sounds)
```

## Game Flow

1. **Login/Register** - Players create an account or log in
2. **Game Start** - Seated at doctor's desk with patients in waiting room
3. **Patient Interaction** - Animated patient approaches with health question
4. **Answer Selection** - Choose from multiple-choice options
5. **Hint Option** - Click notepad for contextual hints (limited per session)
6. **Feedback** - Immediate explanation of correct/incorrect answers
7. **Session Complete** - AI analysis of knowledge gaps and recommendations

## User Roles

- **Patient**: Play the game, view personal progress
- **Physician**: View patient knowledge profiles and pre-visit forms
- **Admin**: Manage questions, view analytics, export data

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js sessions
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: For AI analysis
- `GOOGLE_CLIENT_ID/SECRET`: Optional OAuth integration

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linter
npm run lint

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

## Deployment

The app is designed to be deployed on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

Database can be hosted on:
- Vercel Postgres
- Supabase
- Railway
- Any PostgreSQL provider

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open a GitHub issue or contact the development team.
