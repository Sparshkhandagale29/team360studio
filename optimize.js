const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, 'assets');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

async function optimizeImages() {
  const files = getAllFiles(assetsDir);
  let count = 0;

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i) && !file.includes('_thumb')) {
      try {
        const metadata = await sharp(file).metadata();
        const maxDim = 2560; 

        if (metadata.width > maxDim || metadata.height > maxDim || metadata.size > 2 * 1024 * 1024) {
          console.log(`Optimizing ${file} (Original Size: ${Math.round(fs.statSync(file).size / 1024 / 1024)}MB)`);
          
          const buffer = await sharp(file)
            .resize({
              width: maxDim,
              height: maxDim,
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 90, progressive: true })
            .toBuffer();
          
          // Write to a temporary file first, then rename over the original to avoid lock issues
          const tempFile = file + '.tmp';
          fs.writeFileSync(tempFile, buffer);
          fs.renameSync(tempFile, file);
          count++;
        }
      } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
      }
    }
  }
  console.log(`Successfully web-optimized ${count} images! No more lag!`);
}

optimizeImages();
