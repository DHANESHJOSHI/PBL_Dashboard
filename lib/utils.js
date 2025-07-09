import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(...inputs))
}

export function generateTeamID() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `IBMSB2025${timestamp}${randomStr}`.toUpperCase()
}

export function trimAndClean(str) {
  if (typeof str !== "string") return str
  return str.trim().replace(/\s+/g, " ")
}

export function createResponse(success, message, data = null) {
  return {
    success,
    message,
    ...(data && { data }),
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
