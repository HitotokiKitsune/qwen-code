@echo off
echo "Rebuilding the qwen bundle..."
call npm run bundle
echo "Updating the global qwen command..."
call npm install -g .
echo "Global qwen command updated successfully."
