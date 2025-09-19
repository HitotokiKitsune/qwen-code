@echo off
setlocal

set "QWEN3_DIR=C:\AI\qwen3"
set "CURRENT_DIR=%CD%"

echo "Creating a temporary git repository in %QWEN3_DIR%..."
cd /d "%QWEN3_DIR%"
git init > nul
git add .
git commit -m "Snapshot of changes from qwen3" > nul 2>&1

echo "Adding %QWEN3_DIR% as a git remote..."
cd /d "%CURRENT_DIR%"
git remote remove qwen3 >nul 2>&1
git remote add qwen3 "%QWEN3_DIR%"

echo "Fetching changes from the remote..."
git fetch qwen3

echo "Merging changes..."
git merge qwen3/master --no-ff --allow-unrelated-histories -m "Merge changes from qwen3"

echo "Cleaning up..."
git remote remove qwen3 >nul 2>&1
rmdir /s /q "%QWEN3_DIR%\.git"

echo "Import complete."

endlocal