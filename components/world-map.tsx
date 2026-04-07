"use client"

import { useRef, useCallback, useState } from "react"
import useSWR from "swr"
import { FoxToken } from "./fox-token"
import { MissionNode } from "./mission-node"
import { MapBackground } from "./map-background"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

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

type MissionCard = {
  id: string
  zone: string
  title: string
  problem: string
  challenge: string
  deliverable: string
  resource_link?: { label: string; url: string }
  bonus?: string
  questions?: string[]
  presentation?: string
  steps?: string[]
  repository_structure?: Record<string, string>
  data?: unknown
  example?: string
  map?: string[]
  blocked?: string[]
  message?: string
  hint?: string
  dataset?: unknown
  test_cases?: string[]
}

type MissionTheme = {
  dialogClass: string
  dialogTitleClass: string
  dialogDescriptionClass: string
  zonePillClass: string
  cardClass: string
  cardHeaderClass: string
  dataBoxClass: string
}

const MISSION_CARDS: Record<string, MissionCard> = {
  start: {
    id: "start",
    zone: "Start",
    title: "Start – Setup GitHub",
    problem: "Antes de comenzar la aventura, cada equipo necesita preparar su base de operaciones usando GitHub.",
    challenge: "Configurar un repositorio donde guardaran todas las soluciones de las misiones.",
    steps: [
      "Crear una cuenta en GitHub si aun no tienen una",
      "Un miembro del equipo crea un repositorio nuevo llamado hackhexa-team-[nombre-del-equipo]",
      "Invitar a las demas integrantes del equipo como colaboradoras",
      "Crear un archivo README.md con el nombre del equipo",
      "Hacer el primer commit al repositorio",
    ],
    repository_structure: {
      "README.md": "Descripcion del equipo y del proyecto",
      "sensor-forest": "Retos de sensores",
      "traffic-city": "Retos de rutas",
      "code-vault": "Retos de codigo",
      "ai-lab": "Retos de machine learning",
    },
    deliverable: "Compartir el enlace del repositorio con los organizadores.",
    resource_link: {
      label: "Video resource",
      url: "https://www.youtube.com",
    },
    bonus: "Agregar una pequena descripcion del equipo y sus integrantes en el README.",
  },
  "sensor-1": {
    id: "sensor-1",
    zone: "Sensor Forest",
    title: "Sensor 1 – Identificar Variables",
    problem: "Los sensores de la ciudad detectan muchas señales, pero el sistema no sabe cuáles son realmente importantes.",
    data: {
      temperatura: ["alta", "baja"],
      movimiento: ["si", "no"],
      luz: ["si", "no"],
      ruido: ["alto", "bajo"],
    },
    challenge: "Decidan qué variables usarían para detectar actividad sospechosa en la ciudad y cuáles pueden ignorarse.",
    deliverable:
      "Crear un archivo en su repo llamado sensor-variables.md donde expliquen las variables elegidas, por qué son importantes y un ejemplo de uso.",
    bonus: "Escribir una función simple en pseudocódigo que reciba estas variables.",
  },
  "sensor-2": {
    id: "sensor-2",
    zone: "Sensor Forest",
    title: "Sensor 2 – Crear Reglas",
    problem: "El sistema necesita decidir cuándo una zona puede ser peligrosa.",
    challenge: "Diseñar al menos 3 reglas usando las variables de los sensores.",
    example: "SI movimiento = si Y luz = no → actividad sospechosa",
    deliverable: "Crear sensor-rules.md en su repo con las reglas y ejemplos.",
    bonus: "Representar las reglas en pseudocódigo.",
  },
  "sensor-3": {
    id: "sensor-3",
    zone: "Sensor Forest",
    title: "Sensor 3 – Probar el Sistema",
    problem: "Ahora debemos probar si las reglas funcionan.",
    data: [
      { caso: "A", temperatura: "baja", movimiento: "si", luz: "no" },
      { caso: "B", temperatura: "alta", movimiento: "no", luz: "si" },
    ],
    challenge: "Usar sus reglas para decidir si cada caso es seguro o sospechoso.",
    deliverable: "Agregar los resultados y explicación en sensor-tests.md.",
    bonus: "Crear un pequeño script que evalúe los casos automáticamente.",
  },
  "traffic-1": {
    id: "traffic-1",
    zone: "Traffic City",
    title: "Traffic 1 – Encontrar Patrones",
    problem: "El tráfico de la ciudad sigue ciertos patrones durante el día.",
    data: {
      "8:00": "alto",
      "9:00": "alto",
      "10:00": "medio",
      "11:00": "bajo",
    },
    challenge: "Detectar el patrón y decidir cuál es el mejor momento para moverse por la ciudad.",
    deliverable: "Crear traffic-pattern.md explicando el patrón detectado.",
    bonus: "Graficar los datos usando cualquier herramienta.",
  },
  "traffic-2": {
    id: "traffic-2",
    zone: "Traffic City",
    title: "Traffic 2 – Diseñar una Ruta",
    problem: "El zorro debe moverse por la ciudad evitando zonas bloqueadas.",
    map: ["A --- B --- C", "|     |     |", "D --- E --- F"],
    blocked: ["B"],
    challenge: "Encontrar una ruta de A a F sin pasar por B.",
    deliverable: "Crear route-design.md explicando la ruta elegida.",
    bonus: "Expresar la ruta como lista de pasos.",
  },
  "traffic-3": {
    id: "traffic-3",
    zone: "Traffic City",
    title: "Traffic 3 – Optimizar la Ruta",
    problem: "La ruta actual repite caminos innecesarios.",
    example: "A → D → E → B → C → F",
    challenge: "Encontrar una ruta más corta posible entre A y F.",
    deliverable: "Crear route-optimization.md explicando la nueva ruta.",
    bonus: "Comparar ambas rutas y explicar cuál es más eficiente.",
  },
  "vault-1": {
    id: "vault-1",
    zone: "Code Vault",
    title: "Vault 1 – Descifrar el Mensaje",
    problem: "Un mensaje secreto fue cifrado.",
    message: "KHOOR",
    hint: "Cada letra fue movida 3 posiciones en el alfabeto.",
    challenge: "Descifrar el mensaje original.",
    deliverable: "Crear decode-1.md explicando cómo descifraron el mensaje.",
    bonus: "Escribir pseudocódigo para descifrar mensajes similares.",
  },
  "vault-2": {
    id: "vault-2",
    zone: "Code Vault",
    title: "Vault 2 – Detectar la Regla",
    problem: "Otro mensaje fue cifrado usando una regla desconocida.",
    example: "HOLA → IPMB",
    challenge: "Descubrir la regla usada para transformar el mensaje.",
    deliverable: "Crear decode-rule.md explicando la lógica encontrada.",
    bonus: "Probar la regla con otra palabra.",
  },
  "vault-3": {
    id: "vault-3",
    zone: "Code Vault",
    title: "Vault 3 – Crear el Algoritmo",
    problem: "Ahora que conocen la regla, el sistema necesita un algoritmo.",
    challenge: "Escribir los pasos para descifrar cualquier mensaje con esta regla.",
    deliverable: "Crear decoder-algorithm.md con los pasos o pseudocódigo.",
    bonus: "Implementarlo en Python o JavaScript.",
  },
  "ai-1": {
    id: "ai-1",
    zone: "AI Lab",
    title: "AI 1 – Aprender de Ejemplos",
    problem: "El sistema necesita aprender a clasificar emociones.",
    dataset: [
      { emoji: "🙂", sentiment: "positivo" },
      { emoji: "😭", sentiment: "negativo" },
      { emoji: "😡", sentiment: "negativo" },
      { emoji: "😎", sentiment: "positivo" },
    ],
    challenge: "Encontrar el patrón que separa emociones positivas de negativas.",
    deliverable: "Crear ai-pattern.md explicando el patrón encontrado.",
    bonus: "Agregar más ejemplos al dataset.",
  },
  "ai-2": {
    id: "ai-2",
    zone: "AI Lab",
    title: "AI 2 – Predecir Nuevos Casos",
    problem: "Ahora el sistema debe clasificar nuevos emojis.",
    test_cases: ["😃", "😤", "😐"],
    challenge: "Predecir si cada emoji es positivo o negativo usando su modelo.",
    deliverable: "Crear ai-predictions.md con sus predicciones y explicación.",
    bonus: "Crear una regla automática para clasificar.",
  },
  "ai-core": {
    id: "ai-core",
    zone: "AI Core",
    title: "AI Core – Misión Final",
    problem: "El sistema de la ciudad debe integrarlo todo.",
    challenge:
      "Diseñar un sistema que combine sensores, rutas, descifrado y clasificación para ayudar al zorro a mantener segura la ciudad.",
    deliverable: "Crear final-system.md explicando cómo conectaron todas las partes.",
    bonus: "Proponer mejoras al sistema.",
  },
  finish: {
    id: "finish",
    zone: "Finish",
    title: "🏁 Mission Complete - Save the System",
    problem: "El zorro ha recorrido toda la ciudad. Ahora es momento de explicar como lograron restaurar el sistema.",
    challenge: "Preparar una breve explicacion de como su equipo resolvio los retos y como conectaron todas las partes del sistema.",
    questions: [
      "Como detecta su sistema actividad usando sensores?",
      "Como decide el zorro que ruta tomar?",
      "Como descifran mensajes en el Code Vault?",
      "Como clasifica emociones su modelo de AI?",
    ],
    deliverable: "Crear un archivo final-system.md en su repositorio explicando su solucion completa.",
    presentation: "Cada equipo tendra 1-2 minutos para explicar su sistema al resto del grupo.",
    bonus: "Que mejorarian si tuvieran mas tiempo?",
  },
}

