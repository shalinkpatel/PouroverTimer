import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InsertRecipe, insertRecipeSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
        { time: 0, weight: 0 },
        { time: 30, weight: 60 },
        { time: 180, weight: 300 }
      ]
    }
  });

  const createRecipe = useMutation({
    mutationFn: async (data: InsertRecipe) => {
      const res = await apiRequest("POST", "/api/recipes", data);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Recipe</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createRecipe.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Textarea {...field} />
                  </FormControl>
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
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createRecipe.isPending}>
              Create Recipe
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
