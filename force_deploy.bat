@echo off
echo Cleaning cache...
rmdir /s /q dist
rmdir /s /q node_modules\.vite

echo Building...
call npm run build

echo Deploying...
call npm run deploy
echo Done.
