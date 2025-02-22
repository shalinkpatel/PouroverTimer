import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { InsertRecipe, insertRecipeSchema, type Recipe, type WeightPoint } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import TimerDisplay from "@/components/coffee/timer-display";
import WeightGraph from "@/components/coffee/weight-graph";
import { slugify } from "@/lib/utils";

export default function RecipeView() {
  const [, params] = useRoute("/recipes/:name");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(0);
  const [scale, setScale] = useState<number>(1);

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const recipe = recipes?.find(r => slugify(r.name) === params?.name);

  const form = useForm<InsertRecipe>({
    resolver: zodResolver(insertRecipeSchema),
    defaultValues: {
      name: recipe?.name ?? "",
      description: recipe?.description ?? "",
      totalTime: recipe?.totalTime ?? 180,
      targetPoints: recipe?.targetPoints ?? [{ time: 0, weight: 0 }]
    },
  });

  useEffect(() => {
    if (recipe) {
      form.reset({
        name: recipe.name,
        description: recipe.description,
        totalTime: recipe.totalTime,
        targetPoints: recipe.targetPoints
      });
    }
  }, [recipe, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "targetPoints"
  });

  const updateRecipe = useMutation({
    mutationFn: async (data: InsertRecipe) => {
      if (!recipe) return;
      const sortedPoints = [...data.targetPoints].sort((a, b) => a.time - b.time);
      const payload = { ...data, targetPoints: sortedPoints };
      const res = await apiRequest("PATCH", `/api/recipes/${recipe.id}`, payload);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipe updated",
        description: "Your changes have been saved"
      });
      if (data && slugify(data.name) !== params?.name) {
        setLocation(`/recipes/${slugify(data.name)}`);
      }
    }
  });

  const addPoint = () => {
    const points = form.getValues("targetPoints");
    const lastTime = points.length > 0 ? points[points.length - 1].time : 0;
    append({ time: lastTime + 30, weight: 0 });
  };

  const onSubmit = (data: InsertRecipe) => {
    if (data.targetPoints.length < 2) {
      toast({
        title: "Invalid points",
        description: "You need at least 2 points to update the recipe",
        variant: "destructive"
      });
      return;
    }
    updateRecipe.mutate(data);
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 1 : parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setScale(value);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Button>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Recipe not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Recipes
      </Button>

      <Tabs defaultValue="run" className="space-y-4">
        <TabsList>
          <TabsTrigger value="run">Run Recipe</TabsTrigger>
          <TabsTrigger value="edit">Edit Recipe</TabsTrigger>
        </TabsList>

        <TabsContent value="run" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="grow">
              <FormLabel htmlFor="scale">Recipe Scale</FormLabel>
              <Input
                id="scale"
                type="number"
                min={0.1}
                step={0.1}
                value={scale}
                onChange={handleScaleChange}
              />
            </div>
            <div className="text-sm text-muted-foreground pt-6">
              {`Final brew: ${Math.round(recipe.targetPoints[recipe.targetPoints.length - 1].weight * scale)}g`}
            </div>
          </div>
          <TimerDisplay 
            recipe={recipe} 
            onTimeUpdate={setCurrentTime}
            scale={scale}
          />
          <WeightGraph 
            recipe={recipe}
            currentTime={currentTime}
            scale={scale}
          />
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Recipe</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Time (seconds)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel>Target Points</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPoint}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Point
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 items-end">
                        <FormField
                          control={form.control}
                          name={`targetPoints.${index}.time`}
                          render={({ field: timeField }) => (
                            <FormItem>
                              <FormLabel>Time (s)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...timeField}
                                  onChange={e => timeField.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`targetPoints.${index}.weight`}
                          render={({ field: weightField }) => (
                            <FormItem>
                              <FormLabel>Weight (g)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...weightField}
                                  onChange={e => weightField.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button type="submit" disabled={updateRecipe.isPending}>
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}