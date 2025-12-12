"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import CornerElements from "@/components/CornerElements";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, CalendarIcon, DumbbellIcon, Trash2, CheckCircle2, TrendingUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProfilePage = () => {
  const { user } = useUser();
  const userId = user?.id as string;

  const allPlans = useQuery(api.plans.getUserPlans, { userId });
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const deletePlan = useMutation(api.plans.deletePlan);
  const setActivePlan = useMutation(api.plans.setActivePlan);
  const toggleCompletion = useMutation(api.plans.toggleExerciseCompletion);

  const activePlan = allPlans?.find((plan) => plan.isActive);

  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  const completions = useQuery(
    api.plans.getWorkoutCompletions,
    currentPlan ? { userId, planId: currentPlan._id } : "skip"
  );

  const handleDeletePlan = async () => {
    if (planToDelete) {
      await deletePlan({ planId: planToDelete as any });
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
      if (selectedPlanId === planToDelete) {
        setSelectedPlanId(null);
      }
    }
  };

  const handleSetActivePlan = async (planId: string) => {
    await setActivePlan({ userId, planId: planId as any });
  };

  const handleToggleExercise = async (day: string, exerciseName: string) => {
    if (currentPlan) {
      await toggleCompletion({
        userId,
        planId: currentPlan._id,
        day,
        exerciseName,
      });
    }
  };

  const isExerciseCompleted = (day: string, exerciseName: string) => {
    return completions?.some(
      (c) => c.day === day && c.exerciseName === exerciseName
    );
  };

  const calculateDayCompletion = (day: string) => {
    const dayExercises = currentPlan?.workoutPlan.exercises.find(
      (e) => e.day === day
    );
    if (!dayExercises) return 0;

    const totalExercises = dayExercises.routines.length;
    const completedExercises = dayExercises.routines.filter((routine) =>
      isExerciseCompleted(day, routine.name)
    ).length;

    return Math.round((completedExercises / totalExercises) * 100);
  };

  const calculateOverallCompletion = () => {
    if (!currentPlan) return 0;

    const allExercises = currentPlan.workoutPlan.exercises.flatMap((day) =>
      day.routines.map((routine) => ({ day: day.day, name: routine.name }))
    );

    const completed = allExercises.filter((ex) =>
      isExerciseCompleted(ex.day, ex.name)
    ).length;

    return Math.round((completed / allExercises.length) * 100);
  };

  const calculateStreak = () => {
    if (!completions || completions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completionDates = completions
      .map((c) => {
        const date = new Date(c.completedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .filter((timestamp, index, self) => self.indexOf(timestamp) === index)
      .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = today.getTime();

    for (const timestamp of completionDates) {
      if (timestamp === currentDate) {
        streak++;
        currentDate -= 24 * 60 * 60 * 1000;
      } else if (timestamp < currentDate) {
        break;
      }
    }

    return streak;
  };

  const getTodayDayName = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  };

  const isTodayDay = (dayName: string) => {
    return dayName.toLowerCase() === getTodayDayName().toLowerCase();
  };

  return (
    <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4">
      <ProfileHeader user={user} />

      {allPlans && allPlans?.length > 0 ? (
        <div className="space-y-8">
          {/* PLAN SELECTOR */}
          <div className="relative backdrop-blur-sm border border-border p-6">
            <CornerElements />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">
                <span className="text-primary">Your</span>{" "}
                <span className="text-foreground">Fitness Plans</span>
              </h2>
              <div className="font-mono text-xs text-muted-foreground">
                TOTAL: {allPlans.length}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {allPlans.map((plan) => (
                <div key={plan._id} className="relative group">
                  <Button
                    onClick={() => setSelectedPlanId(plan._id)}
                    className={`text-foreground border hover:text-white ${
                      selectedPlanId === plan._id
                        ? "bg-primary/20 text-primary border-primary"
                        : "bg-transparent border-border hover:border-primary/50"
                    }`}
                  >
                    {plan.name}
                    {plan.isActive && (
                      <span className="ml-2 bg-green-500/20 text-green-500 text-xs px-2 py-0.5 rounded">
                        ACTIVE
                      </span>
                    )}
                  </Button>
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!plan.isActive && (
                      <button
                        onClick={() => handleSetActivePlan(plan._id)}
                        className="bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-white p-1 rounded-full border border-green-500/50 hover:border-green-500 transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-green-500/30"
                        title="Set as Active"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setPlanToDelete(plan._id);
                        setDeleteDialogOpen(true);
                      }}
                      className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-1 rounded-full border border-red-500/50 hover:border-red-500 transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-red-500/30"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PLAN DETAILS */}

          {currentPlan && (
            <div className="relative backdrop-blur-sm border border-border rounded-lg p-6">
              <CornerElements />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50"></div>
                  <h3 className="text-lg font-bold">
                    PLAN: <span className="text-primary">{currentPlan.name}</span>
                  </h3>
                </div>
                
                {/* Progress Stats */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border-2 border-primary/30 hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm text-primary font-bold">
                      {calculateOverallCompletion()}% COMPLETE
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105">
                    <div className="flex items-center gap-2">
                      <span className="text-xl animate-pulse">🔥</span>
                      <span className="font-mono text-lg font-bold text-orange-500">
                        {calculateStreak()}
                      </span>
                    </div>
                    <span className="text-[10px] text-orange-500/70 uppercase tracking-wider font-medium">
                      {calculateStreak() === 1 ? "Day Streak" : "Days in a Row"}
                    </span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="workout" className="w-full">
                <TabsList className="mb-6 w-full grid grid-cols-2 bg-cyber-terminal-bg border-2 p-1">
                  <TabsTrigger
                    value="workout"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <DumbbellIcon className="mr-2 size-4" />
                    Workout Plan
                  </TabsTrigger>

                  <TabsTrigger
                    value="diet"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <AppleIcon className="mr-2 h-4 w-4" />
                    Diet Plan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="workout">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm text-muted-foreground">
                        SCHEDULE: {currentPlan.workoutPlan.schedule.join(", ")}
                      </span>
                    </div>

                    <Accordion type="multiple" className="space-y-4">
                      {currentPlan.workoutPlan.exercises.map((exerciseDay, index) => {
                        const dayCompletion = calculateDayCompletion(exerciseDay.day);
                        
                        return (
                          <AccordionItem
                            key={index}
                            value={exerciseDay.day}
                            className="border-2 rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/10 font-mono transition-all duration-200">
                              <div className="flex justify-between w-full items-center">
                                <div className="flex items-center gap-3">
                                  <span className={isTodayDay(exerciseDay.day) ? "text-primary font-bold" : "text-muted-foreground"}>
                                    {exerciseDay.day}
                                    {isTodayDay(exerciseDay.day) && (
                                      <span className="ml-2 text-xs bg-gradient-to-r from-primary to-pink-500 text-white px-2 py-0.5 rounded-full font-medium shadow-lg shadow-primary/30 animate-pulse">TODAY</span>
                                    )}
                                  </span>
                                  <div className="h-2 w-24 bg-border/50 rounded-full overflow-hidden shadow-inner">
                                    <div
                                      className="h-full bg-gradient-to-r from-primary via-pink-500 to-primary transition-all duration-500 shadow-lg"
                                      style={{ width: `${dayCompletion}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-primary font-mono font-bold">
                                    {dayCompletion}%
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                  {exerciseDay.routines.length} EXERCISES
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="pb-4 px-4">
                              <div className="space-y-3 mt-2">
                                {exerciseDay.routines.map((routine, routineIndex) => {
                                  const isCompleted = isExerciseCompleted(
                                    exerciseDay.day,
                                    routine.name
                                  );

                                  const isDayAccessible = isTodayDay(exerciseDay.day);
                                  
                                  return (
                                    <div
                                      key={routineIndex}
                                      className={`border rounded p-3 transition-all duration-200 ${
                                        isCompleted
                                          ? "border-primary/50 bg-primary/5"
                                          : isDayAccessible
                                          ? "border-border bg-background/50"
                                          : "border-border/50 bg-muted/30 opacity-60"
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <button
                                          onClick={() =>
                                            handleToggleExercise(
                                              exerciseDay.day,
                                              routine.name
                                            )
                                          }
                                          disabled={!isDayAccessible}
                                          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                            isCompleted
                                              ? "bg-primary border-primary shadow-lg shadow-primary/30 scale-110"
                                              : isDayAccessible
                                              ? "border-muted-foreground hover:border-primary hover:scale-110 cursor-pointer hover:shadow-md"
                                              : "border-muted-foreground/30 cursor-not-allowed opacity-50"
                                          }`}
                                        >
                                          {isCompleted && (
                                            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                                          )}
                                        </button>

                                        <div className="flex-1">
                                          <div className="flex justify-between items-start mb-2">
                                            <h4
                                              className={`font-semibold transition-colors ${
                                                isCompleted
                                                  ? "text-primary"
                                                  : isDayAccessible
                                                  ? "text-foreground"
                                                  : "text-muted-foreground"
                                              }`}
                                            >
                                              {routine.name}
                                              {!isDayAccessible && (
                                                <span className="ml-2 text-xs text-muted-foreground/70 font-normal bg-muted/30 px-2 py-0.5 rounded-md">🔒 Available on {exerciseDay.day}</span>
                                              )}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                              <div className="px-2.5 py-1 rounded-md bg-gradient-to-r from-primary/20 to-primary/30 text-primary text-xs font-mono font-bold border border-primary/20 shadow-sm">
                                                {routine.sets} SETS
                                              </div>
                                              <div className="px-2.5 py-1 rounded-md bg-gradient-to-r from-pink-500/20 to-pink-500/30 text-pink-500 text-xs font-mono font-bold border border-pink-500/20 shadow-sm">
                                                {routine.reps} REPS
                                              </div>
                                            </div>
                                          </div>
                                          {routine.description && (
                                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                              {routine.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                </TabsContent>

                <TabsContent value="diet">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-pink-500/10 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                      <span className="font-mono text-sm text-muted-foreground uppercase tracking-wider font-medium">
                        DAILY CALORIE TARGET
                      </span>
                      <div className="font-mono text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                        {currentPlan.dietPlan.dailyCalories} KCAL
                      </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent my-4"></div>

                    <div className="space-y-4">
                      {currentPlan.dietPlan.meals.map((meal, index) => (
                        <div
                          key={index}
                          className="border-2 border-border rounded-lg overflow-hidden p-4 hover:border-primary/30 transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-card/50 to-card/30"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50 animate-pulse"></div>
                            <h4 className="font-mono text-primary font-bold">{meal.name}</h4>
                          </div>
                          <ul className="space-y-2">
                            {meal.foods.map((food, foodIndex) => (
                              <li
                                key={foodIndex}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                              >
                                <span className="text-xs text-primary font-mono font-bold bg-primary/10 px-1.5 py-0.5 rounded group-hover:bg-primary/20 transition-colors">
                                  {String(foodIndex + 1).padStart(2, "0")}
                                </span>
                                <span className="flex-1">{food}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      ) : (
        <NoFitnessPlan />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-border bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Fitness Plan</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this plan? This action cannot be undone.
              All your workout completion data for this plan will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeletePlan}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
export default ProfilePage;
