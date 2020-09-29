import { useDraw } from '.'

interface AntiAlias {
  end?: boolean
}

export const AntiAlias = ({ end }) => {
  useDraw(ctx => {
    const amount = end ? -0.5 : 0.5
    ctx.translate(amount, amount)
  })
  return null
}

export const Clear = () => {
  useDraw((ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  })
  return null
}
