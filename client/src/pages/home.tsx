import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TimerDisplay from "@/components/coffee/timer-display";
import WeightGraph from "@/components/coffee/weight-graph";
import RecipeForm from "@/components/coffee/recipe-form";
import { type Recipe } from "@shared/schema";

export default function Home() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>();
  const [currentTime, setCurrentTime] = useState(0);
  const [scale, setScale] = useState(1);

  const { data: recipes } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const selectedRecipe = recipes?.find(r => r.id.toString() === selectedRecipeId);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Pour Over Timer
        </h1>
        <p className="text-muted-foreground text-center max-w-lg">
          Select a recipe and follow the timing guide for the perfect pour over coffee.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a recipe" />
            </SelectTrigger>
            <SelectContent>
              {recipes?.map((recipe) => (
                <SelectItem key={recipe.id} value={recipe.id.toString()}>
                  {recipe.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedRecipe && (
            <>
              <div className="flex items-center gap-4">
                <div className="grow">
                  <Label htmlFor="scale">Recipe Scale</Label>
                  <Input
                    id="scale"
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div className="text-sm text-muted-foreground pt-6">
                  {`Final brew: ${Math.round(selectedRecipe.targetPoints[selectedRecipe.targetPoints.length - 1].weight * scale)}g`}
                </div>
              </div>
              <TimerDisplay 
                recipe={selectedRecipe} 
                onTimeUpdate={setCurrentTime}
                scale={scale}
              />
              <WeightGraph 
                recipe={selectedRecipe}
                currentTime={currentTime}
                scale={scale}
              />
            </>
          )}
        </div>

        <div>
          <RecipeForm />
        </div>
      </div>
    </div>
  );
}