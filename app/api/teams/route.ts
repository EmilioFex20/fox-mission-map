import { NextResponse } from "next/server"
import { redis, KEYS } from "@/lib/redis"

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

const DEFAULT_TEAMS: TeamToken[] = [
  { id: "team-1", name: "Team Alpha", color: TOKEN_COLORS[0], currentNodeId: "start" },
  { id: "team-2", name: "Team Beta", color: TOKEN_COLORS[1], currentNodeId: "start" },
  { id: "team-3", name: "Team Gamma", color: TOKEN_COLORS[2], currentNodeId: "start" },
]

export async function GET() {
  try {
    const teams = await redis.get<TeamToken[]>(KEYS.TEAMS)
    
    if (!teams || teams.length === 0) {
      // Initialize with default teams if none exist
      await redis.set(KEYS.TEAMS, DEFAULT_TEAMS)
      return NextResponse.json(DEFAULT_TEAMS)
    }
    
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, team, teamId, updates } = body

    const teams = (await redis.get<TeamToken[]>(KEYS.TEAMS)) || []

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
        updatedTeams = DEFAULT_TEAMS
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await redis.set(KEYS.TEAMS, updatedTeams)
    return NextResponse.json(updatedTeams)
  } catch (error) {
    console.error("Error updating teams:", error)
    return NextResponse.json({ error: "Failed to update teams" }, { status: 500 })
  }
}
