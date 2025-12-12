"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

const GenerateProgramPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    fitnessGoals: "",
    currentFitnessLevel: "",
    injuries: "",
    workoutPreference: "",
    dietaryRestrictions: "",
    allergies: "",
    mealsPerDay: "",
  });

  const { user } = useUser();
  const router = useRouter();

  const questions = [
    {
      question: "What are your fitness goals?",
      placeholder: "e.g., Build muscle, lose weight, improve endurance...",
      field: "fitnessGoals" as keyof typeof formData,
    },
    {
      question: "What is your current fitness level?",
      placeholder: "e.g., Beginner, Intermediate, Advanced...",
      field: "currentFitnessLevel" as keyof typeof formData,
    },
    {
      question: "Do you have any injuries or physical limitations?",
      placeholder: "e.g., Knee pain, back issues, or 'None'",
      field: "injuries" as keyof typeof formData,
    },
    {
      question: "What type of workouts do you prefer?",
      placeholder: "e.g., Gym, Home workouts, Cardio, Strength training...",
      field: "workoutPreference" as keyof typeof formData,
    },
    {
      question: "Do you have any dietary restrictions?",
      placeholder: "e.g., Vegetarian, Vegan, Keto, or 'None'",
      field: "dietaryRestrictions" as keyof typeof formData,
    },
    {
      question: "Do you have any food allergies?",
      placeholder: "e.g., Nuts, Dairy, Gluten, or 'None'",
      field: "allergies" as keyof typeof formData,
    },
    {
      question: "How many meals do you prefer per day?",
      placeholder: "e.g., 3, 4, 5...",
      field: "mealsPerDay" as keyof typeof formData,
    },
  ];

  const handleInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [questions[currentStep].field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      // Call API to generate program
      const response = await fetch("/api/generate-program", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          fullName: user?.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : "There",
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate program");
      }

      // Redirect to profile after successful generation
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error) {
      console.error("Failed to generate program:", error);
      setIsGenerating(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = formData[currentQuestion.field].trim() !== "";

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-3xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono">
            <span>Generate Your </span>
            <span className="text-primary uppercase">Fitness Program</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Answer a few questions to create your personalized fitness plan
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm font-mono font-bold text-primary">
              {Math.round(((currentStep + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-primary via-pink-500 to-primary h-2.5 rounded-full transition-all duration-500 ease-out shadow-lg shadow-primary/50"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {!isGenerating ? (
          <Card className="bg-card/90 backdrop-blur-sm border border-border p-8 mb-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="space-y-6">
              {/* AI Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative size-16 group">
                  <div className="absolute inset-0 bg-primary opacity-10 rounded-full blur-lg animate-pulse group-hover:opacity-20 transition-opacity" />
                  <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border-2 border-border group-hover:border-primary/50 transition-colors overflow-hidden">
                    <img
                      src="/ai-avatar.png"
                      alt="AI Assistant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Kinetic AI</h2>
                  <p className="text-sm text-muted-foreground">Fitness & Diet Coach</p>
                </div>
              </div>

              {/* Question */}
              <div>
                <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{currentQuestion.question}</h3>
                <textarea
                  className="w-full min-h-[120px] p-4 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none hover:border-primary/50"
                  placeholder={currentQuestion.placeholder}
                  value={formData[currentQuestion.field]}
                  onChange={(e) => handleInputChange(e.target.value)}
                />
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-card/90 backdrop-blur-sm border-2 border-primary/30 p-8 mb-8 shadow-2xl shadow-primary/20 animate-in fade-in duration-500">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative size-24">
                <div className="absolute inset-0 bg-primary opacity-30 rounded-full blur-xl animate-pulse" />
                <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border-2 border-primary/50 overflow-hidden animate-spin-slow">
                  <img
                    src="/ai-avatar.png"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Generating Your Program...</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Our AI is creating a personalized fitness and diet plan based on your responses. This will only take a moment!
              </p>
              <div className="flex gap-2 mt-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-primary to-pink-500 rounded-full animate-bounce shadow-lg shadow-primary/50"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        {!isGenerating && (
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-32 hover:scale-105 transition-transform duration-200 disabled:hover:scale-100"
            >
              Back
            </Button>

            {!isLastStep ? (
              <Button onClick={handleNext} disabled={!canProceed} className="w-32 hover:scale-105 transition-transform duration-200 disabled:hover:scale-100 shadow-lg shadow-primary/20">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed}
                className="w-32 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 transition-all duration-200 disabled:hover:scale-100 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40"
              >
                Generate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default GenerateProgramPage;
