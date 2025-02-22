import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRecipeSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/recipes", async (_req, res) => {
    const recipes = await storage.getRecipes();
    res.json(recipes);
  });

  app.get("/api/recipes/:id", async (req, res) => {
    const recipe = await storage.getRecipe(Number(req.params.id));
    if (!recipe) {
      res.status(404).json({ message: "Recipe not found" });
      return;
    }
    res.json(recipe);
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const recipeData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(recipeData);
      res.status(201).json(recipe);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: "Invalid recipe data", errors: err.errors });
        return;
      }
      throw err;
    }
  });

  return createServer(app);
}
