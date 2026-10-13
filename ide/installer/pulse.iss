; Pulse study beta. Compile only through scripts/build-installer.mjs.
#ifndef PayloadDir
  #error PayloadDir is required
#endif
#ifndef OutputDir
  #error OutputDir is required
#endif
#ifndef UserAppId
  #error UserAppId is required
#endif

[Setup]
AppId={#UserAppId}
AppName=Pulse
AppVersion=0.1.0-beta.20261014
AppVerName=Pulse Study Beta (2026-10-14)
AppPublisher=Pulse Project
DefaultDirName={localappdata}\Programs\Pulse
DefaultGroupName=Pulse
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64os
ArchitecturesInstallIn64BitMode=x64os
MinVersion=10.0
WizardStyle=modern
SetupIconFile={#PayloadDir}\resources\app\resources\win32\code.ico
UninstallDisplayIcon={app}\Pulse.exe
UninstallDisplayName=Pulse (Study Beta)
AppMutex=rtl-ide
CloseApplications=no
RestartApplications=no
LicenseFile={#PayloadDir}\resources\app\LICENSE.txt
OutputDir={#OutputDir}
OutputBaseFilename=Pulse-Setup-windows-x64-beta-20261014
VersionInfoVersion=0.1.2026.1014
Compression=lzma2/normal
SolidCompression=yes
DiskSpanning=no
Uninstallable=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{#PayloadDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Pulse"; Filename: "{app}\Pulse.exe"; WorkingDir: "{app}"; AppUserModelID: "RTLIDE.Development"
Name: "{autodesktop}\Pulse"; Filename: "{app}\Pulse.exe"; WorkingDir: "{app}"; Tasks: desktopicon; AppUserModelID: "RTLIDE.Development"

[Run]
Filename: "{app}\Pulse.exe"; Description: "{cm:LaunchProgram,Pulse}"; Flags: nowait postinstall skipifsilent

; No PATH/file-association changes, profile cleanup or wildcard uninstall deletion.
; Inno's uninstall log removes only files/shortcuts installed by this setup.
