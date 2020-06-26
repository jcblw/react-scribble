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
    useEffect(() => {
      const x = fn
      drawFns.push(fn)
      return () => {
        const index = drawFns.indexOf(x)
        drawFns.splice(index, 1)
      }
    }, [fn]) // eslint-disable-next-line
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
  }) => {
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.translate(0.5, 0.5)
      onDraw(ctx, canvas, meta)
      drawFns.forEach(drawFn => {
        drawFn(ctx, canvas, meta)
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
          meta,
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
  }) => {
    const ref = useRef<HTMLCanvasElement>(null)
    const drawFns = useMemo(() => [], [])
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
