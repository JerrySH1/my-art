import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, useTexture, useCursor, Edges } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import useStore from '../store'

export default function ArtCard({ project, gridPos, scatteredPos }) {
  const meshRef = useRef()
  const { viewport } = useThree()
  const texture = useTexture(project.thumbnail)
  const { view, activeProject, enterDetail } = useStore()
  const [hovered, setHovered] = useState(false)
  
  useCursor(hovered)
  
  const isActive = activeProject?.id === project.id
  const isDetail = view === 'DETAIL'
  
  // 决定霓虹灯的颜色，可以基于 project id 产生不同的颜色
  const neonColor = new THREE.Color().setHSL((parseInt(project.id) * 0.15) % 1, 0.8, 0.6)

  useEffect(() => {
    if (!meshRef.current) return
    
    if (isDetail) {
      if (isActive) {
        // 选中卡片：移动到左侧，放大，正对屏幕
        const img = texture.image;
        const imgWidth = img?.width || img?.naturalWidth || img?.videoWidth || 1;
        const imgHeight = img?.height || img?.naturalHeight || img?.videoHeight || 1;
        const aspect = img ? (imgWidth / imgHeight) : 1.5;
        const scaleBase = viewport.height * 0.45;
        
        gsap.to(meshRef.current.position, { 
          x: -(viewport.width || 20) / 4, 
          y: 0, 
          z: 2, // 稍微往前一点，突出层级
          duration: 1.2, 
          ease: "expo.inOut" 
        })
        gsap.to(meshRef.current.rotation, { x: 0, y: 0, z: 0, duration: 1.2, ease: "expo.inOut" })
        gsap.to(meshRef.current.scale, { x: scaleBase * aspect / 3, y: scaleBase / 2, z: 1, duration: 1.2, ease: "expo.inOut" })
      } else {
        // 未选中卡片：散落到深层背景 (视频中的背景爆炸效果)
        const target = scatteredPos || gridPos;
        const tx = isNaN(target.x) ? gridPos.x : target.x;
        const ty = isNaN(target.y) ? gridPos.y : target.y;
        const tz = isNaN(target.z) ? -20 : target.z;
        
        gsap.to(meshRef.current.position, { 
          x: tx, y: ty, z: tz, 
          duration: 1.2, 
          ease: "expo.inOut" 
        })
        
        // 基于坐标产生伪随机旋转角度，增加空间混乱感
        const randRotX = (tx % 1) * Math.PI;
        const randRotY = (ty % 1) * Math.PI;
        const randRotZ = (tz % 1) * Math.PI;
        gsap.to(meshRef.current.rotation, { x: randRotX, y: randRotY, z: randRotZ, duration: 1.2, ease: "expo.inOut" })
        gsap.to(meshRef.current.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 1.2, ease: "expo.inOut" })
      }
    } else {
      // 恢复网格态
      gsap.to(meshRef.current.position, { x: gridPos.x, y: gridPos.y, z: 0, duration: 1.2, ease: "expo.inOut" })
      gsap.to(meshRef.current.rotation, { x: 0, y: 0, z: 0, duration: 1.2, ease: "expo.inOut" })
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: "expo.inOut" })
    }
  }, [view, isActive, viewport, gridPos, scatteredPos, texture])

  return (
    <group
      ref={meshRef}
      onClick={(e) => { e.stopPropagation(); enterDetail(project); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 玻璃质感主体厚度块 */}
      <RoundedBox args={[3.2, 2.2, 0.4]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial 
          transmission={0.9} 
          opacity={1} 
          metalness={0.2} 
          roughness={0.1} 
          ior={1.5} 
          thickness={0.5}
          color="#ffffff"
        />
        {/* 霓虹发光边缘 */}
        <Edges 
          linewidth={hovered || isActive ? 4 : 2} 
          threshold={15} 
          color={hovered || isActive ? "#ffffff" : neonColor} 
          toneMapped={false}
        />
      </RoundedBox>

      {/* 封面图贴花，贴在玻璃块的正前方 */}
      <mesh position={[0, 0, 0.21]}>
        <planeGeometry args={[3.0, 2.0]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}
