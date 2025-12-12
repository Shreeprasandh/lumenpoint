const fs = require('fs');
const path = require('path');

// Since this is a Node.js script and the youtube service uses ES modules,
// we'll simulate the API call or use mock data for now
async function fetchRecentVideosMock(maxResults = 10) {
  // Mock data - in a real implementation, you'd need to adapt the YouTube API call for Node.js
  return [
    {
      title: 'F1 2026 Engine Rules EXPLAINED: The 50/50 Power Split That Changes EVERYTHING',
      id: '1'
    },
    {
      title: 'AI LUXURY FACTORY: Build a $10,000/Mo YouTube Channel (100% Automated)',
      id: '2'
    },
    {
      title: 'Complex Systems Simplified',
      id: '3'
    }
  ];
}

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const THUMBNAILS_DIR = path.join(ASSETS_DIR, 'thumbnails');
const MINDMAPS_DIR = path.join(ASSETS_DIR, 'mindmaps');

async function ensureDirectoriesExist() {
  [THUMBNAILS_DIR, MINDMAPS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

async function checkMissingAssets() {
  try {
    const videos = await fetchRecentVideosMock(10); // Check last 10 videos
    const missingAssets = [];

    videos.forEach(video => {
      const thumbnailPath = path.join(THUMBNAILS_DIR, `${video.title}.jpeg`);
      const mindmapPath = path.join(MINDMAPS_DIR, `${video.title}.png`);

      if (!fs.existsSync(thumbnailPath)) {
        missingAssets.push({ type: 'thumbnail', title: video.title, path: thumbnailPath });
      }
      if (!fs.existsSync(mindmapPath)) {
        missingAssets.push({ type: 'mindmap', title: video.title, path: mindmapPath });
      }
    });

    return missingAssets;
  } catch (error) {
    console.error('Error checking assets:', error);
    return [];
  }
}

function createPlaceholderImage(type, title, filePath) {
  // Create a simple placeholder image (you can replace this with actual image generation)
  const placeholderText = `${type.toUpperCase()} FOR:\n${title}`;
  const svgContent = `
    <svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#666" text-anchor="middle" dominant-baseline="middle">
        ${placeholderText.split('\n').join('&#10;')}
      </text>
    </svg>
  `;

  // For simplicity, we'll create a text file as placeholder
  // In a real implementation, you'd use a library like sharp or canvas to create actual images
  const placeholderContent = `PLACEHOLDER: ${type.toUpperCase()} for "${title}"\n\nPlease replace this file with the actual ${type} image.`;

  fs.writeFileSync(filePath.replace(/\.(jpeg|png)$/, '.txt'), placeholderContent);
  console.log(`Created placeholder for ${type}: ${title}`);
}

async function generateMissingAssets() {
  await ensureDirectoriesExist();
  const missingAssets = await checkMissingAssets();

  if (missingAssets.length === 0) {
    console.log('All assets are present!');
    return;
  }

  console.log(`Found ${missingAssets.length} missing assets:`);
  missingAssets.forEach(asset => {
    console.log(`- ${asset.type}: ${asset.title}`);
    createPlaceholderImage(asset.type, asset.title, asset.path);
  });

  console.log('\nPlaceholders created. Replace the .txt files with actual images.');
}

async function listAllAssets() {
  await ensureDirectoriesExist();

  console.log('Current assets:');
  console.log('\nThumbnails:');
  if (fs.existsSync(THUMBNAILS_DIR)) {
    fs.readdirSync(THUMBNAILS_DIR).forEach(file => {
      console.log(`- ${file}`);
    });
  }

  console.log('\nMindmaps:');
  if (fs.existsSync(MINDMAPS_DIR)) {
    fs.readdirSync(MINDMAPS_DIR).forEach(file => {
      console.log(`- ${file}`);
    });
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'check':
    checkMissingAssets().then(missing => {
      if (missing.length === 0) {
        console.log('All assets are present!');
      } else {
        console.log(`Missing ${missing.length} assets:`);
        missing.forEach(asset => console.log(`- ${asset.type}: ${asset.title}`));
      }
    });
    break;

  case 'generate':
    generateMissingAssets();
    break;

  case 'list':
    listAllAssets();
    break;

  default:
    console.log('Usage: node scripts/manage-assets.js <command>');
    console.log('Commands:');
    console.log('  check    - Check for missing assets');
    console.log('  generate - Generate placeholders for missing assets');
    console.log('  list     - List all current assets');
    break;
}
