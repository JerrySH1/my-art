import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, useCursor, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import useStore from '../store'

// 自定义马赛克着色器材质
const MosaicMaterial = {
  uniforms: {
    uTexture: { value: null },
    uResolution: { value: 10.0 }, // 马赛克密度
    uOpacity: { value: 1.0 },
    uHover: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uResolution;
    uniform float uOpacity;
    uniform float uHover;
    varying vec2 vUv;
    void main() {
      // 马赛克核心逻辑
      vec2 uv = vUv;
      if (uResolution > 1.0) {
        uv = floor(vUv * uResolution) / uResolution;
      }
      vec4 tex = texture2D(uTexture, uv);
      gl_FragColor = vec4(tex.rgb, uOpacity);
    }
  `
}

export default function CubeItem({ project, position, scatteredPos }) {
  const meshRef = useRef()
  const matRef = useRef()
  const { viewport } = useThree()
  const { view, activeProject, enterDetail } = useStore()
  const [hovered, setHovered] = useState(false)
  
  const texture = useTexture(project.thumbnail)
  useCursor(hovered)

  const isActive = activeProject?.id === project.id
  const isOtherActive = activeProject && !isActive

  // 1. 位置与粒子化转场逻辑 (GSAP)
  useEffect(() => {
    if (!meshRef.current) return
    
    // 状态 C: 选中块移动到左侧，其余块“粒子化”缩小消失
    if (view === 'DETAIL') {
      if (isActive) {
        // 选中项移动到左侧视觉重心 (响应式)
        gsap.to(meshRef.current.position, {
          x: -viewport.width * 0.15,
          y: 0,
          z: 5,
          duration: 1.5,
          ease: "expo.inOut"
        })
        gsap.to(meshRef.current.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1.5 })
      } else {
        // 其他项粒子化消失 (缩放到0并伴随轻微位移)
        gsap.to(meshRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power4.in" })
        gsap.to(meshRef.current.position, { 
          y: (Math.random() - 0.5) * 5, 
          x: (Math.random() - 0.5) * 5, 
          duration: 1 
        })
      }
    } else {
      // 状态 A / D: 恢复位置或进入散开状态
      const target = view === 'SCATTER' ? scatteredPos : new THREE.Vector3().fromArray(position)
      gsap.to(meshRef.current.position, {
        x: target.x, y: target.y, z: target.z,
        duration: 1.5,
        ease: "power3.out"
      })
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 1 })
    }
  }, [view, isActive, viewport, position, scatteredPos])

  // 2. 马赛克平滑切换与动画
  useFrame((state) => {
    if (!matRef.current) return
    
    // 目标像素密度：选中/悬停 = 清晰 (128+), 平时 = 极低 (15)
    const targetRes = (hovered || isActive) ? 128.0 : 15.0
    matRef.current.uniforms.uResolution.value = THREE.MathUtils.lerp(
      matRef.current.uniforms.uResolution.value, 
      targetRes, 
      0.05
    )

    // 状态 D: 散开后的漂浮感
    if (view === 'SCATTER' && !isActive) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + project.id) * 0.005
    }
  })

  return (
    <group
      ref={meshRef}
      onClick={(e) => { e.stopPropagation(); enterDetail(project); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[2.2, 2.2, 0.3]} radius={0.12} smoothness={4}>
        <shaderMaterial
          ref={matRef}
          attach="material"
          args={[MosaicMaterial]}
          uniforms-uTexture-value={texture}
          transparent={true}
        />
      </RoundedBox>
    </group>
  )
}
