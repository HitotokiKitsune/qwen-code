@echo off
echo "Rebuilding the qwen bundle..."
call npm run bundle
echo "Uninstalling existing global qwen command..."
call npm uninstall -g @qwen-code/qwen-code
echo "Updating the global qwen command..."
call npm install -g .
echo "Global qwen command updated successfully."
