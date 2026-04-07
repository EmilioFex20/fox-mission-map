"use client"

import { useState } from "react"
import type { MissionNodeData } from "./world-map"

interface MissionNodeProps {
  node: MissionNodeData
  onClick: () => void
  onDrop: (teamId: string) => void
  isDropTarget: boolean
}

const zoneColors = {
  forest: {
    locked: "bg-green-900/60 border-green-700",
    unlocked: "bg-green-500 border-green-300 shadow-green-400/50",
    completed: "bg-green-600 border-green-400",
  },
  city: {
    locked: "bg-slate-700/60 border-slate-500",
    unlocked: "bg-blue-500 border-blue-300 shadow-blue-400/50",
    completed: "bg-blue-600 border-blue-400",
  },
  vault: {
    locked: "bg-purple-900/60 border-purple-700",
    unlocked: "bg-purple-500 border-purple-300 shadow-purple-400/50",
    completed: "bg-purple-600 border-purple-400",
  },
  ai: {
    locked: "bg-cyan-900/60 border-cyan-700",
    unlocked: "bg-cyan-500 border-cyan-300 shadow-cyan-400/50",
    completed: "bg-cyan-600 border-cyan-400",
  },
}

export function MissionNode({ node, onClick, onDrop, isDropTarget }: MissionNodeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovered(true)
  }

  const handleDragLeave = () => {
    setIsHovered(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const teamId = e.dataTransfer.getData("teamId")
    if (teamId) {
      onDrop(teamId)
    }
    setIsHovered(false)
  }

  const colors = zoneColors[node.zone][node.state]
  const isUnlocked = node.state === "unlocked"
  const isCompleted = node.state === "completed"
  const isLocked = node.state === "locked"
  const isFinishNode = node.id === "finish"

  return (
    <button
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        absolute w-16 h-16 rounded-full border-4 
        flex items-center justify-center
        transition-all duration-300 cursor-pointer z-10
        ${colors}
        ${isUnlocked ? "animate-pulse shadow-lg shadow-current" : ""}
        ${isHovered && isDropTarget ? "scale-125 ring-4 ring-yellow-400" : ""}
        ${!isHovered ? "hover:scale-110" : ""}
      `}
      style={{
        left: `calc(${node.x}% - 32px)`,
        top: `calc(${node.y}% - 32px)`,
      }}
      title={`${node.label} - Click to change state`}
    >
      {isLocked && <span className="text-2xl">🔒</span>}
      {isUnlocked && !isFinishNode && (
        <div className="w-8 h-8 rounded-full bg-white/30 animate-ping absolute" />
      )}
      {isUnlocked && !isFinishNode && <span className="text-2xl z-10">⭐</span>}
      {isFinishNode && <span className="text-2xl z-10">🚩</span>}
      {isCompleted && <span className="text-2xl text-white">✔</span>}

      {/* Node label */}
      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground whitespace-nowrap bg-card/80 px-2 py-0.5 rounded-full">
        {node.label}
      </span>
    </button>
  )
}
