import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      fullName,
      fitnessGoals,
      currentFitnessLevel,
      injuries,
      workoutPreference,
      dietaryRestrictions,
      allergies,
      mealsPerDay,
    } = body;

    // Generate prompt for Gemini
    const prompt = `You are a professional fitness and diet coach. Create a personalized fitness program for ${fullName}.

User Information:
- Fitness Goals: ${fitnessGoals}
- Current Fitness Level: ${currentFitnessLevel}
- Injuries/Limitations: ${injuries}
- Workout Preference: ${workoutPreference}
- Dietary Restrictions: ${dietaryRestrictions}
- Allergies: ${allergies}
- Meals Per Day: ${mealsPerDay}

Please generate a comprehensive fitness program that includes:

1. A weekly workout plan with specific exercises, sets, and reps for each day
2. A daily meal plan with specific foods for each meal

Format your response as JSON with this exact structure:
{
  "workoutPlan": {
    "schedule": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "exercises": [
      {
        "day": "Monday",
        "routines": [
          {
            "name": "Exercise name",
            "sets": number,
            "reps": number
          }
        ]
      }
    ]
  },
  "dietPlan": {
    "dailyCalories": number,
    "meals": [
      {
        "name": "Breakfast",
        "foods": ["food1", "food2"]
      }
    ]
  }
}

Make sure the workout plan accounts for injuries and fitness level, and the diet plan respects dietary restrictions and allergies. Only return the JSON, no additional text.`;

    // Call Groq AI using OpenAI-compatible API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Fast and capable model
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error("Groq API error:", errorData);
      throw new Error(`Groq API error: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const text = groqData.choices[0].message.content;

    // Parse the JSON response
    let programData;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      programData = JSON.parse(cleanText);
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      console.log("Response text:", text);
      throw new Error("Failed to parse AI response");
    }

    // Save to Convex
    const planId = await convex.mutation(api.plans.createPlan, {
      userId,
      name: `${fullName}'s Fitness Program`,
      workoutPlan: programData.workoutPlan,
      dietPlan: programData.dietPlan,
      isActive: true,
    });

    return Response.json({ success: true, planId });
  } catch (error) {
    console.error("Error generating program:", error);
    return Response.json(
      { error: "Failed to generate program" },
      { status: 500 }
    );
  }
}
