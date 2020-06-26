import { useCallback, useMemo } from '../../../node_modules/react'
import { useDraw } from '../../../dist'
import SimplexNoise from 'simplex-noise'
import {
  getPointOnCircle,
  normalize,
  randianBetweenPoints,
  distance,
  angleToRadian,
} from './math'

export const drawBlob = ({
  scale,
  x,
  y,
  lr,
  ur,
  simplex,
  ctx,
  color,
  radius,
  noisePoint,
  angles,
  animated,
  meta,
}) => {
  const arr = []
  const center = [x, y]
  const noiseCenter = getPointOnCircle(
    ...noisePoint,
    angleToRadian(meta.current),
    10
  )
  for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / angles) {
    const perlinPoint = getPointOnCircle(...noiseCenter, angle, 0.5)
    const off = normalize(simplex.noise2D(...perlinPoint), 0, 1, lr, ur)

    const radi = radius * scale + off
    const px = radi * Math.cos(angle) + center[0]
    const py = radi * Math.sin(angle) + center[1]
    arr.push([px, py])
  }

  arr.sort(
    (a, b) => randianBetweenPoints(b, center) - randianBetweenPoints(a, center)
  )

  const newArr = arr
    .filter(point => distance(point, center) > 3)
    .map(point => {
      const d = distance(point, center)
      const r = randianBetweenPoints(center, point)
      return getPointOnCircle(...center, r, d)
    })

  let started = false
  ctx.beginPath()
  ctx.fillStyle = color
  newArr.forEach(([px, py], ii) => {
    if (started) {
      ctx.lineTo(px, py)
    } else {
      ctx.moveTo(px, py)
      started = true
    }
  })
  ctx.closePath()
  ctx.fill()

  if (animated) {
    meta.current += 0.01
  }
}

const rando = () => Math.floor(Math.random() * 100)

export const Blob = ({
  scale = 1,
  x = 0,
  x2,
  y = 0,
  lr = 10,
  ur = 20,
  color = 'tomato',
  radius = 100,
  animated = true,
  angles = 50,
  simplex = new SimplexNoise(),
}) => {
  const noisePoint = useMemo(() => [rando(), rando()], [])
  const draw = useCallback(
    (ctx, canvas, meta) => {
      drawBlob({
        scale,
        x,
        x2,
        y,
        lr,
        ur,
        simplex,
        ctx,
        color,
        radius,
        animated,
        noisePoint,
        angles,
        meta,
      })
    },
    [
      angles,
      animated,
      color,
      lr,
      noisePoint,
      radius,
      scale,
      simplex,
      ur,
      x,
      x2,
      y,
    ]
  )
  useDraw(draw)
  return null
}
