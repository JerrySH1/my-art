import { create } from 'zustand'
import * as THREE from 'three'

// 生成背景散落位置（更深的Z轴和更广的XY分布）
function computeBackgroundScatterPositions(count, viewport) {
  const positions = []
  
  const areaW = (viewport.width || 20) * 1.5
  const areaH = (viewport.height || 10) * 1.5

  for (let i = 0; i < count; i++) {
    const seed = (i + 1) * 12345
    const randX = ((seed % 1000) / 1000) - 0.5
    const randY = (((seed * 6789) % 1000) / 1000) - 0.5
    const randZ = (((seed * 9876) % 1000) / 1000)

    const x = randX * areaW
    const y = randY * areaH
    // 向后推移 Z 轴，产生深度散落爆炸感
    const z = -15 - (randZ * 20) 

    positions.push(new THREE.Vector3(x, y, z))
  }
  return positions
}

export const useStore = create((set, get) => ({
  view: 'GRID', 
  data: null,
  activeProject: null,
  scatteredPositions: [],
  viewport: { width: 0, height: 0 },

  setData: (data) => set({ data }),
  setViewport: (viewport) => set({ viewport }),
  
  enterDetail: (project) => {
    const { data, viewport } = get()
    const projects = data?.projects?.slice(0, 6) || []
    const pos = computeBackgroundScatterPositions(projects.length, viewport)
    set({ 
      activeProject: project, 
      view: 'DETAIL',
      scatteredPositions: pos
    })
  },

  goBack: () => set({ view: 'GRID', activeProject: null }),

  resetToGrid: () => set({ view: 'GRID', activeProject: null })
}))

export default useStore
