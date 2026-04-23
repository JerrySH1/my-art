import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, useTexture, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import useStore from '../store'

function ProjectCard({ project, index, faceIdx, view, scatteredPos, isActive, onClick }) {
  const meshRef = useRef()
  const { viewport } = useThree()
  const texture = useTexture(project.thumbnail)
  
  // 初始魔方位置 (6个面)
  const cubePos = useMemo(() => {
    const d = 1.6
    const configs = [
      { p: [d, 0, 0], r: [0, Math.PI/2, 0] },  // Right
      { p: [-d, 0, 0], r: [0, -Math.PI/2, 0] }, // Left
      { p: [0, d, 0], r: [-Math.PI/2, 0, 0] }, // Top
      { p: [0, -d, 0], r: [Math.PI/2, 0, 0] }, // Bottom
      { p: [0, 0, d], r: [0, 0, 0] },          // Front
      { p: [0, 0, -d], r: [0, Math.PI, 0] }    // Back
    ]
    return configs[faceIdx]
  }, [faceIdx])

  useEffect(() => {
    if (!meshRef.current) return
    
    let tP = cubePos.p, tR = cubePos.r, tS = [1, 1, 1]

    if (view === 'DETAIL') {
      if (isActive) {
        // 核心修复：移动到左侧 50% 区域中心，高度占比 80%
        tP = [viewport.width / -4, 0, 5]
        tR = [0, 0, 0]
        tS = [2.2, 2.2, 1]
      } else {
        // 破碎消失
        tP = [(Math.random()-0.5)*40, (Math.random()-0.5)*40, -15]
        tS = [0, 0, 0]
      }
    } else if (view === 'SCATTERED') {
      tP = [scatteredPos.x, scatteredPos.y, scatteredPos.z]
      tR = [0, 0, 0]
      tS = [1.2, 1.2, 1]
    }

    gsap.to(meshRef.current.position, { x: tP[0], y: tP[1], z: tP[2], duration: 1.5, ease: "power4.inOut" })
    gsap.to(meshRef.current.rotation, { x: tR[0], y: tR[1], z: tR[2], duration: 1.5, ease: "power4.inOut" })
    gsap.to(meshRef.current.scale, { x: tS[0], y: tS[1], z: tS[2], duration: 1.5, ease: "power4.inOut" })
  }, [view, isActive, viewport, scatteredPos, cubePos])

  return (
    <group ref={meshRef} position={cubePos.p} rotation={cubePos.r}>
      <RoundedBox args={[3, 3, 0.2]} radius={0.08} smoothness={4} onClick={() => onClick(project)}>
        <meshPhysicalMaterial 
          map={texture} transparent 
          transmission={0.3} roughness={0.1} thickness={1} ior={1.45}
        />
      </RoundedBox>
    </group>
  )
}

export default function PortfolioSpace() {
  const { data, view, activeProject, scatteredPositions, enterDetail } = useStore()
  const { camera, viewport } = useThree()
  const groupRef = useRef()
  const controlsRef = useRef()

  const projects = data?.projects?.slice(0, 6) || []

  useFrame((state) => {
    if (!groupRef.current || view !== 'CUBE') return
    groupRef.current.rotation.y += 0.005
    groupRef.current.rotation.x += 0.002
  })

  // 转场：当进入 DETAIL 时，控制器的 Target 移动到左侧
  useEffect(() => {
    if (!controlsRef.current) return
    if (view === 'DETAIL') {
      const targetX = viewport.width / -4
      gsap.to(controlsRef.current.target, { x: targetX, y: 0, z: 5, duration: 1.5, ease: "expo.inOut" })
    } else {
      gsap.to(controlsRef.current.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: "expo.inOut" })
    }
  }, [view, viewport])

  return (
    <>
      <group ref={groupRef}>
        {projects.map((proj, i) => (
          <ProjectCard 
            key={proj.id} project={proj} faceIdx={i} view={view}
            isActive={activeProject?.id === proj.id}
            scatteredPos={scatteredPositions[i] || new THREE.Vector3()}
            onClick={enterDetail}
          />
        ))}
      </group>
      
      <OrbitControls 
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        autoRotate={view === 'CUBE'}
        enableZoom={view !== 'DETAIL' || true} // DETAIL 模式下允许缩放
        enableRotate={view !== 'DETAIL' || true} // DETAIL 模式下允许拖拽
      />
    </>
  )
}
