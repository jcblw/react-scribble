import CSS from 'csstype'
import React from 'react'

export type DrawFN<T, R> = (ctx: R, canvas: HTMLCanvasElement, meta?: T) => void

export type CanvasContextId = '2d' | 'webgl' | 'webgl2' | string

export interface ScribbleContext<T, R> {
  canvas: null | HTMLCanvasElement
  width: number
  height: number
  meta?: T
  drawFns: (DrawFN<T, R> | null)[]
  contextId: string
}

export interface CanvasProps<T, R> {
  width: number
  height: number
  loop?: boolean
  style?: CSS.Properties
  className?: string
  meta?: T
  fps?: number
  onSetup?: DrawFN<T, R>
  onDraw?: DrawFN<T, R>
}

export interface Time {
  raf?: number
  timeout?: number
}

export interface BaseDrawParams<T> {
  canvas: HTMLCanvasElement
  updateTime: (time: Time) => void
  meta?: T
  fps: number
  lastUpdate: number
}

export interface RenderingContextDrawParams<T, R> extends BaseDrawParams<T> {
  ctx: R
  onDraw?: DrawFN<T, R>
  drawFns: (DrawFN<T, R> | null)[]
  contextId: string
}

export type DrawParams<T, R> = RenderingContextDrawParams<T, R>

export type DrawLoopFN<T, R> = (params: DrawParams<T, R>) => void

export interface MakeCanvasReturn<R, T> {
  useScribbleContext: () => ScribbleContext<T, R>
  useDraw: (drawFn: DrawFN<T, R>, deps?: unknown[]) => void
  Canvas: React.FC<CanvasProps<T, R>>
  draw: DrawLoopFN<T, R>
}
