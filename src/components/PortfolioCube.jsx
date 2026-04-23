import { useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useTexture, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import useStore from '../store'

function FragmentPiece({ texture, gx, gy, project, onClick }) {
  const localPos = [(gx - 1) * 1.05, (1 - gy) * 1.05, 0]
  return (
    <RoundedBox 
      args={[1, 1, 0.05]} 
      position={localPos}
      radius={0.01} 
      smoothness={4} 
      onClick={(e) => { e.stopPropagation(); onClick(project); }}
    >
      <meshPhysicalMaterial 
        map={texture} 
        map-repeat={[1/3, 1/3]} 
        map-offset={[gx/3, (2-gy)/3]} 
        transparent 
        metalness={0} 
        roughness={1} 
      />
    </RoundedBox>
  )
}

function ProjectFace({ project, faceIdx, view, isActive, scatterData, onClick }) {
  const groupRef = useRef()
  const { viewport } = useThree()
  const texture = useTexture(project.thumbnail)

  const initialConfig = useMemo(() => {
    const d = 1.58
    const rotations = [[0, Math.PI/2, 0], [0, -Math.PI/2, 0], [-Math.PI/2, 0, 0], [Math.PI/2, 0, 0], [0, 0, 0], [0, Math.PI, 0]]
    const centers = [[d, 0, 0], [-d, 0, 0], [0, d, 0], [0, -d, 0], [0, 0, d], [0, 0, -d]]
    return { p: centers[faceIdx], r: rotations[faceIdx] }
  }, [faceIdx])

  const targetScale = useMemo(() => {
    if (!texture.image) return [1, 1, 1]
    const imageAspect = texture.image.width / texture.image.height
    const maxWidth = (viewport.width * 0.5) * 0.8
    const maxHeight = viewport.height * 0.8
    let sX, sY
    if (maxWidth / imageAspect <= maxHeight) {
      sX = maxWidth; sY = maxWidth / imageAspect
    } else {
      sY = maxHeight; sX = maxHeight * imageAspect
    }
    return [sX / 3.15, sY / 3.15, 1]
  }, [texture, viewport])

  // 关键：仅在挂载时设置初始位置，防止 React 属性干扰 GSAP
  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...initialConfig.p)
      groupRef.current.rotation.set(...initialConfig.r)
    }
  }, [])

  useEffect(() => {
    if (!groupRef.current) return
    let tP, tR, tS

    if (view === 'DETAIL') {
      if (isActive) {
        tP = [0, 0, 0]
        tR = [0, 0, 0] // 👈 强制归零，重置局部旋转轴
        tS = targetScale
      } else {
        tP = [(Math.random()-0.5)*100, (Math.random()-0.5)*100, -50]
        tR = initialConfig.r
        tS = [0, 0, 0]
      }
    } else if (view === 'SCATTERED' && scatterData) {
      tP = [scatterData.pos.x, scatterData.pos.y, scatterData.pos.z]
      tR = scatterData.rot || [0, 0, 0]
      tS = [0.4, 0.4, 0.4]
    } else {
      tP = initialConfig.p
      tR = initialConfig.r
      tS = [1, 1, 1]
    }

    // 统一触发 GSAP 动画，确保旋转归零与缩放同步，避免畸变
    gsap.to(groupRef.current.position, { x: tP[0], y: tP[1], z: tP[2], duration: 1.2, ease: "expo.inOut" })
    gsap.to(groupRef.current.rotation, { x: tR[0], y: tR[1], z: tR[2], duration: 1.2, ease: "expo.inOut" })
    gsap.to(groupRef.current.scale, { x: tS[0], y: tS[1], z: tS[2], duration: 1.2, ease: "expo.inOut" })
  }, [view, isActive, targetScale, initialConfig, scatterData])

  return (
    <group ref={groupRef}>
      {Array.from({ length: 9 }).map((_, i) => (
        <FragmentPiece 
          key={i} gx={i % 3} gy={Math.floor(i / 3)} 
          texture={texture} project={project} onClick={onClick}
        />
      ))}
    </group>
  )
}

export default function PortfolioCube({ scatterPositions = [] }) {
  const { data, view, activeProject, enterDetail } = useStore()
  const projects = data?.projects?.slice(0, 6) || []

  return (
    <group>
      {projects.map((proj, i) => (
        <ProjectFace 
          key={proj.id} project={proj} faceIdx={i} view={view}
          isActive={activeProject?.id === proj.id}
          scatterData={scatterPositions[i]} onClick={enterDetail}
        />
      ))}
    </group>
  )
}
