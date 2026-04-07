import { NextResponse } from "next/server"
import { redis, KEYS, isRedisAvailable } from "@/lib/redis"

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
  { id: "forest-1", x: 10.4, y: 48.1, zone: "forest", label: "Sensor 1", state: "unlocked" },
  { id: "forest-2", x: 16.7, y: 55.6, zone: "forest", label: "Sensor 2", state: "unlocked" },
  { id: "forest-3", x: 22.9, y: 46.3, zone: "forest", label: "Sensor 3", state: "unlocked" },
  // Traffic City Zone
  { id: "city-1", x: 30.2, y: 50.9, zone: "city", label: "Traffic 1", state: "unlocked" },
  { id: "city-2", x: 37.5, y: 44.4, zone: "city", label: "Traffic 2", state: "unlocked" },
  { id: "city-3", x: 44.8, y: 51.9, zone: "city", label: "Traffic 3", state: "unlocked" },
  // Code Vault Zone
  { id: "vault-1", x: 52.1, y: 45.4, zone: "vault", label: "Vault 1", state: "unlocked" },
  { id: "vault-2", x: 59.4, y: 52.8, zone: "vault", label: "Vault 2", state: "unlocked" },
  { id: "vault-3", x: 66.7, y: 44.4, zone: "vault", label: "Vault 3", state: "unlocked" },
  // AI Core Zone
  { id: "ai-1", x: 74.0, y: 50.0, zone: "ai", label: "AI 1", state: "unlocked" },
  { id: "ai-2", x: 81.3, y: 42.6, zone: "ai", label: "AI 2", state: "unlocked" },
  { id: "ai-final", x: 89.6, y: 48.1, zone: "ai", label: "AI Core", state: "unlocked" },
]

// In-memory store for when Redis is not available
let memoryStore: MissionNodeData[] = [...DEFAULT_NODES]

function forceUnlocked(nodes: MissionNodeData[]): MissionNodeData[] {
  return nodes.map((node) => ({ ...node, state: "unlocked" }))
}

export async function GET() {
  try {
    // If Redis is available, use it
    if (isRedisAvailable && redis) {
      const nodes = await redis.get<MissionNodeData[]>(KEYS.NODES)
      
      if (!nodes || nodes.length === 0) {
        // Initialize with default nodes if none exist
        await redis.set(KEYS.NODES, DEFAULT_NODES)
        return NextResponse.json(DEFAULT_NODES)
      }

      const unlockedNodes = forceUnlocked(nodes)
      if (JSON.stringify(unlockedNodes) !== JSON.stringify(nodes)) {
        await redis.set(KEYS.NODES, unlockedNodes)
      }

      return NextResponse.json(unlockedNodes)
    }

    // Otherwise use in-memory store
    memoryStore = forceUnlocked(memoryStore)
    return NextResponse.json(memoryStore)
  } catch (error) {
    console.error("Error fetching nodes:", error)
    // Fall back to default nodes on error instead of returning 500
    return NextResponse.json(DEFAULT_NODES)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, nodeId, state, nodes: newNodes } = body

    if (action === "set") {
      const unlockedNodes = forceUnlocked(newNodes)
      if (isRedisAvailable && redis) {
        await redis.set(KEYS.NODES, unlockedNodes)
      } else {
        memoryStore = unlockedNodes
      }
      return NextResponse.json(unlockedNodes)
    }

    if (action === "update" && nodeId) {
      let nodes: MissionNodeData[]
      
      if (isRedisAvailable && redis) {
        nodes = (await redis.get<MissionNodeData[]>(KEYS.NODES)) || DEFAULT_NODES
      } else {
        nodes = memoryStore
      }
      
      const updatedNodes = forceUnlocked(nodes.map((n) => (n.id === nodeId ? { ...n, state } : n)))
      
      if (isRedisAvailable && redis) {
        await redis.set(KEYS.NODES, updatedNodes)
      } else {
        memoryStore = updatedNodes
      }
      
      return NextResponse.json(updatedNodes)
    }

    if (action === "reset") {
      if (isRedisAvailable && redis) {
        await redis.set(KEYS.NODES, DEFAULT_NODES)
      } else {
        memoryStore = [...DEFAULT_NODES]
      }
      return NextResponse.json(DEFAULT_NODES)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating nodes:", error)
    // Return default data on error for graceful degradation
    return NextResponse.json(DEFAULT_NODES)
  }
}
