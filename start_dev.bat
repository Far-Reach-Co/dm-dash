@echo off
setlocal

echo.
echo *************** RUNNING AUTO MIGRATE ***************
echo.
npm run migrate:up

echo.
echo *************** RUNNING TYPESCRIPT ***************
echo.
npx tsc --watch

echo.
echo *************** STARTING JS BUNDLER ***************
echo.
start "" "commands\start_bundler.bat"

echo.
echo *************** STARTING SERVER ***************
echo.
npm run dev

endlocal