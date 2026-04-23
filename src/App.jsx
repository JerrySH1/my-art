import { useEffect, Suspense, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from '@react-three/drei'
import SurrealHorizon from './components/SurrealHorizon'
import ArtGrid from './components/ArtGrid'
import UI from './components/UI'
import useStore from './store'

function ViewportSync() {
  const { viewport } = useThree()
  const setViewport = useStore((state) => state.setViewport)
  
  useEffect(() => {
    setViewport({ width: viewport.width || 20, height: viewport.height || 10 })
  }, [viewport.width, viewport.height, setViewport])
  
  return null
}

function CameraController() {
  const { view } = useStore()
  const { camera } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    if (view === 'DETAIL') {
      // 动画相机回到正前方，确保卡片平铺在屏幕左侧，忽略之前的拖拽角度
      gsap.to(camera.position, { x: 0, y: 0, z: 18, duration: 1.2, ease: "expo.inOut" })
      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, { x: 0, y: 0, z: 0, duration: 1.2, ease: "expo.inOut" })
      }
    } else {
      // 恢复到初始网格全景视角，防止用户在详情页缩放或平移后退回网格时视野不全
      gsap.to(camera.position, { x: 0, y: 0, z: 18, duration: 1.2, ease: "expo.inOut" })
      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, { x: 0, y: 0, z: 0, duration: 1.2, ease: "expo.inOut" })
      }
    }
  }, [view, camera])

  return (
    <OrbitControls 
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      // 在详情态启用平移，允许左键拖动查看上下左右细节
      enablePan={view === 'DETAIL'}
      // 动态配置鼠标按键映射：详情态下左键为平移(PAN)，默认态左键为旋转(ROTATE)
      mouseButtons={
        view === 'DETAIL' 
          ? { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.NONE }
          : { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
      }
      maxDistance={40}
      minDistance={5}
      // 在详情态禁用3D旋转以便保持卡片正对
      enableRotate={view !== 'DETAIL'}
    />
  )
}

function App() {
  const { setData, view } = useStore()

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error("Portfolio Engine Error", err))
  }, [setData])

  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 18], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <SurrealHorizon />
        </Suspense>

        <ViewportSync />

        <ambientLight intensity={1.0} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ff00ff" />

        <Suspense fallback={null}>
          <ArtGrid />
        </Suspense>

        <CameraController />
      </Canvas>

      <UI />
    </div>
  )
}

export default App