const NODE_TO_MISSION_ID: Record<string, string> = {
  start: "start",
  "forest-1": "sensor-1",
  "forest-2": "sensor-2",
  "forest-3": "sensor-3",
  "city-1": "traffic-1",
  "city-2": "traffic-2",
  "city-3": "traffic-3",
  "vault-1": "vault-1",
  "vault-2": "vault-2",
  "vault-3": "vault-3",
  "ai-1": "ai-1",
  "ai-2": "ai-2",
  "ai-final": "ai-core",
  finish: "finish",
}

const DEFAULT_MISSION_THEME: MissionTheme = {
  dialogClass: "border-slate-400 bg-slate-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
  dialogTitleClass: "text-slate-900",
  dialogDescriptionClass: "text-slate-700",
  zonePillClass: "bg-slate-100 text-slate-800",
  cardClass: "border-slate-300 bg-white text-slate-900 gap-0 py-0 overflow-hidden",
  cardHeaderClass: "bg-slate-200 rounded-t-xl",
  dataBoxClass: "bg-white border border-slate-200 text-slate-800",
}

const MISSION_THEME_BY_ZONE: Record<string, MissionTheme> = {
  "Sensor Forest": {
    dialogClass: "border-green-500 bg-green-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-green-900",
    dialogDescriptionClass: "text-green-800",
    zonePillClass: "bg-green-100 text-green-800",
    cardClass: "border-green-300 bg-green-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-green-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-green-200 text-slate-800",
  },
  "Traffic City": {
    dialogClass: "border-blue-500 bg-blue-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-blue-900",
    dialogDescriptionClass: "text-blue-800",
    zonePillClass: "bg-blue-100 text-blue-800",
    cardClass: "border-blue-300 bg-blue-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-blue-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-blue-200 text-slate-800",
  },
  "Code Vault": {
    dialogClass: "border-purple-500 bg-purple-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-purple-900",
    dialogDescriptionClass: "text-purple-800",
    zonePillClass: "bg-purple-100 text-purple-800",
    cardClass: "border-purple-300 bg-purple-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-purple-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-purple-200 text-slate-800",
  },
  "AI Lab": {
    dialogClass: "border-cyan-500 bg-cyan-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-cyan-900",
    dialogDescriptionClass: "text-cyan-800",
    zonePillClass: "bg-cyan-100 text-cyan-800",
    cardClass: "border-cyan-300 bg-cyan-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-cyan-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-cyan-200 text-slate-800",
  },
  "AI Core": {
    dialogClass: "border-cyan-500 bg-cyan-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-cyan-900",
    dialogDescriptionClass: "text-cyan-800",
    zonePillClass: "bg-cyan-100 text-cyan-800",
    cardClass: "border-cyan-300 bg-cyan-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-cyan-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-cyan-200 text-slate-800",
  },
  Finish: {
    dialogClass: "border-amber-500 bg-amber-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-amber-900",
    dialogDescriptionClass: "text-amber-800",
    zonePillClass: "bg-amber-100 text-amber-800",
    cardClass: "border-amber-300 bg-amber-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-amber-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-amber-200 text-slate-800",
  },
}

