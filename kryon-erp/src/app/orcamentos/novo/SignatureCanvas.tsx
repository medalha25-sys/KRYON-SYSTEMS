'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Eraser, Check } from 'lucide-react'

interface Props {
    onSave: (base64: string) => void
}

export default function SignatureCanvas({ onSave }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    }, [])

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        draw(e)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (canvas) {
            onSave(canvas.toDataURL('image/png'))
        }
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top

        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const clear = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onSave('')
    }

    return (
        <div className="space-y-4">
            <div className="relative group">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="w-full h-[150px] bg-black border border-slate-800 rounded-lg cursor-crosshair touch-none"
                />
                <button 
                    type="button"
                    onClick={clear}
                    className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded hover:bg-red-900/80 text-slate-400 hover:text-white transition-all"
                >
                    <Eraser className="w-4 h-4" />
                </button>
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold italic">Assinatura digital do conferente/cliente</p>
        </div>
    )
}
