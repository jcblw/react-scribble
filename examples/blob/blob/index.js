import { useCallback, useMemo } from '../../../node_modules/react'
import { useDraw } from '../../../dist'
import { AnimatedValue } from './animated-value'
import SimplexNoise from 'simplex-noise'
import {
  getPointOnCircle,
  normalize,
  randianBetweenPoints,
  distance,
  angleToRadian,
} from './math'

const getValue = x => {
  let value
  try {
    value = x.getAnimatedValue()
  } catch (e) {
    value = x
  }
  return value
}

export const drawBlob = ({
  scale,
  i,
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
}) => {
  const arr = []
  const center = [getValue(x), getValue(y)]
  const noiseCenter = getPointOnCircle(
    ...noisePoint,
    angleToRadian(getValue(i)),
    10
  )
  for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / angles) {
    const perlinPoint = getPointOnCircle(...noiseCenter, angle, 0.5)
    const off = normalize(simplex.noise2D(...perlinPoint), 0, 1, lr, ur)

    const radi = radius * getValue(scale) + off
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
  ctx.fillStyle = getValue(color)
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
    i.setValue(getValue(i) + 0.01)
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
  const i = useMemo(() => new AnimatedValue(0), [])
  const draw = useCallback(
    ctx => {
      drawBlob({
        i,
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
      })
    },
    [
      angles,
      animated,
      color,
      i,
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