export function WorldMap() {
  const [draggingTeam, setDraggingTeam] = useState<string | null>(null)
  const [activeNode, setActiveNode] = useState<MissionNodeData | null>(null)
  
  const { data: nodes, mutate: mutateNodes } = useSWR<MissionNodeData[]>("/api/nodes", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
  })
  const { data: teams, mutate: mutateTeams } = useSWR<TeamToken[]>("/api/teams", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
  })

  const handleDragEnd = useCallback(() => {
    setDraggingTeam(null)
  }, [])
  const mapRef = useRef<HTMLDivElement>(null)
  const activeMission = activeNode ? MISSION_CARDS[NODE_TO_MISSION_ID[activeNode.id]] : null
  const missionTheme = activeMission ? MISSION_THEME_BY_ZONE[activeMission.zone] ?? DEFAULT_MISSION_THEME : DEFAULT_MISSION_THEME

  const handleTeamDrop = useCallback(
    async (teamId: string, nodeId: string) => {
      if (!teams) return

      const previousTeams = teams
      const optimisticTeams = teams.map((team) => (team.id === teamId ? { ...team, currentNodeId: nodeId } : team))
      mutateTeams(optimisticTeams, false)

      try {
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", teamId, updates: { currentNodeId: nodeId } }),
        })

        if (!res.ok) {
          throw new Error(`Team drop failed with status ${res.status}`)
        }

        const updatedTeams = (await res.json()) as TeamToken[]
        await mutateTeams(updatedTeams, false)
      } catch (error) {
        console.error("Failed to update team:", error)
        await mutateTeams(previousTeams, false)
      }
    },
    [teams, mutateTeams]
  )

  const handleTeamNameChange = useCallback(
    async (teamId: string, newName: string) => {
      if (!teams) return

      const previousTeams = teams
      const optimisticTeams = teams.map((team) => (team.id === teamId ? { ...team, name: newName } : team))
      mutateTeams(optimisticTeams, false)

      try {
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", teamId, updates: { name: newName } }),
        })

        if (!res.ok) {
          throw new Error(`Team rename failed with status ${res.status}`)
        }

        const updatedTeams = (await res.json()) as TeamToken[]
        await mutateTeams(updatedTeams, false)
      } catch (error) {
        console.error("Failed to rename team:", error)
        await mutateTeams(previousTeams, false)
      }
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

    const previousTeams = teams
    mutateTeams([...teams, newTeam], false)

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", team: newTeam }),
      })

      if (!res.ok) {
        throw new Error(`Team add failed with status ${res.status}`)
      }

      const updatedTeams = (await res.json()) as TeamToken[]
      await mutateTeams(updatedTeams, false)
    } catch (error) {
      console.error("Failed to add team:", error)
      await mutateTeams(previousTeams, false)
    }
  }, [teams, mutateTeams])

  const removeTeam = useCallback(
    async (teamId: string) => {
      if (!teams) return

      const previousTeams = teams
      const optimisticTeams = teams.filter((team) => team.id !== teamId)
      mutateTeams(optimisticTeams, false)

      try {
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove", teamId }),
        })

        if (!res.ok) {
          throw new Error(`Team remove failed with status ${res.status}`)
        }

        const updatedTeams = (await res.json()) as TeamToken[]
        await mutateTeams(updatedTeams, false)
      } catch (error) {
        console.error("Failed to remove team:", error)
        await mutateTeams(previousTeams, false)
      }
    },
    [teams, mutateTeams]
  )

  const resetGame = useCallback(async () => {
    const nodesRes = await fetch("/api/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    })
    if (nodesRes.ok) {
      const updatedNodes = (await nodesRes.json()) as MissionNodeData[]
      await mutateNodes(updatedNodes, false)
    } else {
      await mutateNodes()
    }

    const teamsRes = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    })
    if (teamsRes.ok) {
      const updatedTeams = (await teamsRes.json()) as TeamToken[]
      await mutateTeams(updatedTeams, false)
    } else {
      await mutateTeams()
    }
  }, [mutateNodes, mutateTeams])

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
    Q 93.5 45.4, 96.2 42.5
  `

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
      <MapBackground />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255, 220, 100, 0.3)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255, 220, 100, 0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0 3"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#FEF3C7"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0.15 2.5"
        />
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

      {nodes?.map((node) => (
        <MissionNode
          key={node.id}
          node={node}
          onClick={() => setActiveNode(node)}
          onDrop={(teamId) => handleTeamDrop(teamId, node.id)}
          isDropTarget={draggingTeam !== null}
        />
      ))}

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

      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-30 px-6 py-2 rounded-2xl bg-black/20 backdrop-blur-[2px]">
        <h1 className="text-5xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] font-sans tracking-wide">
          HackHexa: Fox Mission
        </h1>
        <p className="text-xl text-white/95 mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] font-sans">
          Guide your fox through the tech adventure!
        </p>
      </div>

      <div className="absolute top-[26%] left-[10%] text-center z-10">
        <span className="px-4 py-2 bg-forest-green/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          Sensor Forest
        </span>
      </div>
      <div className="absolute top-[26%] left-[35%] text-center z-10">
        <span className="px-4 py-2 bg-city-blue/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          Traffic City
        </span>
      </div>
      <div className="absolute top-[26%] left-[58%] text-center z-10">
        <span className="px-4 py-2 bg-vault-purple/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          Code Vault
        </span>
      </div>
      <div className="absolute top-[26%] left-[80%] text-center z-10">
        <span className="px-4 py-2 bg-ai-cyan/80 rounded-full text-foreground text-lg font-semibold shadow-lg">
          AI Core
        </span>
      </div>

      <button
        onClick={addNewTeam}
        className="absolute bottom-6 right-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-lg shadow-lg hover:scale-105 transition-transform z-20"
      >
        + Add Team
      </button>

      <button
        onClick={resetGame}
        className="absolute bottom-6 right-48 px-4 py-3 bg-destructive text-destructive-foreground rounded-full font-semibold text-sm shadow-lg hover:scale-105 transition-transform z-20"
      >
        Reset Game
      </button>

      <div className="absolute top-6 right-6 px-3 py-1 bg-card/80 backdrop-blur-sm rounded-full text-sm text-card-foreground z-20">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
        Synced
      </div>

      <Dialog open={activeNode !== null} onOpenChange={(open) => !open && setActiveNode(null)}>
        <DialogContent className={`max-w-3xl max-h-[85vh] overflow-y-auto ${missionTheme.dialogClass}`}>
          <DialogHeader>
            <DialogTitle className={missionTheme.dialogTitleClass}>{activeMission?.title ?? activeNode?.label ?? "Challenge"}</DialogTitle>
            <DialogDescription className={missionTheme.dialogDescriptionClass}>
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${missionTheme.zonePillClass}`}>
                {activeMission?.zone ?? activeNode?.zone ?? ""}
              </span>
            </DialogDescription>
          </DialogHeader>

          {activeNode && activeMission && (
            <div className="space-y-4">
              <Card className={missionTheme.cardClass}>
                <CardHeader className={missionTheme.cardHeaderClass}>
                  <CardTitle>Problema</CardTitle>
                </CardHeader>
                <CardContent className="text-sm py-6">{activeMission.problem}</CardContent>
              </Card>

              {(Boolean(activeMission.data) || Boolean(activeMission.dataset) || Boolean(activeMission.map) || Boolean(activeMission.test_cases)) && (
                <Card className={missionTheme.cardClass}>
                  <CardHeader className={missionTheme.cardHeaderClass}>
                    <CardTitle>Datos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm py-6">
                    {Boolean(activeMission.data) && (
                      <pre className={`rounded-md p-3 overflow-x-auto text-xs ${missionTheme.dataBoxClass}`}>{JSON.stringify(activeMission.data, null, 2)}</pre>
                    )}
                    {Boolean(activeMission.dataset) && (
                      <pre className={`rounded-md p-3 overflow-x-auto text-xs ${missionTheme.dataBoxClass}`}>{JSON.stringify(activeMission.dataset, null, 2)}</pre>
                    )}
                    {activeMission.map && (
                      <pre className={`rounded-md p-3 overflow-x-auto text-xs ${missionTheme.dataBoxClass}`}>{activeMission.map.join("\n")}</pre>
                    )}
                    {activeMission.test_cases && <p>Casos de prueba: {activeMission.test_cases.join(", ")}</p>}
                    {activeMission.blocked && <p>Zonas bloqueadas: {activeMission.blocked.join(", ")}</p>}
                    {activeMission.message && <p>Mensaje: {activeMission.message}</p>}
                    {activeMission.hint && <p>Pista: {activeMission.hint}</p>}
                    {activeMission.example && <p>Ejemplo: {activeMission.example}</p>}
                  </CardContent>
                </Card>
              )}

              {(Boolean(activeMission.steps) || Boolean(activeMission.repository_structure)) && (
                <Card className={missionTheme.cardClass}>
                  <CardHeader className={missionTheme.cardHeaderClass}>
                    <CardTitle>Instrucciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm py-6">
                    {activeMission.steps && (
                      <ol className="list-decimal pl-5 space-y-1">
                        {activeMission.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    )}
                    {activeMission.repository_structure && (
                      <div>
                        <p className="font-semibold mb-2">Estructura sugerida del repositorio</p>
                        <div className={`rounded-md p-3 overflow-x-auto text-xs ${missionTheme.dataBoxClass}`}>
                          {Object.entries(activeMission.repository_structure).map(([name, description]) => (
                            <p key={name}>
                              <span className="font-semibold">{name}</span>: {description}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {Boolean(activeMission.questions) && (
                <Card className={missionTheme.cardClass}>
                  <CardHeader className={missionTheme.cardHeaderClass}>
                    <CardTitle>Preguntas guia</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm py-6">
                    <ul className="list-disc pl-5 space-y-1">
                      {activeMission.questions?.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className={missionTheme.cardClass}>
                <CardHeader className={missionTheme.cardHeaderClass}>
                  <CardTitle>Reto</CardTitle>
                </CardHeader>
                <CardContent className="text-sm py-6">{activeMission.challenge}</CardContent>
              </Card>

              <Card className={missionTheme.cardClass}>
                <CardHeader className={missionTheme.cardHeaderClass}>
                  <CardTitle>Entregable</CardTitle>
                </CardHeader>
                <CardContent className="text-sm py-6 space-y-2">
                  <p>{activeMission.deliverable}</p>
                  {activeMission.presentation && (
                    <p>
                      <span className="font-semibold">Presentacion:</span> {activeMission.presentation}
                    </p>
                  )}
                  {activeMission.resource_link && (
                    <p>
                      Recurso: {" "}
                      <a
                        href={activeMission.resource_link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-semibold"
                      >
                        {activeMission.resource_link.label}
                      </a>
                    </p>
                  )}
                </CardContent>
              </Card>

              {activeMission.bonus && (
                <Card className={missionTheme.cardClass}>
                  <CardHeader className={missionTheme.cardHeaderClass}>
                    <CardTitle>Bonus</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm py-6">{activeMission.bonus}</CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
