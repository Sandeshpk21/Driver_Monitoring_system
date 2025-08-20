@echo off
echo Cleaning and reinstalling dependencies...
echo.

echo Step 1: Removing node_modules and package-lock.json
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Step 2: Clearing npm cache
call npm cache clean --force

echo.
echo Step 3: Installing dependencies
call npm install

echo.
echo Step 4: Starting development server
echo.
echo If you see any errors above, please fix them before continuing.
echo Press any key to start the development server...
pause > nul
call npm run dev