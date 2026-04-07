"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ScrollArea } from "./ui/scroll-area"
import type { MissionNodeData, TeamToken } from "./world-map"

interface MissionNodeProps {
  node: MissionNodeData
  onClick: () => void
  onDrop: (teamId: string) => void
  isDropTarget: boolean
  teamsAtNode: TeamToken[]
  onTeamNameChange: (teamId: string, name: string) => void
  onTeamRemove: (teamId: string) => void
  onTeamDragStart: (teamId: string) => void
  onTeamDragEnd: () => void
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

export function MissionNode({
  node,
  onClick,
  onDrop,
  isDropTarget,
  teamsAtNode,
  onTeamNameChange,
  onTeamRemove,
  onTeamDragStart,
  onTeamDragEnd,
}: MissionNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

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
  const isStartNode = node.id === "start"
  const previewTeams = teamsAtNode.slice(0, 3)
  const hiddenCount = Math.max(teamsAtNode.length - previewTeams.length, 0)

  const startTeamEdit = (team: TeamToken) => {
    setEditingTeamId(team.id)
    setEditingName(team.name)
  }

  const submitTeamEdit = () => {
    if (!editingTeamId) return
    const trimmedName = editingName.trim()
    if (trimmedName.length > 0) {
      onTeamNameChange(editingTeamId, trimmedName)
    }
    setEditingTeamId(null)
    setEditingName("")
  }

  const handleListDragStart = (e: React.DragEvent, teamId: string) => {
    e.dataTransfer.setData("teamId", teamId)
    onTeamDragStart(teamId)
  }

  const handleListDragEnd = () => {
    onTeamDragEnd()
  }

  return (
    <div
      className="absolute z-10"
      style={{
        left: `calc(${node.x}% - 32px)`,
        top: `calc(${node.y}% - 32px)`,
      }}
    >
      <button
        onClick={onClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-16 h-16 rounded-full border-4 
          flex items-center justify-center
          transition-all duration-300 cursor-pointer
          ${colors}
          ${isUnlocked ? "animate-pulse shadow-lg shadow-current" : ""}
          ${isHovered && isDropTarget ? "scale-125 ring-4 ring-yellow-400" : ""}
          ${!isHovered ? "hover:scale-110" : ""}
        `}
        title={`${node.label} - Click for challenge details`}
      >
        {isLocked && <span className="text-2xl">🔒</span>}
        {isUnlocked && !isFinishNode && (
          <div className="w-8 h-8 rounded-full bg-white/30 animate-ping absolute" />
        )}
        {isUnlocked && !isFinishNode && !isStartNode && <span className="text-2xl z-10">⭐</span>}
        {isUnlocked && isStartNode && <span className="text-2xl z-10">🏁</span>}
        {isFinishNode && <span className="text-2xl z-10">🚩</span>}
        {isCompleted && <span className="text-2xl text-white">✔</span>}
      </button>

      {teamsAtNode.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="absolute -top-3 -right-3 z-20 flex items-center gap-1 rounded-full bg-card/95 border border-border px-2 py-1 shadow-md hover:scale-105 transition-transform"
              title={`${teamsAtNode.length} teams in ${node.label}`}
            >
              <div className="flex -space-x-1">
                {previewTeams.map((team) => (
                  <span
                    key={team.id}
                    className="inline-block h-3.5 w-3.5 rounded-full border border-white"
                    style={{ backgroundColor: team.color }}
                  />
                ))}
              </div>
              {hiddenCount > 0 && <span className="text-[10px] font-bold text-foreground">+{hiddenCount}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start" side="right">
            <div className="mb-2">
              <p className="text-sm font-semibold text-foreground">{node.label}</p>
              <p className="text-xs text-muted-foreground">{teamsAtNode.length} teams</p>
            </div>
            <ScrollArea className="h-56 pr-2">
              <div className="space-y-2">
                {teamsAtNode.map((team) => (
                  <div
                    key={team.id}
                    draggable
                    onDragStart={(e) => handleListDragStart(e, team.id)}
                    onDragEnd={handleListDragEnd}
                    className="rounded-md border border-border bg-card/70 px-2 py-2 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full border border-white"
                        style={{ backgroundColor: team.color }}
                      />
                      {editingTeamId === team.id ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={submitTeamEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") submitTeamEdit()
                            if (e.key === "Escape") {
                              setEditingTeamId(null)
                              setEditingName("")
                            }
                          }}
                          className="h-7 w-full rounded border border-input bg-background px-2 text-xs"
                          autoFocus
                        />
                      ) : (
                        <button
                          className="truncate text-left text-xs font-medium text-foreground hover:underline"
                          onClick={() => startTeamEdit(team)}
                          title="Click to rename"
                        >
                          {team.name}
                        </button>
                      )}
                      <button
                        onClick={() => onTeamRemove(team.id)}
                        className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-red-100"
                        title="Remove team"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}

      {/* Node label */}
      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground whitespace-nowrap bg-card/80 px-2 py-0.5 rounded-full">
        {node.label}
      </span>
    </div>
  )
}
