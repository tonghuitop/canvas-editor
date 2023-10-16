import { useEffect, useRef } from 'react'

import data from './mock/data'
import Toolbar from './Toolbar'
import CanvasEditor from '../editor'

import './App.css'


function App() {
  const editorContainer = useRef(null)
  useEffect(() => {
    const editor = new CanvasEditor(editorContainer.current!, data)

    return () => {
      editor.unmount()
    }
  }, [])

  return (
    <div className="app">
      <Toolbar />
      <div className="editorContainer" ref={editorContainer}></div>
    </div>
  )
}

export default App
