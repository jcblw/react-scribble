import React, { useRef, useState } from '../../node_modules/react'
import ReactDOM from '../../node_modules/react-dom'
import { Canvas, Stage } from '../../dist'
import { Blob } from './blob'

const App = () => {
  const ref = useRef(0)
  const [color, setColor] = useState('dodgerblue')
  return (
    <Canvas
      width={window.innerWidth}
      height={window.innerHeight}
      loop
      meta={ref}
      fps={30}
    >
      <Blob
        x={window.innerWidth / 2 + 100}
        y={window.innerHeight / 2 + 100}
        color={color}
      />
      <Blob x={window.innerWidth / 2} y={window.innerHeight / 2} />
      <Blob
        x={window.innerWidth / 2 - 100}
        y={window.innerHeight / 2 - 100}
        color={color}
      />
      <Stage style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>Hello World</p>
        <button
          onClick={() => {
            if (color === 'dodgerblue') {
              setColor('rebeccapurple')
            } else {
              setColor('dodgerblue')
            }
          }}
        >
          toggle color
        </button>
      </Stage>
    </Canvas>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
