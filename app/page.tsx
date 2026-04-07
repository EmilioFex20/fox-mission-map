import { WorldMap } from "@/components/world-map"

export default function HackHexaMap() {
  return (
    <main className="min-h-screen w-full overflow-auto bg-background flex items-center justify-center">
      <div className="relative">
        <WorldMap />
      </div>
    </main>
  )
}
