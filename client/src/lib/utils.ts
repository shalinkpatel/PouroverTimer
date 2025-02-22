import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type WeightPoint } from "@shared/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTargetWeight(points: WeightPoint[], currentTime: number): number {
  // If before first point, return first point's weight
  if (currentTime <= points[0].time) {
    return points[0].weight;
  }

  // If after last point, return last point's weight
  if (currentTime >= points[points.length - 1].time) {
    return points[points.length - 1].weight;
  }

  // Find the surrounding points
  let i = 0;
  while (i < points.length - 1 && points[i + 1].time <= currentTime) {
    i++;
  }

  const pointA = points[i];
  const pointB = points[i + 1];

  // Linear interpolation
  const ratio = (currentTime - pointA.time) / (pointB.time - pointA.time);
  return pointA.weight + ratio * (pointB.weight - pointA.weight);
}

export function scaleRecipeWeights(points: WeightPoint[], scale: number): WeightPoint[] {
  return points.map(point => ({
    time: point.time,
    weight: point.weight * scale
  }));
}