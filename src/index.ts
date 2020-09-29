import { Canvas as CanvasBase } from './canvas'
import { Clear, AntiAlias } from './canvas/utils'
export { useDraw, useScribbleContext, WebGL, WebGL2 } from './canvas'
const Canvas = {
  ...CanvasBase,
  Clear,
  AntiAlias,
}
export { Canvas }
export { Stage } from './stage'
