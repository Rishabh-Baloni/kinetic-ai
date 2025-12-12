import Link from "next/link";
import CornerElements from "./CornerElements";
import { Button } from "./ui/button";
import { ArrowRightIcon } from "lucide-react";

const NoFitnessPlan = () => {
  return (
    <div className="relative backdrop-blur-sm border-2 border-border rounded-lg p-10 text-center hover:border-primary/30 transition-all duration-300 shadow-xl hover:shadow-2xl">
      <CornerElements />

      <div className="mb-6">
        <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
          <span className="text-5xl">🏋️</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-4 font-mono">
        <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">No</span> fitness plans yet
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg leading-relaxed">
        Start by creating a personalized fitness and diet plan tailored to your specific goals and
        needs. Get started in just 3 minutes!
      </p>
      <Button
        size="lg"
        asChild
        className="relative overflow-hidden bg-gradient-to-r from-primary to-pink-500 text-primary-foreground px-8 py-6 text-lg font-medium hover:scale-105 transition-transform duration-200 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
      >
        <Link href="/generate-program">
          <span className="relative flex items-center group">
            Create Your First Plan
            <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </Button>
    </div>
  );
};
export default NoFitnessPlan;
