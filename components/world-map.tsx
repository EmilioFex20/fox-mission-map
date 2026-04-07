"use client"

import { useState, useRef, useCallback } from "react"
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

const MISSION_NODES: MissionNodeData[] = [
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

const TOKEN_COLORS = [
  "#3B82F6", // blue
  "#F97316", // orange
  "#A855F7", // purple
  "#22C55E", // green
  "#EC4899", // pink
  "#EAB308", // yellow
  "#06B6D4", // cyan
]

const initialTeams: TeamToken[] = [
  { id: "team-1", name: "Team Alpha", color: TOKEN_COLORS[0], currentNodeId: "start" },
  { id: "team-2", name: "Team Beta", color: TOKEN_COLORS[1], currentNodeId: "start" },
  { id: "team-3", name: "Team Gamma", color: TOKEN_COLORS[2], currentNodeId: "start" },
]

export function WorldMap() {
  const [nodes, setNodes] = useState<MissionNodeData[]>(MISSION_NODES)
  const [teams, setTeams] = useState<TeamToken[]>(initialTeams)
  const [draggingTeam, setDraggingTeam] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const handleNodeClick = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const nextState: NodeState =
            node.state === "locked" ? "unlocked" : node.state === "unlocked" ? "completed" : "locked"
          return { ...node, state: nextState }
        }
        return node
      })
    )
  }, [])

  const handleTeamDrop = useCallback((teamId: string, nodeId: string) => {
    setTeams((prev) => prev.map((team) => (team.id === teamId ? { ...team, currentNodeId: nodeId } : team)))
    setDraggingTeam(null)
  }, [])

  const handleTeamNameChange = useCallback((teamId: string, newName: string) => {
    setTeams((prev) => prev.map((team) => (team.id === teamId ? { ...team, name: newName } : team)))
  }, [])

  const addNewTeam = useCallback(() => {
    const newTeamIndex = teams.length
    const colorIndex = newTeamIndex % TOKEN_COLORS.length
    const newTeam: TeamToken = {
      id: `team-${Date.now()}`,
      name: `Team ${newTeamIndex + 1}`,
      color: TOKEN_COLORS[colorIndex],
      currentNodeId: "start",
    }
    setTeams((prev) => [...prev, newTeam])
  }, [teams.length])

  const removeTeam = useCallback((teamId: string) => {
    setTeams((prev) => prev.filter((team) => team.id !== teamId))
  }, [])

  // Generate path points for the winding road
  const pathD = `
    M 80 580
    Q 140 550, 200 520
    Q 260 560, 320 600
    Q 380 550, 440 500
    Q 510 520, 580 550
    Q 650 510, 720 480
    Q 790 520, 860 560
    Q 930 520, 1000 490
    Q 1070 530, 1140 570
    Q 1210 520, 1280 480
    Q 1350 510, 1420 540
    Q 1490 500, 1560 460
    Q 1640 490, 1720 520
  `

  return (
    <div className="relative w-[1920px] h-[1080px] overflow-hidden" ref={mapRef}>
      {/* Background Landscape */}
      <MapBackground />

      {/* Path SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1920 1080">
        {/* Glowing path background */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255, 220, 100, 0.3)"
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        {/* Main path */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255, 220, 100, 0.8)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0 50"
        />
        {/* Path dots */}
        <path
          d={pathD}
          fill="none"
          stroke="#FEF3C7"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 40"
        />
        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Mission Nodes */}
      {nodes.map((node) => (
        <MissionNode
          key={node.id}
          node={node}
          onClick={() => handleNodeClick(node.id)}
          onDrop={(teamId) => handleTeamDrop(teamId, node.id)}
          isDropTarget={draggingTeam !== null}
        />
      ))}

      {/* Team Tokens at their current positions */}
      {teams.map((team) => {
        const node = nodes.find((n) => n.id === team.currentNodeId)
        if (!node) return null
        return (
          <FoxToken
            key={team.id}
            team={team}
            position={{ x: node.x, y: node.y }}
            onDragStart={() => setDraggingTeam(team.id)}
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
      <div className="absolute top-28 left-[180px] text-center z-10">
        <span className="px-4 py-2 bg-forest-green/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          🌲📡 Sensor Forest
        </span>
      </div>
      <div className="absolute top-28 left-[680px] text-center z-10">
        <span className="px-4 py-2 bg-city-blue/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          🚦🏙️ Traffic City
        </span>
      </div>
      <div className="absolute top-28 left-[1100px] text-center z-10">
        <span className="px-4 py-2 bg-vault-purple/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          🔐💻 Code Vault
        </span>
      </div>
      <div className="absolute top-28 left-[1520px] text-center z-10">
        <span className="px-4 py-2 bg-ai-cyan/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          🧠⚡ AI Core
        </span>
      </div>

      {/* Add Team Button */}
      <button
        onClick={addNewTeam}
        className="absolute bottom-6 right-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-lg shadow-lg hover:scale-105 transition-transform z-20"
      >
        + Add Team
      </button>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl z-20">
        <h3 className="font-semibold text-card-foreground mb-3">Node States</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-muted-foreground/50 flex items-center justify-center text-xs">
              🔒
            </div>
            <span className="text-sm text-card-foreground">Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-card-foreground">Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">
              ✔
            </div>
            <span className="text-sm text-card-foreground">Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
