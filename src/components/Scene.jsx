import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import useStore from '../store'
import PortfolioCube from './PortfolioCube'
import ShatterParticles from './ShatterParticles'

export default function Scene() {
  const { view, data, enterScatter } = useStore()
  const { camera, viewport, controls, size } = useThree()
  const groupRef = useRef()

  useEffect(() => {
    if (view === 'SCATTERED' && data) {
      enterScatter(viewport)
    }
  }, [view, data, viewport, enterScatter])

  // 1. 自转逻辑：严格仅在 CUBE 模式运行
  useFrame((state) => {
    if (!groupRef.current || view !== 'CUBE') return
    groupRef.current.rotation.y += 0.005
    groupRef.current.rotation.x += 0.002
  })

  // 2. 核心重构：进入详情态时强制清除所有 parent 级旋转
  useEffect(() => {
    if (!controls || !camera || !groupRef.current) return

    if (view === 'DETAIL') {
      // 停止 autoRotate 干扰
      controls.autoRotate = false

      // 强制主容器归零：消除 parent 的旋转累积
      gsap.to(groupRef.current.rotation, {
        x: 0, y: 0, z: 0,
        duration: 1.2,
        ease: "expo.inOut"
      })

      camera.setViewOffset(size.width, size.height, size.width * 0.25, 0, size.width, size.height)
      camera.updateProjectionMatrix()

      gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.2, ease: "expo.inOut" })
      gsap.to(camera.position, { x: 0, y: 0, z: 12, duration: 1.2, ease: "expo.inOut" })
      
      controls.enableRotate = false 
      controls.enableZoom = true
      controls.enablePan = true
      controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
    } else {
      camera.clearViewOffset()
      camera.updateProjectionMatrix()
      
      controls.enableRotate = true
      controls.enableZoom = true
      controls.enablePan = false
      controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
      
      gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.2, ease: "expo.inOut" })
    }
  }, [view, size, camera, controls])

  const { scatteredPositions } = useStore()

  return (
    <group ref={groupRef}>
      <PortfolioCube scatterPositions={scatteredPositions} />
      <ShatterParticles />
    </group>
  )
}
