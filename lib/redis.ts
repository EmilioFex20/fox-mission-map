import { Redis } from "@upstash/redis"

// Initialize Redis only if credentials are available
const isRedisConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

export const redis = isRedisConfigured
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null

export const isRedisAvailable = isRedisConfigured

// Keys for our game data
export const KEYS = {
  TEAMS: "hackhexa:teams",
  NODES: "hackhexa:nodes",
  GAME_STATE: "hackhexa:game_state",
}
