import { NextResponse } from "next/server"
import { redis, KEYS } from "@/lib/redis"

export type NodeState = "locked" | "unlocked" | "completed"

export interface MissionNodeData {
  id: string
  x: number
  y: number
  zone: "forest" | "city" | "vault" | "ai"
  label: string
  state: NodeState
}

// Positions stored as percentages (0-100) for responsive scaling
const DEFAULT_NODES: MissionNodeData[] = [
  // Sensor Forest Zone
  { id: "start", x: 4.2, y: 53.7, zone: "forest", label: "Start", state: "unlocked" },
  { id: "forest-1", x: 10.4, y: 48.1, zone: "forest", label: "Sensor 1", state: "locked" },
  { id: "forest-2", x: 16.7, y: 55.6, zone: "forest", label: "Sensor 2", state: "locked" },
  { id: "forest-3", x: 22.9, y: 46.3, zone: "forest", label: "Sensor 3", state: "locked" },
  // Traffic City Zone
  { id: "city-1", x: 30.2, y: 50.9, zone: "city", label: "Traffic 1", state: "locked" },
  { id: "city-2", x: 37.5, y: 44.4, zone: "city", label: "Traffic 2", state: "locked" },
  { id: "city-3", x: 44.8, y: 51.9, zone: "city", label: "Traffic 3", state: "locked" },
  // Code Vault Zone
  { id: "vault-1", x: 52.1, y: 45.4, zone: "vault", label: "Vault 1", state: "locked" },
  { id: "vault-2", x: 59.4, y: 52.8, zone: "vault", label: "Vault 2", state: "locked" },
  { id: "vault-3", x: 66.7, y: 44.4, zone: "vault", label: "Vault 3", state: "locked" },
  // AI Core Zone
  { id: "ai-1", x: 74.0, y: 50.0, zone: "ai", label: "AI 1", state: "locked" },
  { id: "ai-2", x: 81.3, y: 42.6, zone: "ai", label: "AI 2", state: "locked" },
  { id: "ai-final", x: 89.6, y: 48.1, zone: "ai", label: "AI Core", state: "locked" },
]

export async function GET() {
  try {
    const nodes = await redis.get<MissionNodeData[]>(KEYS.NODES)
    
    if (!nodes || nodes.length === 0) {
      // Initialize with default nodes if none exist
      await redis.set(KEYS.NODES, DEFAULT_NODES)
      return NextResponse.json(DEFAULT_NODES)
    }
    
    return NextResponse.json(nodes)
  } catch (error) {
    console.error("Error fetching nodes:", error)
    return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, nodeId, state, nodes: newNodes } = body

    if (action === "set") {
      await redis.set(KEYS.NODES, newNodes)
      return NextResponse.json(newNodes)
    }

    if (action === "update" && nodeId) {
      const nodes = (await redis.get<MissionNodeData[]>(KEYS.NODES)) || DEFAULT_NODES
      const updatedNodes = nodes.map((n) => (n.id === nodeId ? { ...n, state } : n))
      await redis.set(KEYS.NODES, updatedNodes)
      return NextResponse.json(updatedNodes)
    }

    if (action === "reset") {
      await redis.set(KEYS.NODES, DEFAULT_NODES)
      return NextResponse.json(DEFAULT_NODES)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating nodes:", error)
    return NextResponse.json({ error: "Failed to update nodes" }, { status: 500 })
  }
}
