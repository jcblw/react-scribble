import React, {
  useRef,
  useEffect,
  createContext,
  useMemo,
  useContext,
  useState,
  useCallback,
} from 'react'
import {
  DrawFN,
  ScribbleContext,
  DrawLoopFN,
  MakeCanvasReturn,
  CanvasContextId,
} from './types'

const DEFAULT_HEIGHT = 1800
const DEFAULT_WIDTH = 1800

export function makeCanvas<R extends RenderingContext, T>(
  contextId: CanvasContextId
): MakeCanvasReturn<R, T> {
  const context = createContext<ScribbleContext<T, R>>({
    canvas: null,
    drawFns: [],
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    contextId: contextId,
  })
  const CanvasProvider = context.Provider

  const draw: DrawLoopFN<T, R> = ({
    onDraw,
    drawFns,
    ctx,
    canvas,
    updateTime,
    meta,
    fps,
    lastUpdate,
    contextId,
  }) => {
    let updatedLastUpdate = lastUpdate
    const now = +new Date()
    const shouldUpdate = fps >= 1000 / (now - lastUpdate)
    if (shouldUpdate) {
      updatedLastUpdate = now
      onDraw(ctx, canvas, meta)
      drawFns.forEach(drawFn => {
        if (drawFn === null) return
        try {
          drawFn(ctx, canvas, meta)
        } catch (e) {
          console.error(e)
        }
      })
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
          contextId,
        })
      )
      updateTime({ raf })
    }, 0)
    updateTime({ timeout })
  }

  return {
    Canvas: ({
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
      const drawFns = useMemo<(DrawFN<T, R> | null)[]>(() => {
        return []
      }, [])
      useEffect(() => {
        let t = 0
        let r = 0
        const canvas = ref.current
        if (canvas) {
          const ctx = canvas.getContext(contextId) as R
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
              contextId,
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
            contextId,
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
    },
    useDraw: (fn: DrawFN<T, R>, dependencies = []) => {
      const { drawFns } = useContext(context)
      const [index, setIndex] = useState<number>()
      const memoFn = useCallback((ctx, canvas, meta) => fn(ctx, canvas, meta), [
        ...dependencies,
      ])
      useEffect(() => {
        const x = memoFn
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
      }, [memoFn, index])
    },
    useScribbleContext: () => {
      return useContext(context)
    },
  }
}

export const { useScribbleContext, useDraw, Canvas } = makeCanvas<
  CanvasRenderingContext2D,
  unknown
>('2d')
export const Canvas2d = { useScribbleContext, useDraw, Canvas }
export const WebGL = makeCanvas<WebGLRenderingContext, unknown>('webgl')
export const WebGL2 = makeCanvas<WebGL2RenderingContext, unknown>('webgl2')
