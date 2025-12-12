<h1 align="center">💪 Kinetic AI - Your Personal Trainer 🤖</h1>

![Demo App](/public/screenshot-for-readme.png)

<p align="center">
  An AI-powered fitness application that generates personalized workout and diet plans based on your goals, fitness level, and preferences.
</p>

## Highlights:

- 🚀 Tech stack: Next.js 15, React 19, TypeScript, Tailwind CSS 4 & Shadcn UI
- 📝 Interactive Questionnaire Form
- 🧠 LLM Integration (Groq AI - Llama 3.3 70B)
- 🏋️ Personalized Workout Plans
- 🥗 Custom Diet Programs
- ✅ Daily Workout Tracker
- 🔥 Streak Counter
- 📅 Day-Specific Exercise Completion
- 🔒 Authentication & Authorization (Clerk)
- 💾 Real-time Database (Convex)
- 🎯 Program Management (Create, Delete, Activate)
- 🎨 Modern Purple/Pink Gradient Theme

## Features

- **7-Step Questionnaire**: Answer fitness-related questions to generate your perfect program
- **Personalized Workout Plans**: Custom exercise routines based on fitness level, injuries, equipment, and goals
- **Diet Recommendations**: Tailored meal plans accounting for allergies, dietary restrictions, and calorie targets
- **Workout Completion Tracking**: Check off exercises as you complete them with visual progress bars
- **Streak System**: Track consecutive workout days to stay motivated
- **Day-Specific Restrictions**: Only access today's workout to maintain consistency
- **Program Management**: Create multiple programs, set active plan, delete old plans
- **User Authentication**: Secure sign-in with GitHub, Google, or email/password
- **Responsive Design**: Beautiful gradient UI that works seamlessly across all devices

## Setup .env file

```js
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Groq AI (Free tier with 30 req/min)
GROQ_API_KEY=

# Convex Database
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

## Getting Started

1. Clone the repository
2. Install dependencies:

```shell
npm install
```

3. Set up your environment variables as shown above
4. Run the development server:

```shell
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application can be easily deployed to Vercel:

```shell
npm run build
npm run start
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Technologies Used

- **Next.js 15**: React framework with App Router and Server Components
- **React 19**: Latest React features and optimizations
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4 & Shadcn UI**: Modern styling and reusable UI components
- **Clerk**: Authentication and user management
- **Groq AI**: Fast LLM inference with Llama 3.3 70B model
- **Convex**: Real-time serverless database with live queries

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Groq Documentation](https://groq.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Author

Built by [Rishabh Baloni](https://portfolio-three-azure-83.vercel.app/)

## License

This project is licensed under the [MIT LICENSE](LICENSE)
