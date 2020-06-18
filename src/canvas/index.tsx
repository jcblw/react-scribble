import React, {
  useRef,
  useEffect,
  createContext,
  useMemo,
  useContext,
} from 'react'
import { DrawFN, ScribbleContext, DrawLoopFN, CanvasProps } from './types'

const DEFAULT_HEIGHT = 1800
const DEFAULT_WIDTH = 1800

const context = createContext<ScribbleContext>({
  canvas: null,
  drawFns: [],
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
})
const CanvasProvider = context.Provider

// TODO: support dependencies
export const useDraw = (fn: DrawFN) => {
  const { drawFns } = useContext(context)
  useEffect(() => {
    const x = fn
    drawFns.push(fn)
    return () => {
      const index = drawFns.indexOf(x)
      drawFns.splice(index, 1)
    }
  }, [fn]) // eslint-disable-next-line
}

export const useScribbleContext = () => {
  return useContext(context)
}

const draw: DrawLoopFN = ({ onDraw, drawFns, ctx, canvas, updateTime }) => {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.translate(0.5, 0.5)
    onDraw(ctx, canvas)
    drawFns.forEach(drawFn => {
      drawFn(ctx, canvas)
    })
  } catch (e) {
    console.error(e)
  } finally {
    ctx.translate(-0.5, -0.5)
  }
  const timeout = setTimeout(() => {
    const raf = requestAnimationFrame(() =>
      draw({
        onDraw,
        drawFns,
        ctx,
        updateTime,
        canvas,
      })
    )
    updateTime({ raf })
  }, 0)
  updateTime({ timeout })
}

export const Canvas: React.FC<CanvasProps> = ({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  onSetup = () => {},
  loop = false,
  onDraw = () => {},
  children,
  style,
  className,
}) => {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawFns = useMemo(() => [], [])
  useEffect(() => {
    let t = 0
    let r = 0
    const canvas = ref.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      onSetup(ctx, canvas)
      if (loop) {
        draw({
          ctx,
          onDraw,
          drawFns,
          canvas,
          updateTime: ({ timeout, raf }) => {
            if (timeout) {
              t = timeout
            }
            if (raf) {
              r = raf
            }
          },
        })
      }
    }
    return () => {
      clearTimeout(t)
      cancelAnimationFrame(r)
    }
  }, [height, loop, onDraw, onSetup, width, drawFns, drawFns.length])

  return (
    <CanvasProvider value={{ drawFns, canvas: ref.current, width, height }}>
      <div
        className={className}
        style={{
          width,
          height,
          position: 'relative',
          display: 'flex',
          flex: 1,
          ...style,
        }}
      >
        {children}
        <canvas
          ref={ref}
          width={`${width}px`}
          height={`${height}px`}
          style={{ width, height, zIndex: 1 }}
        />
      </div>
    </CanvasProvider>
  )
}
