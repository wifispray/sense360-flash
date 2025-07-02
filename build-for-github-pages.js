#!/usr/bin/env node

// Simple build script for GitHub Pages deployment
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building Sense360 Flash for GitHub Pages...');

try {
  // Build the frontend
  console.log('Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Copy built files to root for GitHub Pages
  console.log('Preparing files for GitHub Pages...');
  
  // Create docs directory (GitHub Pages can serve from /docs)
  if (!fs.existsSync('docs')) {
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
  
  console.log('Build complete! GitHub Pages can now serve from /docs directory');
  console.log('Go to repository Settings > Pages and set source to "Deploy from a branch" with "main" branch and "/docs" folder');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}