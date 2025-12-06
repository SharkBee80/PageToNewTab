echo off
chcp 65001
:: chcp 936 GBK  chcp 65001 UTF-8
title Chrome & Edge 开发扩展去红色警告 - 终极合一版
mode con cols=80 lines=25
color 0a
setlocal enabledelayedexpansion

::========== 自动获取管理员权限 ==========
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo   正在请求管理员权限...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit
)
::========== 获取管理员权限 ==========
@REM %1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit

cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗ 
echo ║           Chrome / Edge 自己开发扩展去红色警告工具        ║ 
echo ║                   （支持多扩展，自动编号）                ║ 
echo ╚═══════════════════════════════════════════════════════════╝ 
echo.
echo  正在检测浏览器安装情况...
set chrome=0
set edge=0
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Google\Chrome" >nul 2>&1 && set chrome=1
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Edge" >nul 2>&1 && set edge=1

if %chrome%==1 echo   √ 检测到 Chrome
if %edge%==1   echo   √ 检测到 Microsoft Edge
echo.

:menu
echo  请选择要操作的浏览器：
echo.
echo  [1] 只给 Chrome 加白名单
echo  [2] 只给 Edge 加白名单
echo  [3] Chrome 和 Edge 都加（推荐）
echo  [0] 退出
echo.
set /p choice=请输入数字后回车: 
if "%choice%"=="0" exit
if "%choice%"=="1" set target=chrome& goto input
if "%choice%"=="2" set target=edge& goto input
if "%choice%"=="3" set target=both& goto input
echo  输入错误，请重新选！ & timeout /t 2 >nul & goto menu

:input
cls
echo.
echo  请打开浏览器 → 地址栏输入以下地址 → 开启右上角「开发者模式」
echo  Chrome 用：chrome://extensions/
echo  Edge   用：edge://extensions/
echo.
echo  找到你的扩展，把那串 32 位 ID 复制下来（一串小写字母）
echo  示例：eljjpcjekbenlpmmlkoeigmcimnaaimn
echo.
set /p id=粘贴你的扩展 ID 到这里后按回车: 
if "%id%"=="" echo ID 不能为空！ & timeout /t 2 >nul & goto input
if "%id:~32,1%"=="" goto ok
echo 错误：ID 必须正好 32 位！你输入的长度不对，请重新复制。
timeout /t 3 >nul
goto input

:ok
echo.
echo 正在写入注册表，请稍等...

::========== 处理 Chrome ==========
if %chrome%==1 if "%target%"=="chrome" (
    call :add_to_registry "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome" "%id%"
)
if %chrome%==1 if "%target%"=="both" (
    call :add_to_registry "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome" "%id%"
)

::========== 处理 Edge ==========
if %edge%==1 if "%target%"=="edge" (
    call :add_to_registry "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge" "%id%"
)
if %edge%==1 if "%target%"=="both" (
    call :add_to_registry "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge" "%id%"
)

echo.
echo  ███████ 全部完成！ID [%id%] 已成功加入白名单！
echo.
echo  请立刻重启 Chrome / Edge，红色警告将彻底永久消失！
echo.
echo  （以后再开发新插件，直接再次运行这个 bat 即可）
echo.
pause
exit


::========== 子程序：自动找下一个空位写入 ==========
:add_to_registry
set "key=%~1"
set "newid=%~2"
set count=0

:loop
set /a count+=1
reg query "%key%\ExtensionInstallAllowlist" /v %count% >nul 2>&1
if %errorlevel%==0 goto loop

reg add "%key%\ExtensionInstallAllowlist" /v %count% /t REG_SZ /d %newid% /f >nul
if "%key:Google=%"=="%key%" (
    echo     → 已加入 Edge 白名单（位置 %count%）
) else (
    echo     → 已加入 Chrome 白名单（位置 %count%）
)
goto :eof