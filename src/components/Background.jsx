import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function Background() {
  const meshRef = useRef()
  const { viewport } = useThree()

  const shaderArgs = {
    uniforms: {
      uTime: { value: 0 },
      uColorTop: { value: new THREE.Color('#00a2ff') }, // 亮蓝色
      uColorBottom: { value: new THREE.Color('#ff00d4') } // 亮粉色
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorTop;
      uniform vec3 uColorBottom;
      varying vec2 vUv;

      // 快速噪点函数
      float noise(vec2 uv) {
        return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        // 1. 线性渐变
        vec3 gradient = mix(uColorBottom, uColorTop, vUv.y);
        
        // 2. 动态胶片噪点
        float n = (noise(vUv + uTime * 0.01) - 0.5) * 0.15;
        
        // 3. 结果合并
        gl_FragColor = vec4(gradient + n, 1.0);
      }
    `
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef} frustumCulled={false} raycast={() => null}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial args={[shaderArgs]} depthWrite={false} />
    </mesh>
  )
}
