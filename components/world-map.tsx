"use client"

import { useRef, useCallback, useMemo, useState } from "react"
import useSWR from "swr"
import { FoxToken } from "./fox-token"
import { MissionNode } from "./mission-node"
import { MapBackground } from "./map-background"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

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

type MissionVersion = {
  name: "basica" | "hardcore"
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

type MissionCard = {
  id: string
  zone: string
  title: string
  versions: MissionVersion[]
}

type MissionTheme = {
  dialogClass: string
  dialogTitleClass: string
  dialogDescriptionClass: string
  zonePillClass: string
  cardClass: string
  cardHeaderClass: string
  dataBoxClass: string
  tabsListClass: string
  tabsTriggerActiveClass: string
  tabsTriggerInactiveClass: string
}

const MISSION_CARDS: Record<string, MissionCard> = {
  start: {
    id: "start",
    zone: "Start",
    title: "Start – Setup GitHub",
    versions: [
      {
        name: "basica",
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
      {
        name: "hardcore",
        problem: "",
        challenge: "",
        deliverable: "",
      },
    ],
  },
  "sensor-1": {
    id: "sensor-1",
    zone: "Sensor Forest",
    title: "Sensor 1 – Identificar Variables",
    versions: [
      {
        name: "basica",
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
      {
        name: "hardcore",
        problem: "Se crearán nuevos sensores en la ciudad para detectar señales adicionales.",
        challenge: "Decidan qué variables detectarán los sensores y qué niveles detectan para esas variables. Se deja un ejemplo.",
        data: {
          temperatura: ["alta", "baja"],
        },
        deliverable: "Crear un archivo en su repo llamado sensor-variables.md donde expliquen las variables elegidas, por qué son importantes y un ejemplo de uso.",
        bonus: "Escribir las variables en el mismo formato que el ejemplo.",
      },
    ],
  },
  "sensor-2": {
    id: "sensor-2",
    zone: "Sensor Forest",
    title: "Sensor 2 – Crear Reglas",
    versions: [
      {
        name: "basica",
        problem: "El sistema necesita decidir cuándo una zona puede ser peligrosa.",
        challenge: "Diseñar al menos 3 reglas usando las variables de los sensores.",
        data: "Aquí se muestran los datos del problema.",
        example: "SI movimiento = si Y luz = no → actividad sospechosa",
        deliverable: "Crear sensor-rules.md en su repo con las reglas y ejemplos.",
        bonus: "Representar las reglas en pseudocódigo.",
      },
        {
        name: "hardcore",
        problem: "El sistema necesita evaluar situaciones potencialmente peligrosas considerando múltiples sensores al mismo tiempo.",
        challenge: "Diseñar al menos 3 reglas que combinen usando las variables de los sensores y asigna prioridad a cada regla. 1 es la prioridad más baja, 5 la prioridad más importante.",
        data: "Aquí se muestran los datos del problema.",
        example:  
        "SI movimiento = si y luz = no → Si prioridad > 3 → Enviar alerta. ",
        deliverable: "Crear 'sensor-rules.md' en su repo con las reglas y al menos 2 ejemplos por regla.",
        bonus: "¿Cómo debería hacer el sistema para detectar la prioridad de cada regla?",
    },  
    ],
  },
  "sensor-3": {
    id: "sensor-3",
    zone: "Sensor Forest",
    title: "Sensor 3 – Probar el Sistema",
    versions: [
      {
        name: "basica",
        problem: "Ahora debemos probar si las reglas funcionan.",
        data: [
          { caso: "A", temperatura: "baja", movimiento: "si", luz: "no" },
          { caso: "B", temperatura: "alta", movimiento: "no", luz: "si" },
        ],
        challenge: "Usar sus reglas para decidir si cada caso es seguro o sospechoso.",
        deliverable: "Agregar los resultados y explicación en sensor-tests.md.",
        bonus: "Crear un pequeño script que evalúe los casos automáticamente.",
      },
      {
        name: "hardcore",
        problem: "Antes de implementar el sistema en la ciudad, debes probar que funciona.",
        data: [
          { caso: "A", temperatura: "baja", movimiento: "si", luz: "no", resultado: "No alerta" },
          { caso: "B", temperatura: "alta", movimiento: "si", luz: "no", resultado: "Alerta" },
        ],
        challenge: "Crea pruebas para evaluar el sistema. Asegúrate de añadir pruebas donde el sistema debería mostrar una alerta y donde no debería. Se muestra un ejemplo.",
        deliverable: "Agregar las pruebas propuestas en sensor-tests.md.",
        bonus: "¿El sistema que crearon en el reto anterior funciona para las pruebas que propusieron? Si no, ¿Es posible arreglar el error sin hacer el sistema desde cero?",
      },
    ],
  },
  "traffic-1": {
    id: "traffic-1",
    zone: "Traffic City",
    title: "Traffic 1 – Encontrar Patrones",
    versions: [
      {
        name: "basica",
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
        {
          name: "hardcore",
          problem: "La movilidad en la ciudad depende de múltiples factores como tráfico, temperatura y condiciones ambientales durante el día.",
          data: {
            "8:00": { "trafico": "alto", "temperatura": "18°C", "clima": "nublado" },
            "9:00": { "trafico": "alto", "temperatura": "20°C", "clima": "soleado" },
            "10:00": { "trafico": "medio", "temperatura": "23°C", "clima": "soleado" },
            "11:00": { "trafico": "bajo", "temperatura": "26°C", "clima": "soleado" }
          },
          challenge: "Detectar patrones considerando y decidir cuál es el mejor momento para moverse por la ciudad.",
          deliverable: "Crear 'mobility-pattern.md' explicando el patrón detectado y justificando la mejor hora.",
          bonus: "Graficar al menos dos variables (por ejemplo, tráfico y temperatura) y analizar su relación."
        }
    ],
  },
  "traffic-2": {
    id: "traffic-2",
    zone: "Traffic City",
    title: "Traffic 2 – Diseñar una Ruta",
    versions: [
      {
        name: "basica",
        problem: "El zorro debe moverse por la ciudad evitando zonas bloqueadas.",
        map: ["A --- B --- C", "|     |     |", "D --- E --- F"],
        blocked: ["B"],
        challenge: "Encontrar una ruta de A a F sin pasar por B.",
        deliverable: "Crear route-design.md explicando la ruta elegida.",
        bonus: "Expresar la ruta como lista de pasos.",
      },
      {
        name: "hardcore",
        problem: "Muchos camiones deben llevar mercancía de ciudad A a ciudad K pasando por diferentes rutas.",
        map: [
        "A --- B --- C", 
        "|     |     |", 
        "D ----+---- F", 
        "|     |     |", 
        "| --- H --- I", 
        "|     |     |", 
        "J --- K --- L", ],
        challenge: "Ayúdanos a encontrar todos los caminos que puedas de A a K.",
        deliverable: "Crear route-design.md mostrando las rutas encontradas.",
        bonus: "Encuentra el camino más corto de ciudad A a ciudad K.",
      },
    ],
  },
  "traffic-3": {
    id: "traffic-3",
    zone: "Traffic City",
    title: "Traffic 3 – Optimizar la Ruta",
    versions: [
      {
        name: "basica",
        problem: "La ruta actual repite caminos innecesarios.",
        example: "A → D → E → B → C → F",
        challenge: "Encontrar una ruta más corta posible entre A y F.",
        data: "Aquí se muestran los datos del problema",
        deliverable: "Crear route-optimization.md explicando la nueva ruta.",
        bonus: "Comparar ambas rutas y explicar cuál es más eficiente.",
      },
      {
        name: "hardcore",
        problem: "",
        data: "Aquí se muestran los datos del problema",
        challenge: "",
        deliverable: "",
      },
    ],
  },
  "vault-1": {
    id: "vault-1",
    zone: "Code Vault",
    title: "Vault 1 – Descifrar el Mensaje",
    versions: [
      {
        name: "basica",
        problem: "Un mensaje secreto fue cifrado.",
        message: "IPMB NVOEP",
        data: "Aquí se muestran los datos del problema",
        hint: "¿César?",
        challenge: "Descifrar el mensaje original.",
        deliverable: "Crear decode-1.md explicando cómo descifraron el mensaje.",
        bonus: "Escribir pseudocódigo para descifrar mensajes similares.",
      },
      {
        name: "hardcore",
        problem: "Un mensaje secreto fue cifrado.",
        message: "JPAS ZIMFP",
        data: "Aquí se muestran los datos del problema",
        hint: "Mira tu teclado.",
        challenge: "Descifrar el mensaje original.",
        deliverable: "Crear decode-1.md explicando cómo descifraron el mensaje.",
        bonus: "Escribir pseudocódigo para descifrar mensajes similares.",
      },

    ],
  },
  "vault-2": {
    id: "vault-2",
    zone: "Code Vault",
    title: "Vault 2 – Detectar la Regla",
    versions: [
      {
        name: "basica",
        problem: "Otro mensaje fue cifrado usando una regla desconocida.",
        message: "HOLA → IPMB",
        data: "Aquí se muestran los datos del problema",
        challenge: "Descubrir la regla usada para transformar el mensaje.",
        deliverable: "Crear decode-rule.md explicando la lógica encontrada.",
        bonus: "Probar la regla con otra palabra.",
      },
      {
        name: "hardcore",
        data: "Aquí se muestran los datos del problema",
        problem: "Otro mensaje fue cifrado usando una regla desconocida.",
        challenge: "Muestra cuál es el mensaje descifrado.",
        deliverable: "",
      },
    ],
  },
  "vault-3": {
    id: "vault-3",
    zone: "Code Vault",
    title: "Vault 3 – Crear el Algoritmo",
    versions: [
      {
        name: "basica",
        problem: "Ahora que conocen la regla, el sistema necesita un algoritmo.",
        challenge: "Escribir los pasos para descifrar cualquier mensaje con esta regla.",
        data: "Aquí se muestran los datos del problema",
        deliverable: "Crear decoder-algorithm.md con los pasos o pseudocódigo.",
        bonus: "Implementarlo en Python o JavaScript.",
      },
      {
        name: "hardcore",
        problem: "",
        data: [],
        challenge: "",
        deliverable: "",
      },
    ],
  },
  "ai-1": {
    id: "ai-1",
    zone: "AI Lab",
    title: "AI 1 – Aprender de Ejemplos",
    versions: [
      {
        name: "basica",
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
      {
        name: "hardcore",
        problem: "",
        challenge: "",
        deliverable: "",
      },
    ],
  },
  "ai-2": {
    id: "ai-2",
    zone: "AI Lab",
    title: "AI 2 – Predecir Nuevos Casos",
    versions: [
      {
        name: "basica",
        problem: "Ahora el sistema debe clasificar nuevos emojis.",
        test_cases: ["😃", "😤", "😐"],
        challenge: "Predecir si cada emoji es positivo o negativo usando su modelo.",
        deliverable: "Crear ai-predictions.md con sus predicciones y explicación.",
        bonus: "Crear una regla automática para clasificar.",
      },
      {
        name: "hardcore",
        problem: "",
        challenge: "",
        deliverable: "",
      },
    ],
  },
  "ai-core": {
    id: "ai-core",
    zone: "AI Core",
    title: "AI Core – Misión Final",
    versions: [
      {
        name: "basica",
        problem: "El sistema de la ciudad debe integrarlo todo.",
        challenge:
          "Diseñar un sistema que combine sensores, rutas, descifrado y clasificación para ayudar al zorro a mantener segura la ciudad.",
        deliverable: "Crear final-system.md explicando cómo conectaron todas las partes.",
        bonus: "Proponer mejoras al sistema.",
      },
      {
        name: "hardcore",
        problem: "",
        challenge: "",
        deliverable: "",
      },
    ],
  },
  finish: {
    id: "finish",
    zone: "Finish",
    title: "🏁 Mission Complete - Save the System",
    versions: [
      {
        name: "basica",
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
      {
        name: "hardcore",
        problem: "",
        challenge: "",
        deliverable: "",
      },
    ],
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
  tabsListClass: "bg-slate-100",
  tabsTriggerActiveClass: "!bg-slate-200 !text-slate-900",
  tabsTriggerInactiveClass: "bg-slate-50 text-black",
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
    tabsListClass: "bg-green-100",
    tabsTriggerActiveClass: "!bg-green-200 !text-green-900",
    tabsTriggerInactiveClass: "bg-green-50 text-black",
  },
  "Traffic City": {
    dialogClass: "border-blue-500 bg-blue-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-blue-900",
    dialogDescriptionClass: "text-blue-800",
    zonePillClass: "bg-blue-100 text-blue-800",
    cardClass: "border-blue-300 bg-blue-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-blue-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-blue-200 text-slate-800",
    tabsListClass: "bg-blue-100",
    tabsTriggerActiveClass: "!bg-blue-200 !text-blue-900",
    tabsTriggerInactiveClass: "bg-blue-50 text-black",
  },
  "Code Vault": {
    dialogClass: "border-purple-500 bg-purple-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-purple-900",
    dialogDescriptionClass: "text-purple-800",
    zonePillClass: "bg-purple-100 text-purple-800",
    cardClass: "border-purple-300 bg-purple-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-purple-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-purple-200 text-slate-800",
    tabsListClass: "bg-purple-100",
    tabsTriggerActiveClass: "!bg-purple-200 !text-purple-900",
    tabsTriggerInactiveClass: "bg-purple-50 text-black",
  },
  "AI Lab": {
    dialogClass: "border-cyan-500 bg-cyan-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-cyan-900",
    dialogDescriptionClass: "text-cyan-800",
    zonePillClass: "bg-cyan-100 text-cyan-800",
    cardClass: "border-cyan-300 bg-cyan-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-cyan-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-cyan-200 text-slate-800",
    tabsListClass: "bg-cyan-100",
    tabsTriggerActiveClass: "!bg-cyan-200 !text-cyan-900",
    tabsTriggerInactiveClass: "bg-cyan-50 text-black",
  },
  "AI Core": {
    dialogClass: "border-cyan-500 bg-cyan-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-cyan-900",
    dialogDescriptionClass: "text-cyan-800",
    zonePillClass: "bg-cyan-100 text-cyan-800",
    cardClass: "border-cyan-300 bg-cyan-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-cyan-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-cyan-200 text-slate-800",
    tabsListClass: "bg-cyan-100",
    tabsTriggerActiveClass: "!bg-cyan-200 !text-cyan-900",
    tabsTriggerInactiveClass: "bg-cyan-50 text-black",
  },
  Finish: {
    dialogClass: "border-amber-500 bg-amber-100/95 text-slate-900 shadow-2xl backdrop-blur-md",
    dialogTitleClass: "text-amber-900",
    dialogDescriptionClass: "text-amber-800",
    zonePillClass: "bg-amber-100 text-amber-800",
    cardClass: "border-amber-300 bg-amber-50/95 text-slate-900 gap-0 py-0 overflow-hidden",
    cardHeaderClass: "bg-amber-200 rounded-t-xl",
    dataBoxClass: "bg-white border border-amber-200 text-slate-800",
    tabsListClass: "bg-amber-100",
    tabsTriggerActiveClass: "!bg-amber-200 !text-amber-900",
    tabsTriggerInactiveClass: "bg-amber-50 text-black",
  },
}

export function WorldMap() {
  const [draggingTeam, setDraggingTeam] = useState<string | null>(null)
  const [activeNode, setActiveNode] = useState<MissionNodeData | null>(null)
  const [activeVersion, setActiveVersion] = useState<"basica" | "hardcore">("basica")
  
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
  const currentMissionVersion = activeMission?.versions.find((v) => v.name === activeVersion)

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

  const teamsByNodeId = useMemo(() => {
    if (!teams) {
      return {} as Record<string, TeamToken[]>
    }

    return teams.reduce<Record<string, TeamToken[]>>((acc, team) => {
      if (!acc[team.currentNodeId]) {
        acc[team.currentNodeId] = []
      }
      acc[team.currentNodeId].push(team)
      return acc
    }, {})
  }, [teams])

  const visibleTeams = useMemo(() => {
    if (!teams) {
      return [] as TeamToken[]
    }

    return teams.filter((team) => {
      const teamsAtNode = teamsByNodeId[team.currentNodeId] ?? []
      return teamsAtNode.length <= 3
    })
  }, [teams, teamsByNodeId])

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
          onClick={() => {
            setActiveNode(node)
            setActiveVersion("basica")
          }}
          onDrop={(teamId) => handleTeamDrop(teamId, node.id)}
          isDropTarget={draggingTeam !== null}
          teamsAtNode={(teamsByNodeId[node.id] ?? []).slice().sort((a, b) => a.id.localeCompare(b.id))}
          onTeamNameChange={handleTeamNameChange}
          onTeamRemove={removeTeam}
          onTeamDragStart={(teamId) => setDraggingTeam(teamId)}
          onTeamDragEnd={handleDragEnd}
        />
      ))}

      {visibleTeams.map((team) => {
        const node = nodes?.find((n) => n.id === team.currentNodeId)
        if (!node) return null

        const teamsAtNode = (teamsByNodeId[team.currentNodeId] ?? [])
          .sort((a, b) => a.id.localeCompare(b.id))
        const stackIndex = teamsAtNode.findIndex((t) => t.id === team.id)

        return (
          <FoxToken
            key={team.id}
            team={team}
            position={{ x: node.x, y: node.y }}
            stackIndex={stackIndex}
            stackSize={teamsAtNode.length}
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

          {activeNode && activeMission && currentMissionVersion && (
            <div className="space-y-4">
              <Tabs defaultValue="basica" value={activeVersion} onValueChange={(value) => setActiveVersion(value as "basica" | "hardcore")}>
                <TabsList className={`grid w-full grid-cols-2 ${missionTheme.tabsListClass}`}>
                  <TabsTrigger value="basica" className={activeVersion === "basica" ? missionTheme.tabsTriggerActiveClass : missionTheme.tabsTriggerInactiveClass}>Versión Básica</TabsTrigger>
                  <TabsTrigger value="hardcore" className={activeVersion === "hardcore" ? missionTheme.tabsTriggerActiveClass : missionTheme.tabsTriggerInactiveClass}>Nivel Hardcore</TabsTrigger>
                </TabsList>
              </Tabs>

              <Card className={missionTheme.cardClass}>
                <CardHeader className={missionTheme.cardHeaderClass}>
                  <CardTitle>Problema</CardTitle>
                </CardHeader>
                <CardContent className="text-sm py-6">{currentMissionVersion.problem}</CardContent>
              </Card>

              {(Boolean(currentMissionVersion.data) || Boolean(currentMissionVersion.dataset) || Boolean(currentMissionVersion.map) || Boolean(currentMissionVersion.test_cases)) && (
                <Card className={missionTheme.cardClass}>
                  <CardHeader className={missionTheme.cardHeaderClass}>
                    <CardTitle>Datos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm py-6">
                    {Boolean(currentMissionVersion.data) && (
                      <pre className={`rounded-md p-3 overflow-x-auto text-xs ${missionTheme.dataBoxClass}`}>{JSON.stringify(currentMissionVersion.data, null, 2)}</pre>
                    )}
                    {Boolean(currentMissionVersion.dataset) && (
                      <pre className={`rounded-md p-3 overflow-x-auto text-xs ${missionTheme.dataBoxClass}`}>{JSON.stringify(currentMissionVersion.dataset, null, 2)}</pre>
                    )}
                    {currentMissionVersion.map && (
                      <pre className={`rounded-md p-3 overflow-x-auto text-xs ${missionTheme.dataBoxClass}`}>{currentMissionVersion.map.join("\n")}</pre>
                    )}
                    {currentMissionVersion.test_cases && <p>Casos de prueba: {currentMissionVersion.test_cases.join(", ")}</p>}
                    {currentMissionVersion.blocked && <p>Zonas bloqueadas: {currentMissionVersion.blocked.join(", ")}</p>}
                    {currentMissionVersion.message && <p>Mensaje: {currentMissionVersion.message}</p>}
                    {currentMissionVersion.hint && <p>Pista: {currentMissionVersion.hint}</p>}
                    {currentMissionVersion.example && <p>Ejemplo: {currentMissionVersion.example}</p>}
                    {console.log("hi")}
                  </CardContent>
                </Card>
              )}

              {(Boolean(currentMissionVersion.steps) || Boolean(currentMissionVersion.repository_structure)) && (
                <Card className={missionTheme.cardClass}>
                  <CardHeader className={missionTheme.cardHeaderClass}>
                    <CardTitle>Instrucciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm py-6">
                    {currentMissionVersion.steps && (
                      <ol className="list-decimal pl-5 space-y-1">
                        {currentMissionVersion.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    )}
                    {currentMissionVersion.repository_structure && (
                      <div>
                        <p className="font-semibold mb-2">Estructura sugerida del repositorio</p>
                        <div className={`rounded-md p-3 overflow-x-auto text-xs ${missionTheme.dataBoxClass}`}>
                          {Object.entries(currentMissionVersion.repository_structure).map(([name, description]) => (
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

              {Boolean(currentMissionVersion.questions) && (
                <Card className={missionTheme.cardClass}>
                  <CardHeader className={missionTheme.cardHeaderClass}>
                    <CardTitle>Preguntas guia</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm py-6">
                    <ul className="list-disc pl-5 space-y-1">
                      {currentMissionVersion.questions?.map((question) => (
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
                <CardContent className="text-sm py-6">{currentMissionVersion.challenge}</CardContent>
              </Card>

              <Card className={missionTheme.cardClass}>
                <CardHeader className={missionTheme.cardHeaderClass}>
                  <CardTitle>Entregable</CardTitle>
                </CardHeader>
                <CardContent className="text-sm py-6 space-y-2">
                  <p>{currentMissionVersion.deliverable}</p>
                  {currentMissionVersion.presentation && (
                    <p>
                      <span className="font-semibold">Presentacion:</span> {currentMissionVersion.presentation}
                    </p>
                  )}
                  {currentMissionVersion.resource_link && (
                    <p>
                      Recurso: {" "}
                      <a
                        href={currentMissionVersion.resource_link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-semibold"
                      >
                        {currentMissionVersion.resource_link.label}
                      </a>
                    </p>
                  )}
                </CardContent>
              </Card>

              {currentMissionVersion.bonus && (
                <Card className={missionTheme.cardClass}>
                  <CardHeader className={missionTheme.cardHeaderClass}>
                    <CardTitle>Bonus</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm py-6">{currentMissionVersion.bonus}</CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
