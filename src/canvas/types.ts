import CSS from 'csstype'

export type DrawFN = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => void

export interface ScribbleContext {
  drawFns: DrawFN[]
  canvas: null | HTMLCanvasElement
  width: number
  height: number
}

export interface CanvasProps {
  width: number
  height: number
  onSetup?: DrawFN
  loop?: boolean
  onDraw?: DrawFN
  style?: CSS.Properties
  className?: string
}

export interface Time {
  raf?: number
  timeout?: number
}

export interface DrawParams {
  onDraw?: DrawFN
  drawFns: DrawFN[]
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  updateTime: (time: Time) => void
}

export type DrawLoopFN = (params: DrawParams) => void
