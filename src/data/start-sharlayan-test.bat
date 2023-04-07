@echo off
%1 %2
ver|find "5.">nul&&goto :Admin
mshta vbscript:createobject("shell.application").shellexecute("%~s0","goto :Admin","","runas",1)(window.close)&goto :eof
:Admin
C:\Users\Sayako\Documents\GitHub\tataru-helper-node-v2\src\data\sharlayan-test\sharlayan-test.exe
