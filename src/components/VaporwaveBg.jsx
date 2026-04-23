import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function VaporwaveBg() {
  const meshRef = useRef()
  
  const shader = {
    uniforms: {
      uTime: { value: 0 },
      uColorTop: { value: new THREE.Color('#00ccff') },
      uColorBottom: { value: new THREE.Color('#ff00cc') }
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

      float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
      }

      void main() {
        // 渐变
        vec3 color = mix(uColorBottom, uColorTop, vUv.y);
        
        // 动态数字噪声 (Grain)
        float grain = (random(vUv + uTime * 0.05) - 0.5) * 0.12;
        
        gl_FragColor = vec4(color + grain, 1.0);
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
      <shaderMaterial args={[shader]} depthWrite={false} />
    </mesh>
  )
}
