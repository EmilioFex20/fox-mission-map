"use client"

export function MapBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-light via-sky-dark to-sky-dark" />

      {/* Clouds */}
      <Cloud x={100} y={60} scale={1.2} />
      <Cloud x={400} y={40} scale={0.8} />
      <Cloud x={700} y={80} scale={1} />
      <Cloud x={1000} y={30} scale={1.3} />
      <Cloud x={1300} y={70} scale={0.9} />
      <Cloud x={1600} y={50} scale={1.1} />
      <Cloud x={1800} y={90} scale={0.7} />

      {/* Mountains in background */}
      <svg className="absolute bottom-0 w-full h-[600px]" viewBox="0 0 1920 600" preserveAspectRatio="none">
        {/* Far mountains */}
        <path
          d="M0 600 L0 350 Q200 200 400 300 Q600 150 800 280 Q1000 100 1200 250 Q1400 180 1600 320 Q1750 200 1920 350 L1920 600 Z"
          fill="rgba(100, 160, 120, 0.5)"
        />
        {/* Mid mountains */}
        <path
          d="M0 600 L0 400 Q150 280 300 380 Q500 250 700 350 Q900 200 1100 320 Q1300 250 1500 380 Q1700 280 1920 400 L1920 600 Z"
          fill="rgba(80, 140, 100, 0.6)"
        />
      </svg>

      {/* Ground/Grass layers */}
      <div className="absolute bottom-0 left-0 right-0 h-[450px] bg-gradient-to-t from-grass-dark via-grass-light to-transparent" />

      {/* Terrain details SVG */}
      <svg className="absolute bottom-0 w-full h-[500px]" viewBox="0 0 1920 500" preserveAspectRatio="none">
        {/* Rolling hills */}
        <path
          d="M0 500 L0 300 Q100 250 200 280 Q350 200 500 260 Q650 180 800 240 Q950 150 1100 220 Q1250 160 1400 230 Q1550 180 1700 250 Q1800 200 1920 280 L1920 500 Z"
          fill="rgba(60, 120, 80, 0.4)"
        />
        <path
          d="M0 500 L0 350 Q150 300 300 330 Q500 270 700 320 Q900 250 1100 300 Q1300 260 1500 310 Q1700 270 1920 330 L1920 500 Z"
          fill="rgba(70, 130, 90, 0.5)"
        />
      </svg>

      {/* Forest Zone (left) */}
      <div className="absolute bottom-[17%] left-[2.6%]">
        <Tree scale={1.3} />
      </div>
      <div className="absolute bottom-[18.5%] left-[6.3%]">
        <Tree scale={1} />
      </div>
      <div className="absolute bottom-[15%] left-[9.4%]">
        <SensorTower />
      </div>
      <div className="absolute bottom-[17.6%] left-[14.6%]">
        <Tree scale={1.1} />
      </div>
      <div className="absolute bottom-[15.7%] left-[18.2%]">
        <Tree scale={0.9} />
      </div>
      <div className="absolute bottom-[17.1%] left-[21.9%]">
        <SensorTower />
      </div>
      <div className="absolute bottom-[18.5%] left-[26%]">
        <Tree scale={1.2} />
      </div>

      {/* City Zone (middle-left) */}
      <div className="absolute bottom-[18.5%] left-[29.2%]">
        <Building height={120} color="#64748B" />
      </div>
      <div className="absolute bottom-[18.5%] left-[32.3%]">
        <Building height={90} color="#475569" />
      </div>
      <div className="absolute bottom-[18.5%] left-[36.5%]">
        <TrafficLight />
      </div>
      <div className="absolute bottom-[18.5%] left-[40.6%]">
        <Building height={140} color="#334155" />
      </div>
      <div className="absolute bottom-[18.5%] left-[44.3%]">
        <Building height={100} color="#64748B" />
      </div>
      <div className="absolute bottom-[18.5%] left-[47.9%]">
        <TrafficLight />
      </div>

      {/* Vault Zone (middle-right) */}
      <div className="absolute bottom-[18.5%] left-[51%]">
        <VaultStructure />
      </div>
      <div className="absolute bottom-[20.4%] left-[57.3%]">
        <CodeSymbol symbol="{ }" x={0} y={0} />
      </div>
      <div className="absolute bottom-[18.5%] left-[61.5%]">
        <VaultDoor />
      </div>
      <div className="absolute bottom-[21.3%] left-[67.7%]">
        <CodeSymbol symbol="</>" x={0} y={0} />
      </div>

      {/* AI Core Zone (right) */}
      <div className="absolute bottom-[18.5%] left-[72.9%]">
        <AIReactor scale={0.8} />
      </div>
      <div className="absolute bottom-[18.5%] left-[80.7%]">
        <NeuralNode />
      </div>
      <div className="absolute bottom-[18.5%] left-[87.5%]">
        <AIReactor scale={1.2} />
      </div>
      <div className="absolute bottom-[20.4%] left-[93.8%]">
        <NeuralNode />
      </div>

      {/* River */}
      <svg className="absolute bottom-0 w-full h-[200px] opacity-60" viewBox="0 0 1920 200">
        <path
          d="M0 150 Q200 100 400 140 Q600 80 800 120 Q1000 60 1200 100 Q1400 50 1600 90 Q1800 40 1920 80 L1920 200 L0 200 Z"
          fill="url(#riverGradient)"
        />
        <defs>
          <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0.2)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <svg
      className="absolute animate-pulse"
      style={{ left: x, top: y, transform: `scale(${scale})` }}
      width="120"
      height="60"
      viewBox="0 0 120 60"
    >
      <ellipse cx="40" cy="40" rx="30" ry="20" fill="rgba(255, 255, 255, 0.9)" />
      <ellipse cx="70" cy="35" rx="35" ry="25" fill="rgba(255, 255, 255, 0.95)" />
      <ellipse cx="95" cy="42" rx="25" ry="18" fill="rgba(255, 255, 255, 0.85)" />
    </svg>
  )
}

