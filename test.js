const THREE = require('three')

const viewport = { width: 13.1, height: 13.1 }
const count = 6

const positions = []
const cols = 3
const rows = 2

const areaW = viewport.width * 0.7
const areaH = viewport.height * 0.6

const spacingX = areaW / cols
const spacingY = areaH / rows
const jitterAmount = 1.2

for (let i = 0; i < count; i++) {
  const colIdx = i % cols
  const rowIdx = Math.floor(i / cols)

  const centerX = (colIdx - (cols - 1) / 2) * spacingX
  const centerY = ((rowIdx - (rows - 1) / 2) * -1) * spacingY

  const x = centerX + (Math.random() - 0.5) * jitterAmount
  const y = centerY + (Math.random() - 0.5) * jitterAmount

  console.log(`Card ${i}: x=${x}, y=${y}`)
}
