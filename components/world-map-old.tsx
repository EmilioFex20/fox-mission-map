// Archived copy kept for reference only.
// Active component used by app/page.tsx is components/world-map.tsx.
"use client"

import { useRef, useCallback, useState } from "react"
import useSWR from "swr"
import { FoxToken } from "./fox-token"
import { MissionNode } from "./mission-node"
import { MapBackground } from "./map-background"

export type NodeState = "locked" | "unlocked" | "completed"

export interface MissionNodeData {
  id: string
  x: number
  y: number
  zone: "forest" | "city" | "vault" | "ai"
  label: string
  state: NodeState
} 

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function WorldMap() {
  const [draggingTeam, setDraggingTeam] = useState<string | null>(null)
  
  const { data: nodes, mutate: mutateNodes } = useSWR<MissionNodeData[]>("/api/nodes", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  const { data: teams, mutate: mutateTeams } = useSWR<TeamToken[]>("/api/teams", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  // Resume polling after drag ends
  const handleDragEnd = useCallback(() => {
    setDraggingTeam(null)
  }, [])
  const mapRef = useRef<HTMLDivElement>(null)

  const handleNodeClick = useCallback(
    async (nodeId: string) => {
      if (!nodes) return

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const nextState: NodeState =
        node.state === "locked" ? "unlocked" : node.state === "unlocked" ? "completed" : "locked"

      // Optimistic update
      const updatedNodes = nodes.map((n) => (n.id === nodeId ? { ...n, state: nextState } : n))
      mutateNodes(updatedNodes, false)

      // Persist to Redis
      await fetch("/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", nodeId, state: nextState }),
      })

      await mutateNodes()
    },
    [nodes, mutateNodes]
  )

  const handleTeamDrop = useCallback(
    async (teamId: string, nodeId: string) => {
      if (!teams) return

      // Optimistic update
      const updatedTeams = teams.map((team) => (team.id === teamId ? { ...team, currentNodeId: nodeId } : team))
      mutateTeams(updatedTeams, false)

      // Persist to Redis
      await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", teamId, updates: { currentNodeId: nodeId } }),
      })

      await mutateTeams()
    },
    [teams, mutateTeams]
  )

  const handleTeamNameChange = useCallback(
    async (teamId: string, newName: string) => {
      if (!teams) return

      // Optimistic update
      const updatedTeams = teams.map((team) => (team.id === teamId ? { ...team, name: newName } : team))
      mutateTeams(updatedTeams, false)

      // Persist to Redis
      await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", teamId, updates: { name: newName } }),
      })

      await mutateTeams()
    },
    [teams, mutateTeams]
  )

  const addNewTeam = useCallback(async () => {
    if (!teams) return

    const newTeamIndex = teams.length
    const colorIndex = newTeamIndex % TOKEN_COLORS.length
    const newTeam: TeamToken = {
      id: `team-${Date.now()}`,
      name: `Team ${newTeamIndex + 1}`,
      color: TOKEN_COLORS[colorIndex],
      currentNodeId: "start",
    }

    // Optimistic update
    mutateTeams([...teams, newTeam], false)

    // Persist to Redis
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", team: newTeam }),
    })

    await mutateTeams()
  }, [teams, mutateTeams])

  const removeTeam = useCallback(
    async (teamId: string) => {
      if (!teams) return

      // Optimistic update
      const updatedTeams = teams.filter((team) => team.id !== teamId)
      mutateTeams(updatedTeams, false)

      // Persist to Redis
      await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", teamId }),
      })

      await mutateTeams()
    },
    [teams, mutateTeams]
  )

  const resetGame = useCallback(async () => {
    // Reset nodes to default
    await fetch("/api/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    })
    await mutateNodes()

    // Clear all teams
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    })
    await mutateTeams()
  }, [mutateNodes, mutateTeams])

  // Generate path points for the winding road (scaled to 0-100% coordinate space)
  const pathD = `
    M 4.2 53.7
    Q 7.3 51, 10.4 48.1
    Q 13.5 51.9, 16.7 55.6
    Q 19.8 50.9, 22.9 46.3
    Q 26.6 48.1, 30.2 50.9
    Q 33.9 47.2, 37.5 44.4
    Q 41.1 48.1, 44.8 51.9
    Q 48.4 48.1, 52.1 45.4
    Q 55.7 49.1, 59.4 52.8
    Q 63.0 48.1, 66.7 44.4
    Q 70.4 47.2, 74.0 50.0
    Q 77.6 46.3, 81.3 42.6
    Q 85.4 45.4, 89.6 48.1
  `

  // Loading state
  if (!nodes || !teams) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-foreground font-semibold">Loading game world...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden" ref={mapRef}>
      {/* Background Landscape */}
      <MapBackground />

      {/* Path SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Glowing path background */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255, 220, 100, 0.3)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        {/* Main path */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255, 220, 100, 0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0 3"
        />
        {/* Path dots */}
        <path
          d={pathD}
          fill="none"
          stroke="#FEF3C7"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0.15 2.5"
        />
        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Mission Nodes */}
      {nodes?.map((node) => (
        <MissionNode
          key={node.id}
          node={node}
          onClick={() => handleNodeClick(node.id)}
          onDrop={(teamId) => handleTeamDrop(teamId, node.id)}
          isDropTarget={draggingTeam !== null}
        />
      ))}

      {/* Team Tokens at their current positions */}
      {teams?.map((team) => {
        const node = nodes?.find((n) => n.id === team.currentNodeId)
        if (!node) return null
        return (
          <FoxToken
            key={team.id}
            team={team}
            position={{ x: node.x, y: node.y }}
            onDragStart={() => setDraggingTeam(team.id)}
            onDragEnd={handleDragEnd}
            onNameChange={(name) => handleTeamNameChange(team.id, name)}
            onRemove={() => removeTeam(team.id)}
          />
        )
      })}

      {/* Title Banner */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-20">
        <h1 className="text-5xl font-bold text-foreground drop-shadow-lg font-sans tracking-wide">
          HackHexa: Fox Mission
        </h1>
        <p className="text-xl text-foreground/90 mt-2 drop-shadow font-sans">
          Guide your fox through the tech adventure!
        </p>
      </div>

      {/* Zone Labels */}
      <div className="absolute top-[12%] left-[10%] text-center z-10">
        <span className="px-4 py-2 bg-forest-green/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          Sensor Forest
        </span>
      </div>
      <div className="absolute top-[12%] left-[35%] text-center z-10">
        <span className="px-4 py-2 bg-city-blue/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          Traffic City
        </span>
      </div>
      <div className="absolute top-[12%] left-[58%] text-center z-10">
        <span className="px-4 py-2 bg-vault-purple/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          Code Vault
        </span>
      </div>
      <div className="absolute top-[12%] left-[80%] text-center z-10">
        <span className="px-4 py-2 bg-ai-cyan/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          AI Core
        </span>
      </div>

      {/* Add Team Button */}
      <button
        onClick={addNewTeam}
        className="absolute bottom-6 right-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-lg shadow-lg hover:scale-105 transition-transform z-20"
      >
        + Add Team
      </button>

      {/* Reset Game Button */}
      <button
        onClick={resetGame}
        className="absolute bottom-6 right-48 px-4 py-3 bg-destructive text-destructive-foreground rounded-full font-semibold text-sm shadow-lg hover:scale-105 transition-transform z-20"
      >
        Reset Game
      </button>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl z-20">
        <h3 className="font-semibold text-card-foreground mb-3">Node States</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-muted-foreground/50 flex items-center justify-center text-xs">
              L
            </div>
            <span className="text-sm text-card-foreground">Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-card-foreground">Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">
              OK
            </div>
            <span className="text-sm text-card-foreground">Completed</span>
          </div>
        </div>
      </div>

      {/* Sync Status Indicator */}
      <div className="absolute top-6 right-6 px-3 py-1 bg-card/80 backdrop-blur-sm rounded-full text-sm text-card-foreground z-20">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
        Synced
      </div>
    </div>
  )
}
