import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'

const ROOM = {
  width: 34,
  height: 20,
  depth: 34,
  floorY: -8.8,
  centerZ: -2.5
}

const PALETTE = ['#f5f7ff', '#8bc7ff', '#597dff', '#b49bff', '#ffb36b', '#d6ff7c']
const WORDS = [
  'ENTP',
  'E人',
  '好奇心',
  '探索欲',
  'AIGC',
  'Agent',
  'Vibe Coding',
  '绘画',
  '艺术',
  '设计',
  '市场营销',
  '新媒体运营',
  '个人ip',
  '数字艺术家',
  '好玩的事',
  '松弛',
  '黑塞',
  '加缪',
  '音乐剧',
  '钢琴'
]
const NO_RAYCAST = () => null

function createRng(seed = 1) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function range(rng, min, max) {
  return min + (max - min) * rng()
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)]
}

function createFrameWordTexture(word) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const isAscii = /^[\x00-\x7F]+$/.test(word)
  const charCount = Math.max(word.length, 2)
  const fontSize = isAscii
    ? Math.max(132, 360 - charCount * 15)
    : Math.max(148, 326 - charCount * 18)
  const fontFamily = isAscii
    ? '"Arial Black", "Helvetica Neue", sans-serif'
    : '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `900 ${fontSize}px ${fontFamily}`
  ctx.fillStyle = '#ffffff'
  ctx.globalAlpha = 0.9
  ctx.fillText(word, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function createShadowWordTexture(word) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const isAscii = /^[\x00-\x7F]+$/.test(word)
  const charCount = Math.max(word.length, 2)
  const fontSize = isAscii
    ? Math.max(86, 180 - charCount * 6)
    : Math.max(90, 158 - charCount * 9)
  const fontFamily = isAscii
    ? '"Arial Black", "Helvetica Neue", sans-serif'
    : '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.font = `900 ${fontSize}px ${fontFamily}`
  ctx.fillStyle = '#ffffff'

  const wordWidth = ctx.measureText(word).width
  const cellWidth = Math.max(wordWidth + fontSize * 0.42, canvas.width / 3.7)
  const cellHeight = fontSize * 1.06

  for (let row = 0, y = fontSize * 0.78; y < canvas.height + cellHeight; row += 1, y += cellHeight) {
    const offset = row % 2 === 0 ? 0 : cellWidth * 0.16
    ctx.globalAlpha = row % 2 === 0 ? 0.94 : 0.74

    for (let x = -cellWidth; x < canvas.width + cellWidth; x += cellWidth) {
      ctx.fillText(word, x + offset, y)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function createWordTextureAtlas(words, textureFactory) {
  return Object.fromEntries(
    words
      .map((word) => [word, textureFactory(word)])
      .filter(([, texture]) => texture)
  )
}

function createFrameField() {
  const rng = createRng(421337)
  const frames = []

  const pushFrame = (kind, position, rotation) => {
    const isProjection = kind === 'projection'
    const isCore = kind === 'core'
    const width = range(
      rng,
      isProjection ? 1.15 : isCore ? 1.15 : 0.82,
      isCore ? 3.15 : isProjection ? 4.1 : 2.6
    )
    const height = range(
      rng,
      isProjection ? 0.82 : isCore ? 0.82 : 0.56,
      isCore ? 2.45 : isProjection ? 3.0 : 1.95
    )
    const color = pick(rng, PALETTE)
    const filled = rng() > (isCore ? 0.52 : isProjection ? 0.92 : 0.88)
    const word = WORDS[frames.length % WORDS.length]

    frames.push({
      id: `${kind}-${frames.length}`,
      kind,
      word,
      position,
      rotation,
      size: [width, height],
      thickness: range(rng, 0.03, 0.065),
      depth: range(rng, 0.018, 0.04),
      color,
      opacity: range(rng, isProjection ? 0.24 : 0.52, isCore ? 0.98 : isProjection ? 0.58 : 0.86),
      fillOpacity: filled ? range(rng, isProjection ? 0.04 : 0.08, isProjection ? 0.12 : 0.2) : 0,
      glow: isCore ? range(rng, 4.3, 6.2) : isProjection ? range(rng, 2.1, 3.9) : range(rng, 2.4, 4.8),
      floatAmp: isCore ? range(rng, 0.08, 0.22) : isProjection ? range(rng, 0.005, 0.03) : range(rng, 0.04, 0.12),
      floatSpeed: range(rng, isProjection ? 0.08 : 0.25, isProjection ? 0.22 : 0.7),
      wobble: range(rng, isProjection ? 0.004 : 0.015, isProjection ? 0.015 : 0.05),
      phase: range(rng, 0, Math.PI * 2)
    })
  }

  for (let i = 0; i < 28; i += 1) {
    const z = range(rng, -24, 8)
    const y = range(rng, -6.5, 7.8)
    const side = i % 2 === 0 ? -1 : 1
    const x = side * range(rng, 12.6, 15.3)
    pushFrame(
      'wall',
      [x, y, z],
      [
        range(rng, -0.18, 0.18),
        side > 0 ? -Math.PI / 2 + range(rng, -0.35, 0.35) : Math.PI / 2 + range(rng, -0.35, 0.35),
        range(rng, -0.45, 0.45)
      ]
    )
  }

  for (let i = 0; i < 20; i += 1) {
    pushFrame(
      'back',
      [range(rng, -13, 13), range(rng, -6.8, 8.1), range(rng, -27.5, -21.5)],
      [range(rng, -0.25, 0.25), range(rng, -0.25, 0.25), range(rng, -0.65, 0.65)]
    )
  }

  for (let i = 0; i < 20; i += 1) {
    pushFrame(
      'ceiling',
      [range(rng, -13.5, 13.5), range(rng, 8.4, 9.4), range(rng, -25, 7)],
      [Math.PI / 2 + range(rng, -0.18, 0.18), range(rng, -0.3, 0.3), range(rng, -0.55, 0.55)]
    )
  }

  for (let i = 0; i < 26; i += 1) {
    const spread = i < 10 ? 4.8 : 7.8
    pushFrame(
      'core',
      [range(rng, -spread, spread), range(rng, -4.6, 5.8), range(rng, -18.5, -9.5)],
      [range(rng, -0.95, 0.95), range(rng, -0.95, 0.95), range(rng, -0.95, 0.95)]
    )
  }

  for (let i = 0; i < 16; i += 1) {
    pushFrame(
      'projection',
      [range(rng, -13.6, 13.6), range(rng, -6.7, 8.6), -28.2],
      [0, 0, range(rng, -0.8, 0.8)]
    )
  }

  for (let i = 0; i < 20; i += 1) {
    pushFrame(
      'projection',
      [range(rng, -13, 13), ROOM.floorY + 0.1, range(rng, -24, 7)],
      [-Math.PI / 2, range(rng, -0.15, 0.15), range(rng, -0.8, 0.8)]
    )
  }

  for (let i = 0; i < 12; i += 1) {
    const side = i % 2 === 0 ? -1 : 1
    pushFrame(
      'projection',
      [side * (ROOM.width / 2 + 0.7), range(rng, -6.4, 7.8), range(rng, -22, 4)],
      [range(rng, -0.08, 0.08), side > 0 ? -Math.PI / 2 : Math.PI / 2, range(rng, -0.75, 0.75)]
    )
  }

  return frames
}

function createSkyFrameField() {
  const rng = createRng(99017)
  const frames = []

  const pushSkyFrame = (position, rotation, scale = 1) => {
    frames.push({
      id: `sky-${frames.length}`,
      kind: 'sky',
      word: WORDS[frames.length % WORDS.length],
      position,
      rotation,
      size: [range(rng, 9.5, 22) * scale, range(rng, 5.8, 14) * scale],
      thickness: range(rng, 0.08, 0.2),
      depth: range(rng, 0.025, 0.05),
      color: pick(rng, PALETTE),
      opacity: range(rng, 0.22, 0.48),
      fillOpacity: rng() > 0.9 ? range(rng, 0.02, 0.06) : 0,
      glow: range(rng, 2.4, 4.8),
      floatAmp: range(rng, 0.02, 0.09),
      floatSpeed: range(rng, 0.04, 0.14),
      wobble: range(rng, 0.004, 0.012),
      phase: range(rng, 0, Math.PI * 2)
    })
  }

  for (let i = 0; i < 12; i += 1) {
    pushSkyFrame(
      [range(rng, -26, 26), range(rng, -14, 16), ROOM.centerZ - range(rng, 34, 46)],
      [range(rng, -0.18, 0.18), range(rng, -0.2, 0.2), range(rng, -0.75, 0.75)],
      range(rng, 0.8, 1.3)
    )
  }

  for (let i = 0; i < 7; i += 1) {
    const side = i % 2 === 0 ? -1 : 1
    pushSkyFrame(
      [side * range(rng, 33, 42), range(rng, -14, 16), range(rng, -20, 24)],
      [range(rng, -0.08, 0.08), side > 0 ? -Math.PI / 2 : Math.PI / 2, range(rng, -0.7, 0.7)],
      range(rng, 0.7, 1.15)
    )
  }

  for (let i = 0; i < 6; i += 1) {
    pushSkyFrame(
      [range(rng, -28, 28), range(rng, 18, 25), range(rng, -24, 18)],
      [Math.PI / 2 + range(rng, -0.12, 0.12), range(rng, -0.16, 0.16), range(rng, -0.7, 0.7)],
      range(rng, 0.75, 1.2)
    )
  }

  for (let i = 0; i < 8; i += 1) {
    pushSkyFrame(
      [range(rng, -26, 26), range(rng, -16, 16), ROOM.centerZ + range(rng, 30, 42)],
      [range(rng, -0.22, 0.22), range(rng, -0.22, 0.22), range(rng, -0.75, 0.75)],
      range(rng, 0.65, 1.1)
    )
  }

  return frames
}

function NeonFrame({ frame, boxGeometry, planeGeometry, setRef, frameTexture }) {
  const { size, thickness, depth, color, opacity, fillOpacity, glow } = frame
  const [width, height] = size
  const textOpacity = frame.kind === 'sky'
    ? 0.14
    : frame.kind === 'projection'
      ? 0.2
      : frame.kind === 'core'
        ? 0.28
        : 0.22

  return (
    <group
      ref={setRef}
      position={frame.position}
      rotation={frame.rotation}
    >
      <mesh
        geometry={boxGeometry}
        position={[0, height / 2 - thickness / 2, 0]}
        scale={[width, thickness, depth]}
        raycast={NO_RAYCAST}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          metalness={0.08}
          roughness={0.18}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>

      <mesh
        geometry={boxGeometry}
        position={[0, -height / 2 + thickness / 2, 0]}
        scale={[width, thickness, depth]}
        raycast={NO_RAYCAST}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          metalness={0.08}
          roughness={0.18}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>

      <mesh
        geometry={boxGeometry}
        position={[-width / 2 + thickness / 2, 0, 0]}
        scale={[thickness, height, depth]}
        raycast={NO_RAYCAST}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          metalness={0.08}
          roughness={0.18}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>

      <mesh
        geometry={boxGeometry}
        position={[width / 2 - thickness / 2, 0, 0]}
        scale={[thickness, height, depth]}
        raycast={NO_RAYCAST}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          metalness={0.08}
          roughness={0.18}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>

      {fillOpacity > 0 && (
        <mesh
          geometry={planeGeometry}
          position={[0, 0, -depth * 0.4]}
          scale={[width * 0.74, height * 0.74, 1]}
          raycast={NO_RAYCAST}
        >
          <meshBasicMaterial
            color={color}
            transparent
            opacity={fillOpacity}
            toneMapped={false}
          />
        </mesh>
      )}

      {frameTexture && (
        <mesh
          geometry={planeGeometry}
          position={[0, 0, -depth * 0.42]}
          scale={[width * 0.82, height * 0.82, 1]}
          raycast={NO_RAYCAST}
        >
          <meshBasicMaterial
            map={frameTexture}
            color={color}
            transparent
            opacity={textOpacity}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

function RoomShell() {
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#050507',
        roughness: 1,
        metalness: 0.02,
        side: THREE.DoubleSide
      }),
    []
  )

  return (
    <group>
      <mesh position={[0, 0, ROOM.centerZ - ROOM.depth / 2 - 1]} material={wallMaterial} raycast={NO_RAYCAST}>
        <planeGeometry args={[ROOM.width + 8, ROOM.height + 6]} />
      </mesh>

      <mesh
        position={[-ROOM.width / 2 - 1.6, 0, ROOM.centerZ]}
        rotation={[0, Math.PI / 2, 0]}
        material={wallMaterial}
        raycast={NO_RAYCAST}
      >
        <planeGeometry args={[ROOM.depth + 6, ROOM.height + 6]} />
      </mesh>

      <mesh
        position={[ROOM.width / 2 + 1.6, 0, ROOM.centerZ]}
        rotation={[0, -Math.PI / 2, 0]}
        material={wallMaterial}
        raycast={NO_RAYCAST}
      >
        <planeGeometry args={[ROOM.depth + 6, ROOM.height + 6]} />
      </mesh>

      <mesh
        position={[0, ROOM.height / 2 + 1.1, ROOM.centerZ]}
        rotation={[Math.PI / 2, 0, 0]}
        material={wallMaterial}
        raycast={NO_RAYCAST}
      >
        <planeGeometry args={[ROOM.width + 8, ROOM.depth + 6]} />
      </mesh>
    </group>
  )
}

function WordShadow({ frame, planeGeometry, shadowTexture }) {
  const shadowColor = useMemo(
    () => new THREE.Color(frame.color).lerp(new THREE.Color('#ffffff'), 0.56),
    [frame.color]
  )

  const isFloorProjection = frame.kind === 'projection' && Math.abs(frame.position[1] - (ROOM.floorY + 0.1)) < 0.35
  if (!shadowTexture || !isFloorProjection) {
    return null
  }

  const [width, height] = frame.size
  const shadowWidth = Math.max(width * 1.55, 3.8)
  const shadowHeight = Math.max(height * 2.6, 5.8)
  const baseX = frame.position[0] + Math.sin(frame.rotation[2]) * 0.22
  const baseZ = frame.position[2] + 0.18
  const rotationZ = frame.rotation[2] * 0.72
  const y = ROOM.floorY + 0.03

  return (
    <>
      <mesh
        geometry={planeGeometry}
        position={[baseX, y, baseZ]}
        rotation={[-Math.PI / 2, 0, rotationZ]}
        scale={[shadowWidth * 1.08, shadowHeight * 1.08, 1]}
        raycast={NO_RAYCAST}
      >
        <meshBasicMaterial
          map={shadowTexture}
          color={shadowColor}
          transparent
          opacity={0.16}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <mesh
        geometry={planeGeometry}
        position={[baseX, y + 0.01, baseZ]}
        rotation={[-Math.PI / 2, 0, rotationZ]}
        scale={[shadowWidth, shadowHeight, 1]}
        raycast={NO_RAYCAST}
      >
        <meshBasicMaterial
          map={shadowTexture}
          color={shadowColor}
          transparent
          opacity={0.34}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

function SkyShell({ boxGeometry, planeGeometry, frameWordTextures }) {
  const skyFrames = useMemo(() => createSkyFrameField(), [])
  const skyFrameRefs = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    skyFrameRefs.current.forEach((node, index) => {
      const frame = skyFrames[index]
      if (!node || !frame) return

      node.position.y = frame.position[1] + Math.sin(t * frame.floatSpeed + frame.phase) * frame.floatAmp
      node.position.x = frame.position[0] + Math.cos(t * frame.floatSpeed * 0.5 + frame.phase) * frame.floatAmp * 0.4
      node.rotation.z = frame.rotation[2] + Math.sin(t * frame.floatSpeed * 0.7 + frame.phase) * frame.wobble
      node.rotation.x = frame.rotation[0] + Math.cos(t * frame.floatSpeed * 0.55 + frame.phase) * frame.wobble
    })
  })

  return (
    <group>
      <mesh position={[0, 0, ROOM.centerZ]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[78, 36, 36]} />
        <meshBasicMaterial color="#020205" side={THREE.BackSide} toneMapped={false} />
      </mesh>

      {skyFrames.map((frame, index) => (
        <NeonFrame
          key={frame.id}
          frame={frame}
          boxGeometry={boxGeometry}
          planeGeometry={planeGeometry}
          frameTexture={frameWordTextures[frame.word]}
          setRef={(node) => {
            skyFrameRefs.current[index] = node
          }}
        />
      ))}
    </group>
  )
}

export default function SurrealHorizon() {
  const fieldRef = useRef()
  const frameRefs = useRef([])
  const frames = useMemo(() => createFrameField(), [])
  const frameWordTextures = useMemo(() => createWordTextureAtlas(WORDS, createFrameWordTexture), [])
  const shadowWordTextures = useMemo(() => createWordTextureAtlas(WORDS, createShadowWordTexture), [])
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (fieldRef.current) {
      fieldRef.current.rotation.y = Math.sin(t * 0.07) * 0.08
      fieldRef.current.position.z = Math.sin(t * 0.11) * 0.35
    }

    frameRefs.current.forEach((node, index) => {
      const frame = frames[index]
      if (!node || !frame) return

      node.position.y = frame.position[1] + Math.sin(t * frame.floatSpeed + frame.phase) * frame.floatAmp
      node.rotation.z = frame.rotation[2] + Math.sin(t * frame.floatSpeed * 0.8 + frame.phase) * frame.wobble
      node.rotation.x = frame.rotation[0] + Math.cos(t * frame.floatSpeed * 0.6 + frame.phase) * frame.wobble * 0.6
    })
  })

  return (
    <group ref={fieldRef}>
      <SkyShell
        boxGeometry={boxGeometry}
        planeGeometry={planeGeometry}
        frameWordTextures={frameWordTextures}
      />
      <RoomShell />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROOM.floorY, ROOM.centerZ]} raycast={NO_RAYCAST}>
        <planeGeometry args={[ROOM.width + 10, ROOM.depth + 10]} />
        <MeshReflectorMaterial
          color="#070709"
          metalness={0.15}
          roughness={0.92}
          blur={[400, 120]}
          mixBlur={1.6}
          mixStrength={14}
          resolution={1024}
          mirror={0.26}
          minDepthThreshold={0.2}
          maxDepthThreshold={1.4}
          depthScale={0.28}
          transparent
          opacity={0.96}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ROOM.floorY + 0.02, ROOM.centerZ]}
        raycast={NO_RAYCAST}
      >
        <planeGeometry args={[ROOM.width + 10, ROOM.depth + 10]} />
        <meshBasicMaterial color="#0b0c11" transparent opacity={0.2} />
      </mesh>

      {frames.map((frame) => (
        <WordShadow
          key={`${frame.id}-shadow`}
          frame={frame}
          planeGeometry={planeGeometry}
          shadowTexture={shadowWordTextures[frame.word]}
        />
      ))}

      {frames.map((frame, index) => (
        <NeonFrame
          key={frame.id}
          frame={frame}
          boxGeometry={boxGeometry}
          planeGeometry={planeGeometry}
          frameTexture={frameWordTextures[frame.word]}
          setRef={(node) => {
            frameRefs.current[index] = node
          }}
        />
      ))}

      <pointLight position={[0, 7, -12]} intensity={7} distance={34} color="#98b7ff" />
      <pointLight position={[-11, 2, -9]} intensity={4.5} distance={28} color="#ffb36b" />
      <pointLight position={[12, -1, -7]} intensity={4} distance={26} color="#7cc9ff" />
    </group>
  )
}
