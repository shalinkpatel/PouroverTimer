import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { InsertRecipe, insertRecipeSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function RecipeView() {
  const [, params] = useRoute("/recipe/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: recipe } = useQuery({
    queryKey: [`/api/recipes/${params?.id}`],
  });

  const form = useForm<InsertRecipe>({
    resolver: zodResolver(insertRecipeSchema),
    defaultValues: recipe || {
      name: "",
      description: "",
      totalTime: 180,
      targetPoints: [{ time: 0, weight: 0 }]
    },
  });

  // Update form when recipe data is loaded
  useState(() => {
    if (recipe) {
      form.reset(recipe);
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "targetPoints"
  });

  const updateRecipe = useMutation({
    mutationFn: async (data: InsertRecipe) => {
      const sortedPoints = [...data.targetPoints].sort((a, b) => a.time - b.time);
      const payload = { ...data, targetPoints: sortedPoints };
      const res = await apiRequest("PATCH", `/api/recipes/${params?.id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipe updated",
        description: "Your changes have been saved"
      });
    }
  });

  const addPoint = () => {
    const lastTime = fields.length > 0 
      ? Math.max(...fields.map(field => field.time))
      : 0;
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time (s)</FormLabel>
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
                    <FormField
                      control={form.control}
                      name={`targetPoints.${index}.weight`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (g)</FormLabel>
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
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
