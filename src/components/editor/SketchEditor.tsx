import { useEffect, useRef, useState, useCallback } from 'react'
import type { Entry, SketchData, SketchNode } from '@/models/types'
import { useAutoSave, type SaveStatus } from '@/lib/useAutoSave'
import { formatDate } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import './Editor.css'
import './SketchEditor.css'

interface SketchEditorProps {
  entry: Entry
  onSave: (patch: { title: string; sketch: SketchData }) => Promise<void> | void
}

/** A single freehand stroke: a polyline plus its brush settings. */
interface StrokeData {
  points: { x: number; y: number }[]
  color: string
  size: number
  /** Eraser strokes composite differently (destination-out). */
  erase: boolean
}

/** Type guard: a node holding a freehand stroke. */
function isStroke(node: SketchNode): node is SketchNode & { data: StrokeData } {
  return node.kind === 'stroke'
}

const PALETTE = [
  '#2b2b2b',
  '#c0392b',
  '#d35400',
  '#c39b3a',
  '#5f7d8c',
  '#4a6d4e',
  '#6b5b95',
  '#a8506f',
]

const SIZES = [2, 4, 8, 14]

function StatusLabel({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return <span className="editor__status">Saving…</span>
    case 'saved':
      return (
        <span className="editor__status is-saved">
          <Icon name="check" size={14} /> Saved
        </span>
      )
    case 'error':
      return <span className="editor__status is-error">Couldn’t save</span>
    default:
      return <span className="editor__status is-idle">All changes saved</span>
  }
}

/** Fixed logical canvas size; strokes store coordinates in this space so
 *  the drawing is resolution-independent and re-renders crisply anywhere. */
const CANVAS_W = 1200
const CANVAS_H = 800

export function SketchEditor({ entry, onSave }: SketchEditorProps) {
  const [title, setTitle] = useState(entry.title)
  const [nodes, setNodes] = useState<SketchNode[]>(entry.sketch?.nodes ?? [])
  const [color, setColor] = useState(PALETTE[0])
  const [size, setSize] = useState(SIZES[1])
  const [erasing, setErasing] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  // The stroke currently being drawn (not yet committed to `nodes`).
  const drawingRef = useRef<StrokeData | null>(null)
  const drawing = useRef(false)

  // Re-hydrate when switching to a different page.
  useEffect(() => {
    setTitle(entry.title)
    setNodes(entry.sketch?.nodes ?? [])
    drawingRef.current = null
    drawing.current = false
  }, [entry.id])

  const { status } = useAutoSave({
    value: { title, sketch: { nodes } },
    onSave,
    delay: 700,
  })

  /** Paint one stroke onto a 2D context. */
  const paintStroke = (ctx: CanvasRenderingContext2D, s: StrokeData) => {
    if (s.points.length === 0) return
    ctx.save()
    ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over'
    ctx.strokeStyle = s.color
    ctx.lineWidth = s.size
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    const [first, ...rest] = s.points
    ctx.moveTo(first.x, first.y)
    if (rest.length === 0) {
      // A single tap: draw a dot.
      ctx.lineTo(first.x + 0.1, first.y + 0.1)
    } else {
      for (const p of rest) ctx.lineTo(p.x, p.y)
    }
    ctx.stroke()
    ctx.restore()
  }

  /** Full redraw from the committed nodes plus the in-progress stroke. */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    for (const node of nodes) {
      if (isStroke(node)) paintStroke(ctx, node.data)
    }
    if (drawingRef.current) paintStroke(ctx, drawingRef.current)
  }, [nodes])

  useEffect(() => {
    redraw()
  }, [redraw])

  /** Map a pointer event to logical canvas coordinates. */
  const toCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    drawing.current = true
    drawingRef.current = {
      points: [toCanvasPoint(e)],
      color,
      size,
      erase: erasing,
    }
    redraw()
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !drawingRef.current) return
    drawingRef.current.points.push(toCanvasPoint(e))
    redraw()
  }

  const commitStroke = () => {
    if (!drawing.current) return
    drawing.current = false
    const stroke = drawingRef.current
    drawingRef.current = null
    if (!stroke || stroke.points.length === 0) return
    const node: SketchNode = {
      id: crypto.randomUUID(),
      kind: 'stroke',
      data: stroke,
      x: 0,
      y: 0,
    }
    setNodes((prev) => [...prev, node])
  }

  const handleUndo = () => {
    setNodes((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (nodes.length === 0) return
    setNodes([])
  }

  return (
    <div className="editor sketch">
      <div className="editor__bar">
        <span className="editor__date">{formatDate(entry.updatedAt)}</span>
        <StatusLabel status={status} />
      </div>

      <div className="editor__paper sketch__paper">
        <input
          className="editor__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title"
          aria-label="Page title"
        />

        <div className="sketch__tools" role="toolbar" aria-label="Drawing tools">
          <div className="sketch__group" role="group" aria-label="Colors">
            {PALETTE.map((c) => (
              <button
          key={c}
                type="button"
                className={
                  'sketch__swatch' +
                  (!erasing && color === c ? ' is-active' : '')
                }
                style={{ background: c }}
                onClick={() => {
                  setColor(c)
                  setErasing(false)
                }}
                aria-label={`Color ${c}`}
                aria-pressed={!erasing && color === c}
              />
            ))}
          </div>

          <div className="sketch__divider" aria-hidden="true" />

          <div className="sketch__group" role="group" aria-label="Brush size">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                className={
                  'sketch__size' + (size === s ? ' is-active' : '')
                }
                onClick={() => setSize(s)}
                aria-label={`Brush size ${s}`}
                aria-pressed={size === s}
              >
                <span
                  className="sketch__size-dot"
                  style={{ width: Math.min(s + 4, 20), height: Math.min(s + 4, 20) }}
                />
              </button>
            ))}
          </div>

          <div className="sketch__divider" aria-hidden="true" />

          <div className="sketch__group">
            <button
              type="button"
              className={'sketch__tool' + (erasing ? ' is-active' : '')}
              onClick={() => setErasing((v) => !v)}
              aria-pressed={erasing}
              title="Eraser"
            >
              <Icon name="eraser" size={16} /> Eraser
            </button>
            <button
              type="button"
              className="sketch__tool"
              onClick={handleUndo}
              disabled={nodes.length === 0}
              title="Undo"
            >
              <Icon name="undo" size={16} /> Undo
            </button>
            <button
              type="button"
              className="sketch__tool"
              onClick={handleClear}
              disabled={nodes.length === 0}
              title="Clear page"
            >
              <Icon name="trash" size={16} /> Clear
            </button>
          </div>
        </div>

        <div className="sketch__stage">
          <canvas
            ref={canvasRef}
            className={'sketch__canvas' + (erasing ? ' is-erasing' : '')}
            width={CANVAS_W}
            height={CANVAS_H}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={commitStroke}
            onPointerLeave={commitStroke}
            onPointerCancel={commitStroke}
          />
        </div>
      </div>
    </div>
  )
}