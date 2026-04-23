import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import useStore from '../store'
import ArtCard from './ArtCard'

export default function ArtGrid() {
  const groupRef = useRef()
  const { data, view, scatteredPositions } = useStore()
  const projects = data?.projects?.slice(0, 6) || []

  // 初始网格位置 (3列2行)，向右偏移以避开左侧巨大的个人信息面板
  const gridPositions = useMemo(() => {
    const positions = []
    const spacingX = 4.8
    const spacingY = 3.8
    for (let i = 0; i < 6; i++) {
      const col = (i % 3) - 1
      const row = Math.floor(i / 3) - 0.5
      // X轴加 2.5 偏移量，将整个网格向右侧移动
      positions.push(new THREE.Vector3(col * spacingX + 2.5, -row * spacingY, 0))
    }
    return positions
  }, [])

  useEffect(() => {
    if (!groupRef.current) return
    if (view === 'DETAIL') {
      // 核心修复：获取当前旋转并取模，防止多圈导致的疯狂旋转
      let rx = groupRef.current.rotation.x % (Math.PI * 2)
      let ry = groupRef.current.rotation.y % (Math.PI * 2)
      let rz = groupRef.current.rotation.z % (Math.PI * 2)
      
      if (rx > Math.PI) rx -= Math.PI * 2; else if (rx < -Math.PI) rx += Math.PI * 2;
      if (ry > Math.PI) ry -= Math.PI * 2; else if (ry < -Math.PI) ry += Math.PI * 2;
      if (rz > Math.PI) rz -= Math.PI * 2; else if (rz < -Math.PI) rz += Math.PI * 2;

      groupRef.current.rotation.set(rx, ry, rz)

      // 选中的时候平滑归零，配合子卡片产生三维空间中的优美弧线
      gsap.to(groupRef.current.rotation, { 
        x: 0, y: 0, z: 0, 
        duration: 1.2, 
        ease: "expo.inOut" 
      })
      gsap.to(groupRef.current.position, {
        y: 0,
        duration: 1.2,
        ease: "expo.inOut"
      })
    } else {
      // 恢复到倾斜网格
      gsap.to(groupRef.current.rotation, { 
        x: 0.1, y: -0.2, z: 0.05, 
        duration: 1.2, 
        ease: "expo.inOut" 
      })
    }
  }, [view])

  useFrame((state) => {
    if (!groupRef.current) return
    if (view === 'GRID') {
      // 添加微妙的整体漂浮感
      const t = state.clock.elapsedTime
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.2
      // 保留细微的自转累加，叠加在倾斜角之上
      groupRef.current.rotation.y += Math.sin(t * 0.2) * 0.001
      groupRef.current.rotation.x += Math.cos(t * 0.3) * 0.001
    }
  })

  return (
    <group ref={groupRef}>
      {projects.map((proj, i) => (
        <ArtCard 
          key={proj.id} 
          project={proj} 
          gridPos={gridPositions[i]} 
          scatteredPos={scatteredPositions[i]}
        />
      ))}
    </group>
  )
}
