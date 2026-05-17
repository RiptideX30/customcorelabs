import { build } from 'vite';

const config = {
  configFile: './vite.config.ts'
};

try {
  console.log('Building...');
  await build(config);
  console.log('✅ Build complete! Static files in dist/');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
