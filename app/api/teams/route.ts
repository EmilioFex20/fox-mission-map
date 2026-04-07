import { NextResponse } from "next/server"
import { redis, KEYS, isRedisAvailable } from "@/lib/redis"

export interface TeamToken {
  id: string
  name: string
  color: string
  currentNodeId: string
}

const TOKEN_COLORS = [
  "#3B82F6", // blue
  "#F97316", // orange
  "#A855F7", // purple
  "#22C55E", // green
  "#EC4899", // pink
  "#EAB308", // yellow
  "#06B6D4", // cyan
]

const DEFAULT_TEAMS: TeamToken[] = []

// In-memory store for when Redis is not available
let memoryStore: TeamToken[] = [...DEFAULT_TEAMS]

export async function GET() {
  try {
    // If Redis is available, use it
    if (isRedisAvailable && redis) {
      const teams = await redis.get<TeamToken[]>(KEYS.TEAMS)
      
      if (!teams || teams.length === 0) {
        // Initialize empty team list if none exist
        await redis.set(KEYS.TEAMS, DEFAULT_TEAMS)
        return NextResponse.json(DEFAULT_TEAMS)
      }
      
      return NextResponse.json(teams)
    }

    // Otherwise use in-memory store
    return NextResponse.json(memoryStore)
  } catch (error) {
    console.error("Error fetching teams:", error)
    // Preserve in-memory state in non-Redis mode even on transient errors
    return NextResponse.json(isRedisAvailable ? DEFAULT_TEAMS : memoryStore)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, team, teamId, updates } = body

    let teams: TeamToken[]
    
    // Get current teams from Redis or memory
    if (isRedisAvailable && redis) {
      teams = (await redis.get<TeamToken[]>(KEYS.TEAMS)) || DEFAULT_TEAMS
    } else {
      teams = memoryStore
    }

    let updatedTeams: TeamToken[]

    switch (action) {
      case "add":
        updatedTeams = [...teams, team]
        break
      case "remove":
        updatedTeams = teams.filter((t) => t.id !== teamId)
        break
      case "update":
        updatedTeams = teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
        break
      case "set":
        updatedTeams = body.teams
        break
      case "clear":
        updatedTeams = []
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Save to Redis or memory
    if (isRedisAvailable && redis) {
      await redis.set(KEYS.TEAMS, updatedTeams)
    } else {
      memoryStore = updatedTeams
    }
    
    return NextResponse.json(updatedTeams)
  } catch (error) {
    console.error("Error updating teams:", error)
    return NextResponse.json({ error: "Failed to update teams" }, { status: 500 })
  }
}
