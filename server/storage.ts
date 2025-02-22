import { recipes, type Recipe, type InsertRecipe } from "@shared/schema";

export interface IStorage {
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
}

export class MemStorage implements IStorage {
  private recipes: Map<number, Recipe>;
  private currentId: number;

  constructor() {
    this.recipes = new Map();
    this.currentId = 1;
    this.initializePresets();
  }

  private initializePresets() {
    const presets: InsertRecipe[] = [
      {
        name: "Classic V60",
        description: "Traditional Hario V60 pour-over method",
        totalTime: 180,
        targetPoints: [
          { time: 0, weight: 0 },
          { time: 30, weight: 60 },
          { time: 45, weight: 60 },
          { time: 105, weight: 200 },
          { time: 180, weight: 300 }
        ]
      },
      {
        name: "Fast Flow",
        description: "Quick extraction for lighter roasts",
        totalTime: 150,
        targetPoints: [
          { time: 0, weight: 0 },
          { time: 20, weight: 50 },
          { time: 30, weight: 50 },
          { time: 90, weight: 200 },
          { time: 150, weight: 250 }
        ]
      }
    ];

    presets.forEach(preset => this.createRecipe(preset));
  }

  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.currentId++;
    const recipe = { ...insertRecipe, id };
    this.recipes.set(id, recipe);
    return recipe;
  }
}

export const storage = new MemStorage();
