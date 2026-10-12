$ErrorActionPreference = 'Stop'
$ideRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$baseline = Get-Content -LiteralPath (Join-Path $ideRoot 'config/upstream.json') -Raw | ConvertFrom-Json
$cacheRoot = Join-Path $ideRoot '.dev'
$targetPath = Join-Path $ideRoot 'upstream'
if (Test-Path -LiteralPath $targetPath) { throw 'upstream already exists; verify it instead of replacing local changes.' }
New-Item -ItemType Directory -Force -Path $cacheRoot | Out-Null
$archive = Join-Path $cacheRoot ('code-oss-' + $baseline.tag + '.zip')
if (-not (Test-Path -LiteralPath $archive)) { Invoke-WebRequest -Uri $baseline.archiveUrl -OutFile $archive }
if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $baseline.archiveSha256) { throw 'Archive SHA256 mismatch; source was not extracted.' }
$stageRoot = Join-Path $cacheRoot ('extract-' + [guid]::NewGuid().ToString('N'))
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($archive)
try {
 foreach ($entry in $zip.Entries) {
  $resolved = [IO.Path]::GetFullPath((Join-Path $stageRoot $entry.FullName))
  if (-not $resolved.StartsWith($stageRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Archive entry escaped staging directory.' }
 }
} finally { $zip.Dispose() }
Expand-Archive -LiteralPath $archive -DestinationPath $stageRoot
$sourcePath = [IO.Path]::GetFullPath((Join-Path $stageRoot ('vscode-' + $baseline.revision)))
if (-not $sourcePath.StartsWith($ideRoot + '\', [StringComparison]::OrdinalIgnoreCase) -or -not $targetPath.StartsWith($ideRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Source escaped IDE directory.' }
Move-Item -LiteralPath $sourcePath -Destination $targetPath
$env:GIT_CEILING_DIRECTORIES = $ideRoot
foreach ($key in @('GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE')) { [Environment]::SetEnvironmentVariable($key, $null, 'Process') }
# Upstream tooling expects its own HEAD and changes local git config during install.
# Mixed reset updates only this freshly initialized index, not working files.
git init $targetPath
if ($LASTEXITCODE -ne 0) { throw 'Could not initialize local upstream metadata' }
git -C $targetPath fetch --depth=1 $baseline.repository $baseline.revision
if ($LASTEXITCODE -ne 0) { throw 'Could not fetch pinned upstream metadata; source is not ready' }
git -C $targetPath reset --mixed --no-refresh FETCH_HEAD
if ($LASTEXITCODE -ne 0) { throw 'Could not set pinned upstream metadata' }
Write-Output ('Prepared local Code-OSS ' + $baseline.tag)
