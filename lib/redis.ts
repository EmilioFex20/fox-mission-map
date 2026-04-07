import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Keys for our game data
export const KEYS = {
  TEAMS: "hackhexa:teams",
  NODES: "hackhexa:nodes",
  GAME_STATE: "hackhexa:game_state",
}
