import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const weightPoint = z.object({
  time: z.number(),
  weight: z.number()
});

export type WeightPoint = z.infer<typeof weightPoint>;

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  totalTime: integer("total_time").notNull(),
  targetPoints: jsonb("target_points").$type<WeightPoint[]>().notNull()
});

export const insertRecipeSchema = createInsertSchema(recipes).pick({
  name: true,
  description: true,
  totalTime: true,
  targetPoints: true
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
