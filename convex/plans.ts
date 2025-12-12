import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPlan = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    workoutPlan: v.object({
      schedule: v.array(v.string()),
      exercises: v.array(
        v.object({
          day: v.string(),
          routines: v.array(
            v.object({
              name: v.string(),
              sets: v.number(),
              reps: v.number(),
            })
          ),
        })
      ),
    }),
    dietPlan: v.object({
      dailyCalories: v.number(),
      meals: v.array(
        v.object({
          name: v.string(),
          foods: v.array(v.string()),
        })
      ),
    }),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const activePlans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const plan of activePlans) {
      await ctx.db.patch(plan._id, { isActive: false });
    }

    const planId = await ctx.db.insert("plans", args);

    return planId;
  },
});

export const getUserPlans = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return plans;
  },
});

export const deletePlan = mutation({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.planId);
  },
});

export const setActivePlan = mutation({
  args: {
    userId: v.string(),
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    // Deactivate all plans for the user
    const allPlans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    for (const plan of allPlans) {
      await ctx.db.patch(plan._id, { isActive: false });
    }

    // Activate the selected plan
    await ctx.db.patch(args.planId, { isActive: true });
  },
});

export const toggleExerciseCompletion = mutation({
  args: {
    userId: v.string(),
    planId: v.string(),
    day: v.string(),
    exerciseName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already completed
    const existing = await ctx.db
      .query("workoutCompletions")
      .withIndex("by_user_plan", (q) => 
        q.eq("userId", args.userId).eq("planId", args.planId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("day"), args.day),
          q.eq(q.field("exerciseName"), args.exerciseName)
        )
      )
      .first();

    if (existing) {
      // Remove completion
      await ctx.db.delete(existing._id);
      return false;
    } else {
      // Add completion
      await ctx.db.insert("workoutCompletions", {
        userId: args.userId,
        planId: args.planId,
        day: args.day,
        exerciseName: args.exerciseName,
        completedAt: Date.now(),
      });
      return true;
    }
  },
});

export const getWorkoutCompletions = query({
  args: {
    userId: v.string(),
    planId: v.string(),
  },
  handler: async (ctx, args) => {
    const completions = await ctx.db
      .query("workoutCompletions")
      .withIndex("by_user_plan", (q) =>
        q.eq("userId", args.userId).eq("planId", args.planId)
      )
      .collect();

    return completions;
  },
});
