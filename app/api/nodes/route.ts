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

const DEFAULT_NODES: MissionNodeData[] = [
  // Sensor Forest Zone
  { id: "start", x: 80, y: 580, zone: "forest", label: "Start", state: "unlocked" },
  { id: "forest-1", x: 200, y: 520, zone: "forest", label: "Sensor 1", state: "locked" },
  { id: "forest-2", x: 320, y: 600, zone: "forest", label: "Sensor 2", state: "locked" },
  { id: "forest-3", x: 440, y: 500, zone: "forest", label: "Sensor 3", state: "locked" },
  // Traffic City Zone
  { id: "city-1", x: 580, y: 550, zone: "city", label: "Traffic 1", state: "locked" },
  { id: "city-2", x: 720, y: 480, zone: "city", label: "Traffic 2", state: "locked" },
  { id: "city-3", x: 860, y: 560, zone: "city", label: "Traffic 3", state: "locked" },
  // Code Vault Zone
  { id: "vault-1", x: 1000, y: 490, zone: "vault", label: "Vault 1", state: "locked" },
  { id: "vault-2", x: 1140, y: 570, zone: "vault", label: "Vault 2", state: "locked" },
  { id: "vault-3", x: 1280, y: 480, zone: "vault", label: "Vault 3", state: "locked" },
  // AI Core Zone
  { id: "ai-1", x: 1420, y: 540, zone: "ai", label: "AI 1", state: "locked" },
  { id: "ai-2", x: 1560, y: 460, zone: "ai", label: "AI 2", state: "locked" },
  { id: "ai-final", x: 1720, y: 520, zone: "ai", label: "AI Core", state: "locked" },
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
