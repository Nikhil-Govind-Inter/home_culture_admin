import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  AUTHOR: "author",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];