function Tree({ scale }: { scale: number }) {
  return (
    <svg width={60 * scale} height={100 * scale} viewBox="0 0 60 100">
      <rect x="25" y="60" width="10" height="40" fill="#8B5A2B" rx="2" />
      <ellipse cx="30" cy="40" rx="28" ry="35" fill="#228B22" />
      <ellipse cx="30" cy="25" rx="20" ry="25" fill="#2E8B57" />
      <ellipse cx="30" cy="15" rx="12" ry="15" fill="#32CD32" />
    </svg>
  )
}

function SensorTower() {
  return (
    <svg width="50" height="100" viewBox="0 0 50 100">
      <rect x="20" y="30" width="10" height="70" fill="#475569" rx="2" />
      <polygon points="25,0 10,30 40,30" fill="#334155" />
      <circle cx="25" cy="15" r="5" fill="#22D3EE" className="animate-pulse" />
      {/* Signal waves */}
      <circle cx="25" cy="15" r="12" fill="none" stroke="#22D3EE" strokeWidth="2" opacity="0.5" />
      <circle cx="25" cy="15" r="20" fill="none" stroke="#22D3EE" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

function Building({ height, color }: { height: number; color: string }) {
  const windowRows = Math.floor(height / 25)
  // Deterministic pattern for window lights based on position
  const isLit = (row: number, col: number) => {
    const pattern = [
      [true, false, true],
      [false, true, false],
      [true, true, false],
      [false, false, true],
      [true, false, false],
      [false, true, true],
    ]
    return pattern[row % pattern.length][col % 3]
  }
  
  return (
    <svg width="50" height={height + 10} viewBox={`0 0 50 ${height + 10}`}>
      <rect x="5" y="10" width="40" height={height} fill={color} rx="3" />
      {/* Windows */}
      {Array.from({ length: windowRows }).map((_, row) =>
        Array.from({ length: 3 }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={12 + col * 12}
            y={20 + row * 25}
            width="8"
            height="12"
            fill="#FEF3C7"
            opacity={isLit(row, col) ? 1 : 0.3}
            rx="1"
          />
        ))
      )}
    </svg>
  )
}

function TrafficLight() {
  return (
    <svg width="30" height="80" viewBox="0 0 30 80">
      <rect x="12" y="40" width="6" height="40" fill="#374151" />
      <rect x="5" y="5" width="20" height="40" fill="#1F2937" rx="3" />
      <circle cx="15" cy="15" r="5" fill="#EF4444" />
      <circle cx="15" cy="27" r="5" fill="#EAB308" />
      <circle cx="15" cy="39" r="5" fill="#22C55E" className="animate-pulse" />
    </svg>
  )
}

function VaultStructure() {
  return (
    <svg width="80" height="100" viewBox="0 0 80 100">
      <rect x="5" y="20" width="70" height="80" fill="#6B21A8" rx="5" />
      <rect x="15" y="30" width="50" height="60" fill="#581C87" rx="3" />
      <circle cx="40" cy="60" r="20" fill="#7C3AED" />
      <circle cx="40" cy="60" r="12" fill="#4C1D95" />
      <rect x="35" y="50" width="10" height="20" fill="#A855F7" rx="2" />
    </svg>
  )
}

function VaultDoor() {
  return (
    <svg width="60" height="80" viewBox="0 0 60 80">
      <rect x="5" y="10" width="50" height="70" fill="#581C87" rx="3" />
      <circle cx="30" cy="45" r="18" fill="#7C3AED" stroke="#A855F7" strokeWidth="3" />
      <circle cx="30" cy="45" r="8" fill="#4C1D95" />
      <line x1="22" y1="45" x2="38" y2="45" stroke="#A855F7" strokeWidth="2" />
      <line x1="30" y1="37" x2="30" y2="53" stroke="#A855F7" strokeWidth="2" />
    </svg>
  )
}

function CodeSymbol({ symbol }: { symbol: string; x: number; y: number }) {
  return (
    <div className="text-3xl font-mono text-purple-300 animate-bounce opacity-70">{symbol}</div>
  )
}

function AIReactor({ scale }: { scale: number }) {
  return (
    <svg width={80 * scale} height={100 * scale} viewBox="0 0 80 100">
      <ellipse cx="40" cy="85" rx="35" ry="15" fill="rgba(6, 182, 212, 0.3)" />
      <rect x="15" y="20" width="50" height="65" fill="#0E7490" rx="5" />
      <circle cx="40" cy="50" r="25" fill="#06B6D4" className="animate-pulse" />
      <circle cx="40" cy="50" r="15" fill="#0891B2" />
      <circle cx="40" cy="50" r="8" fill="#22D3EE" />
      {/* Energy beams */}
      <line x1="40" y1="5" x2="40" y2="25" stroke="#22D3EE" strokeWidth="3" opacity="0.8" />
      <line x1="20" y1="15" x2="30" y2="30" stroke="#22D3EE" strokeWidth="2" opacity="0.6" />
      <line x1="60" y1="15" x2="50" y2="30" stroke="#22D3EE" strokeWidth="2" opacity="0.6" />
    </svg>
  )
}

function NeuralNode() {
  return (
    <svg width="60" height="80" viewBox="0 0 60 80">
      {/* Connection lines */}
      <line x1="30" y1="20" x2="10" y2="50" stroke="#06B6D4" strokeWidth="2" opacity="0.5" />
      <line x1="30" y1="20" x2="50" y2="50" stroke="#06B6D4" strokeWidth="2" opacity="0.5" />
      <line x1="30" y1="20" x2="30" y2="60" stroke="#06B6D4" strokeWidth="2" opacity="0.5" />
      {/* Nodes */}
      <circle cx="30" cy="20" r="12" fill="#0891B2" className="animate-pulse" />
      <circle cx="30" cy="20" r="6" fill="#22D3EE" />
      <circle cx="10" cy="50" r="8" fill="#06B6D4" />
      <circle cx="50" cy="50" r="8" fill="#06B6D4" />
      <circle cx="30" cy="60" r="8" fill="#06B6D4" />
    </svg>
  )
}
