import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InsertRecipe, insertRecipeSchema, type WeightPoint } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2 } from "lucide-react";

export default function RecipeForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertRecipe>({
    resolver: zodResolver(insertRecipeSchema),
    defaultValues: {
      name: "",
      description: "",
      totalTime: 180,
      targetPoints: [
        { time: 0, weight: 0 }
      ]
    }
  });

  const { fields, append, remove } = form.control._fields.targetPoints || [];

  const createRecipe = useMutation({
    mutationFn: async (data: InsertRecipe) => {
      // Sort points by time before submitting
      const sortedPoints = [...data.targetPoints].sort((a, b) => a.time - b.time);
      const payload = { ...data, targetPoints: sortedPoints };
      const res = await apiRequest("POST", "/api/recipes", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipe created",
        description: "Your new recipe has been saved"
      });
      form.reset();
    }
  });

  const addPoint = () => {
    const points = form.getValues("targetPoints") || [];
    const lastTime = points.length > 0 ? Math.max(...points.map(p => p.time)) : 0;
    append({ time: lastTime + 30, weight: 0 });
  };

  const onSubmit = (data: InsertRecipe) => {
    if (data.targetPoints.length < 2) {
      toast({
        title: "Invalid points",
        description: "You need at least 2 points to create a recipe",
        variant: "destructive"
      });
      return;
    }
    createRecipe.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Recipe</CardTitle>
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

              {form.getValues("targetPoints")?.map((_, index) => (
                <div key={index} className="flex gap-4 items-end">
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

            <Button type="submit" disabled={createRecipe.isPending}>
              Create Recipe
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}