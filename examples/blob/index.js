import React, { useRef } from '../../node_modules/react'
import ReactDOM from '../../node_modules/react-dom'
import { Canvas, Stage } from '../../dist'
import { Blob } from './blob'

const App = () => {
  const ref = useRef(0)
  return (
    <Canvas
      width={window.innerWidth}
      height={window.innerHeight}
      loop
      meta={ref}
    >
      <Blob x={window.innerWidth / 2} y={window.innerHeight / 2} />
      <Stage style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>Hello World</p>
      </Stage>
    </Canvas>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
