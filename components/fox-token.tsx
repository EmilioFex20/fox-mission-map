"use client"

import { useState } from "react"
import type { TeamToken } from "./world-map"

interface FoxTokenProps {
  team: TeamToken
  position: { x: number; y: number }
  onDragStart: () => void
  onDragEnd: () => void
  onNameChange: (name: string) => void
  onRemove: () => void
}

export function FoxToken({ team, position, onDragStart, onDragEnd, onNameChange, onRemove }: FoxTokenProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(team.name)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("teamId", team.id)
    onDragStart()
  }

  const handleDragEnd = () => {
    onDragEnd()
  }

  const handleNameSubmit = () => {
    onNameChange(editName)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit()
    } else if (e.key === "Escape") {
      setEditName(team.name)
      setIsEditing(false)
    }
  }

  // Keep token offsets bounded so timestamp-based ids do not push tokens off-screen.
  const offsetSeed = Number.parseInt(team.id.split("-")[1] ?? "0", 10)
  const tokenOffset = Number.isFinite(offsetSeed) ? ((offsetSeed % 9) - 4) * 0.8 : 0

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="absolute z-20 cursor-grab active:cursor-grabbing group"
      style={{
        left: `calc(${position.x + tokenOffset}% - 35px)`,
        top: `calc(${position.y}% - 80px)`,
      }}
    >
      {/* Token container */}
      <div
        className="relative flex flex-col items-center transition-transform hover:scale-110"
        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
      >
        {/* Fox avatar circle */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
          style={{ backgroundColor: team.color }}
        >
          <FoxFace />
        </div>

        {/* Team name label */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="mt-1 px-2 py-1 text-sm font-semibold rounded-full bg-white text-gray-800 border-2 text-center w-24 outline-none"
            style={{ borderColor: team.color }}
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-1 px-3 py-1 text-sm font-semibold rounded-full bg-white text-gray-800 border-2 hover:bg-gray-100 transition-colors max-w-[100px] truncate"
            style={{ borderColor: team.color }}
            title="Click to edit team name"
          >
            {team.name}
          </button>
        )}

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Remove team"
        >
          ×
        </button>
      </div>

      {/* Pointer triangle */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent"
        style={{ 
          borderTopColor: team.color,
          bottom: -8,
        }}
      />
    </div>
  )
}

function FoxFace() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      {/* Ears */}
      <polygon points="5,18 12,5 18,15" fill="#F97316" />
      <polygon points="35,18 28,5 22,15" fill="#F97316" />
      <polygon points="8,16 12,8 15,14" fill="#FED7AA" />
      <polygon points="32,16 28,8 25,14" fill="#FED7AA" />

      {/* Face */}
      <ellipse cx="20" cy="24" rx="16" ry="14" fill="#F97316" />

      {/* White face markings */}
      <ellipse cx="20" cy="28" rx="10" ry="10" fill="#FFF7ED" />

      {/* Eyes */}
      <ellipse cx="14" cy="22" rx="3" ry="4" fill="#1F2937" />
      <ellipse cx="26" cy="22" rx="3" ry="4" fill="#1F2937" />
      <circle cx="14.5" cy="21" r="1" fill="white" />
      <circle cx="26.5" cy="21" r="1" fill="white" />

      {/* Nose */}
      <ellipse cx="20" cy="29" rx="3" ry="2" fill="#1F2937" />

      {/* Mouth */}
      <path d="M17 32 Q20 35 23 32" fill="none" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
