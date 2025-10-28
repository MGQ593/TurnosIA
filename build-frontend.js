// build-frontend.js - Script para compilar frontend TypeScript
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const { glob } = require('glob');

const isWatch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

async function build() {
  try {
    // Buscar automáticamente todos los archivos .ts en src/frontend/
    const entryPoints = await glob('src/frontend/*.ts', {
      ignore: ['src/frontend/types.ts'] // Excluir archivo de solo tipos
    });

    if (entryPoints.length === 0) {
      console.log('⚠️  No se encontraron archivos TypeScript en src/frontend/');
      return;
    }

    console.log(`📦 Encontrados ${entryPoints.length} archivo(s) TypeScript:`);
    entryPoints.forEach(file => console.log(`   - ${file}`));

    const buildOptions = {
      entryPoints,
      bundle: false, // No bundlear, mantener código simple
      outdir: 'public/js',
      platform: 'browser',
      target: 'es2020',
      format: 'iife', // Immediate Invoked Function Expression
      sourcemap: !isProd, // Source maps solo en desarrollo
      minify: isProd,
      logLevel: 'info',
    };

    if (isWatch) {
      console.log('👀 Watching frontend TypeScript files...\n');
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('✅ Watch mode activated. Waiting for changes...\n');
    } else {
      console.log(isProd ? '🏗️  Building for PRODUCTION...' : '🔨 Building frontend TypeScript...');
      await esbuild.build(buildOptions);
      console.log('✅ Frontend build completed!\n');
      
      // Mostrar tamaño de archivos generados
      const jsFiles = await glob('public/js/*.js');
      console.log('📊 Archivos generados:');
      jsFiles.forEach(file => {
        const stats = fs.statSync(file);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`   ${path.basename(file)}: ${sizeKB} KB`);
      });
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
