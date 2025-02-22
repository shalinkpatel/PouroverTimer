import { recipes, type Recipe, type InsertRecipe } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  deleteRecipe(id: number): Promise<void>;
  updateRecipe(id: number, recipe: InsertRecipe): Promise<Recipe | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db
      .insert(recipes)
      .values({
        name: insertRecipe.name,
        description: insertRecipe.description,
        totalTime: insertRecipe.totalTime,
        targetPoints: [...insertRecipe.targetPoints]
      })
      .returning();
    return recipe;
  }

  async deleteRecipe(id: number): Promise<void> {
    await db.delete(recipes).where(eq(recipes.id, id));
  }

  async updateRecipe(id: number, updateRecipe: InsertRecipe): Promise<Recipe | undefined> {
    const [recipe] = await db
      .update(recipes)
      .set({
        name: updateRecipe.name,
        description: updateRecipe.description,
        totalTime: updateRecipe.totalTime,
        targetPoints: [...updateRecipe.targetPoints]
      })
      .where(eq(recipes.id, id))
      .returning();
    return recipe;
  }
}

export const storage = new DatabaseStorage();