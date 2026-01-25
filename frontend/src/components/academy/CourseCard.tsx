
import { GlassCard } from "@/components/ui/glass-card"
import { PlayCircle, Lock } from "lucide-react"
import { NeonButton } from "@/components/ui/neon-button"

interface CourseCardProps {
    title: string
    level: string
    duration: string
    progress?: number
    locked?: boolean
}

export function CourseCard({ title, level, duration, progress = 0, locked = false }: CourseCardProps) {
    return (
        <GlassCard className={`relative overflow-hidden group ${locked ? 'opacity-75 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border 
          ${level === 'Advanced' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                    {level}
                </span>
                <span className="text-xs text-muted-foreground">{duration}</span>
            </div>

            <h3 className="font-bold text-lg mb-2">{title}</h3>

            <div className="w-full bg-white/10 h-1.5 rounded-full mb-4 overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex justify-between items-center mt-auto">
                <span className="text-xs text-muted-foreground">{progress > 0 ? `${progress}% Complete` : 'Not Started'}</span>
                <NeonButton size="sm" variant={locked ? "ghost" : "default"} disabled={locked}>
                    {locked ? <Lock className="w-4 h-4" /> : <><PlayCircle className="w-4 h-4 mr-2" /> Resume</>}
                </NeonButton>
            </div>
        </GlassCard>
    )
}
