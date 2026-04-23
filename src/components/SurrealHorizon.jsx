import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SurrealHorizon() {
  const meshRef = useRef()

  const shaderArgs = {
    uniforms: {
      uTime: { value: 0 },
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
      varying vec2 vUv;

      float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
      }

      void main() {
        float y = vUv.y;
        vec3 color = vec3(0.0);

        vec3 lavender = vec3(0.7, 0.6, 0.9);
        vec3 darkCrimson = vec3(0.4, 0.0, 0.05);
        vec3 black = vec3(0.02, 0.01, 0.03);
        vec3 brightRed = vec3(1.0, 0.1, 0.1);
        vec3 cyanBlue = vec3(0.0, 0.6, 0.9);
        vec3 peach = vec3(1.0, 0.6, 0.5);

        // 使用 smoothstep 实现平滑的地平线辉光
        float horizonGlow = exp(-pow(y - 0.5, 2.0) * 1500.0); 
        
        if (y > 0.52) {
          color = mix(darkCrimson, lavender, smoothstep(0.52, 1.0, y));
        } else if (y > 0.5) {
          color = mix(black, darkCrimson, smoothstep(0.5, 0.52, y));
        } else if (y > 0.48) {
          color = mix(cyanBlue, black, smoothstep(0.48, 0.5, y));
        } else {
          color = mix(peach, cyanBlue, smoothstep(0.0, 0.48, y));
        }

        // 注入辉光
        color += horizonGlow * brightRed * 1.5;

        // 动态噪点
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
      <shaderMaterial args={[shaderArgs]} depthWrite={false} />
    </mesh>
  )
}
