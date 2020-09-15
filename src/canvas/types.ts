import CSS from 'csstype'

export type DrawFN<T> = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  meta?: T
) => void

export interface ScribbleContext<T extends {}> {
  drawFns: (DrawFN<T> | null)[]
  canvas: null | HTMLCanvasElement
  width: number
  height: number
  meta?: T
}

export interface CanvasProps<T> {
  width: number
  height: number
  onSetup?: DrawFN<T>
  loop?: boolean
  onDraw?: DrawFN<T>
  style?: CSS.Properties
  className?: string
  meta?: T
  fps?: number
}

export interface Time {
  raf?: number
  timeout?: number
}

export interface DrawParams<T> {
  onDraw?: DrawFN<T>
  drawFns: (DrawFN<T> | null)[]
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  updateTime: (time: Time) => void
  meta?: T
  fps: number
  lastUpdate: number
}

export type DrawLoopFN<T> = (params: DrawParams<T>) => void
