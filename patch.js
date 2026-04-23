const fs = require('fs');

// Patch App.jsx to securely pass viewport
let app = fs.readFileSync('src/App.jsx', 'utf-8');
app = app.replace(
  /setViewport\(viewport\)/,
  'setViewport({ width: viewport.width || 20, height: viewport.height || 10 })'
);
fs.writeFileSync('src/App.jsx', app);

// Patch store.js to secure computeGridJitterPositions
let store = fs.readFileSync('src/store.js', 'utf-8');
store = store.replace(
  /const areaW = viewport\.width \* 0\.7/,
  'const areaW = (viewport.width || 20) * 0.7'
).replace(
  /const areaH = viewport\.height \* 0\.6/,
  'const areaH = (viewport.height || 10) * 0.6'
);
fs.writeFileSync('src/store.js', store);

// Patch ArtGrid.jsx to snap rotation to 0 instantly
let artGrid = fs.readFileSync('src/components/ArtGrid.jsx', 'utf-8');
artGrid = artGrid.replace(
  /let rx = groupRef\.current\.rotation\.x[\s\S]*?ease: "expo\.inOut" \n      \}\)/,
  `// 强行归零
      gsap.killTweensOf(groupRef.current.rotation);
      groupRef.current.rotation.set(0, 0, 0);`
);
fs.writeFileSync('src/components/ArtGrid.jsx', artGrid);

// Patch ArtCard.jsx to secure aspect ratio and GSAP values
let artCard = fs.readFileSync('src/components/ArtCard.jsx', 'utf-8');
artCard = artCard.replace(
  /const aspect = texture\.image \? texture\.image\.width \/ texture\.image\.height : 1\.5/,
  `const img = texture.image;
        const imgW = img?.width || img?.naturalWidth || img?.videoWidth || 1;
        const imgH = img?.height || img?.naturalHeight || img?.videoHeight || 1;
        const aspect = img ? (imgW / imgH) : 1.5;`
);
// Ensure target uses valid values
artCard = artCard.replace(
  /const target = scatteredPos \|\| gridPos/,
  `const target = scatteredPos || gridPos;
      if (isNaN(target.x)) target.x = gridPos.x;
      if (isNaN(target.y)) target.y = gridPos.y;`
);
fs.writeFileSync('src/components/ArtCard.jsx', artCard);

console.log('Patched securely.');
