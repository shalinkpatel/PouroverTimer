import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimer } from "@/lib/timer";
import { type Recipe } from "@shared/schema";
import { getTargetWeight } from "@/lib/utils";

interface TimerDisplayProps {
  recipe: Recipe;
  onTimeUpdate: (time: number) => void;
  scale?: number;
}

export default function TimerDisplay({ recipe, onTimeUpdate, scale = 1 }: TimerDisplayProps) {
  const { time, isRunning, start, pause, reset } = useTimer();

  // Update parent with current time
  useEffect(() => {
    onTimeUpdate(time);
  }, [time, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (time / recipe.totalTime) * 100;
  const targetWeight = getTargetWeight(recipe.targetPoints, time) * scale;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center">
            <div className="text-6xl font-bold tracking-tighter">
              {formatTime(time)}
            </div>
            <div className="text-2xl text-muted-foreground mt-2">
              Target: {Math.round(targetWeight)}g
            </div>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-linear"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={isRunning ? "outline" : "default"}
              size="lg"
              onClick={isRunning ? pause : start}
            >
              {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={reset}
            >
              <RotateCcw className="mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}