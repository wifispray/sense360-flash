#!/usr/bin/env node

// GitHub Pages build script - frontend only
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building Sense360 Flash for GitHub Pages (static only)...');

try {
  // Build the frontend from client directory
  console.log('Building frontend...');
  process.chdir('client');
  execSync('vite build', { stdio: 'inherit' });
  process.chdir('..');
  
  // Copy built files to docs for GitHub Pages
  console.log('Preparing files for GitHub Pages...');
  
  // Clean and create docs directory
  if (fs.existsSync('docs')) {
    execSync('rm -rf docs/*', { stdio: 'inherit' });
  } else {
    fs.mkdirSync('docs');
  }
  
  // Copy dist/public contents to docs
  if (fs.existsSync('dist/public')) {
    execSync('cp -r dist/public/* docs/', { stdio: 'inherit' });
    console.log('Files copied to docs/ directory');
  } else {
    console.error('Build output not found at dist/public');
    process.exit(1);
  }
  
  console.log('✅ GitHub Pages build complete!');
  console.log('📁 Static files are in /docs directory');
  console.log('🚀 Ready for GitHub Pages deployment');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}