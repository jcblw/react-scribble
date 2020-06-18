import React from 'react'
import { StageProps } from './types'
import { useScribbleContext } from '../canvas'

export const Stage: React.FC<StageProps> = ({
  className,
  style,
  ...otherProps
}) => {
  const { width, height } = useScribbleContext()
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flex: 1,
        position: 'absolute',
        zIndex: 2,
        width,
        height,
        ...style,
      }}
      {...otherProps}
    />
  )
}
