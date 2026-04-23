import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber' // 核心修复：补齐 useFrame
import * as THREE from 'three'
import gsap from 'gsap'
import useStore from '../store'

export default function ShatterParticles() {
  const pointsRef = useRef()
  const { shatterTrigger } = useStore()
  const count = 5000 
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    return [pos, vel]
  }, [])

  useEffect(() => {
    if (shatterTrigger === 0) return
    
    const array = pointsRef.current.geometry.attributes.position.array
    for(let i=0; i<count; i++) {
      const i3 = i * 3
      array[i3] = (Math.random() - 0.5) * 4
      array[i3+1] = (Math.random() - 0.5) * 4
      array[i3+2] = (Math.random() - 0.5) * 4
      
      velocities[i3] = (Math.random() - 0.5) * 0.5
      velocities[i3+1] = (Math.random() - 0.5) * 0.5
      velocities[i3+2] = (Math.random() - 0.5) * 0.5
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    
    gsap.fromTo(pointsRef.current.material, 
      { opacity: 1 }, 
      { opacity: 0, duration: 2, ease: "power2.out" }
    )
  }, [shatterTrigger])

  useFrame(() => {
    if (shatterTrigger === 0 || !pointsRef.current) return
    const array = pointsRef.current.geometry.attributes.position.array
    for(let i=0; i<count; i++) {
      const i3 = i * 3
      array[i3] += velocities[i3]
      array[i3+1] += velocities[i3+1]
      array[i3+2] += velocities[i3+2]
      velocities[i3] *= 0.98 
      velocities[i3+1] *= 0.98
      velocities[i3+2] *= 0.98
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#00ffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}
