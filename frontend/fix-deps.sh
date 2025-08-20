#!/bin/bash

echo "Cleaning and reinstalling dependencies..."
echo ""

echo "Step 1: Removing node_modules and package-lock.json"
rm -rf node_modules package-lock.json

echo ""
echo "Step 2: Clearing npm cache"
npm cache clean --force

echo ""
echo "Step 3: Installing dependencies"
npm install

echo ""
echo "Step 4: Starting development server"
echo ""
echo "If you see any errors above, please fix them before continuing."
echo "Press Enter to start the development server..."
read
npm run dev