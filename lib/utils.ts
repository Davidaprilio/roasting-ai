import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setCookieTheme(theme: string) {
  document.cookie = `theme=${theme}; path=/`
}
