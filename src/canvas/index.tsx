import React, {
  useRef,
  useEffect,
  createContext,
  useMemo,
  useContext,
  useState,
} from 'react'
import { DrawFN, ScribbleContext, DrawLoopFN, CanvasProps } from './types'

const DEFAULT_HEIGHT = 1800
const DEFAULT_WIDTH = 1800

export const makeCanvas = <T extends {}>() => {
  const context = createContext<ScribbleContext<T>>({
    canvas: null,
    drawFns: [],
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  })
  const CanvasProvider = context.Provider

  const useDraw = (fn: DrawFN<T>) => {
    const { drawFns } = useContext(context)
    const [index, setIndex] = useState<number>()
    useEffect(() => {
      const x = fn
      if (typeof index !== 'undefined') {
        drawFns.splice(index, 1, x)
      } else {
        drawFns.push(fn)
      }
      const currentIndex = drawFns.indexOf(x)
      setIndex(currentIndex)
      return () => {
        drawFns.splice(currentIndex, 1, null)
      }
    }, [fn, index])
  }

  const useScribbleContext = () => {
    return useContext(context)
  }

  const draw: DrawLoopFN<T> = ({
    onDraw,
    drawFns,
    ctx,
    canvas,
    updateTime,
    meta,
    fps,
    lastUpdate,
  }) => {
    let updatedLastUpdate = lastUpdate
    const now = +new Date()
    const shouldUpdate = fps >= 1000 / (now - lastUpdate)
    if (shouldUpdate) {
      updatedLastUpdate = now
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.translate(0.5, 0.5)
        onDraw(ctx, canvas, meta)
        drawFns.forEach(drawFn => {
          if (drawFn === null) return
          drawFn(ctx, canvas, meta)
        })
      } catch (e) {
        console.error(e)
      } finally {
        ctx.translate(-0.5, -0.5)
      }
    }
    const timeout = setTimeout(() => {
      const raf = requestAnimationFrame(() =>
        draw({
          onDraw,
          drawFns,
          ctx,
          updateTime,
          canvas,
          meta,
          lastUpdate: updatedLastUpdate,
          fps,
        })
      )
      updateTime({ raf })
    }, 0)
    updateTime({ timeout })
  }

  const Canvas: React.FC<CanvasProps<T>> = ({
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    onSetup = () => {},
    loop = false,
    onDraw = () => {},
    children,
    style,
    className,
    meta,
    fps = 120,
  }) => {
    const ref = useRef<HTMLCanvasElement>(null)
    const drawFns = useMemo<(DrawFN<T> | null)[]>(() => [], [])
    useEffect(() => {
      let t = 0
      let r = 0
      const canvas = ref.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        onSetup(ctx, canvas, meta)
        if (loop) {
          draw({
            ctx,
            onDraw,
            drawFns,
            canvas,
            meta,
            updateTime: ({ timeout, raf }) => {
              if (timeout) {
                t = timeout
              }
              if (raf) {
                r = raf
              }
            },
            fps,
            lastUpdate: +new Date(),
          })
        }
      }
      return () => {
        clearTimeout(t)
        cancelAnimationFrame(r)
      }
    }, [height, loop, onDraw, onSetup, width, drawFns, drawFns.length, meta])

    return (
      <CanvasProvider
        value={{
          drawFns,
          canvas: ref.current,
          width,
          height,
          meta,
        }}
      >
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

  return {
    Canvas,
    useDraw,
    useScribbleContext,
  }
}

export const { useScribbleContext, useDraw, Canvas } = makeCanvas()
