; Pulse beta. Compile only through scripts/build-installer.mjs.
#ifndef PayloadDir
  #error PayloadDir is required
#endif
#ifndef OutputDir
  #error OutputDir is required
#endif
#ifndef UserAppId
  #error UserAppId is required
#endif
#ifndef ProductVersion
  #error ProductVersion is required
#endif
#ifndef WindowsVersion
  #error WindowsVersion is required
#endif
#ifndef SetupBaseName
  #error SetupBaseName is required
#endif

[Setup]
AppId={#UserAppId}
AppName=Pulse
AppVersion={#ProductVersion}
AppVerName=Pulse (beta)
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
UninstallDisplayName=Pulse (beta)
AppMutex=rtl-ide
CloseApplications=no
RestartApplications=no
LicenseFile={#PayloadDir}\resources\app\LICENSE.txt
OutputDir={#OutputDir}
OutputBaseFilename={#SetupBaseName}
VersionInfoVersion={#WindowsVersion}
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
