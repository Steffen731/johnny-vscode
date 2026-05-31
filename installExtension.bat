@echo off

echo ================================
echo JOHNNY VSCode Extension Installer
echo ================================
echo.

set VSIX=johnny-vscode-0.0.1.vsix

where code >nul 2>nul

if %errorlevel% neq 0 (
    echo VS Code command line tool not found.
    echo.
    echo Open VS Code once and press:
    echo Ctrl+Shift+P
    echo Shell Command: Install 'code' command in PATH
    echo.
    pause
    exit /b
)

if not exist "%VSIX%" (
    echo VSIX file not found:
    echo %VSIX%
    echo.
    pause
    exit /b
)

echo Installing extension...
echo.

code --install-extension "%VSIX%" --force

echo.
echo Installation finished.
echo Restart VS Code if necessary.
echo.

pause