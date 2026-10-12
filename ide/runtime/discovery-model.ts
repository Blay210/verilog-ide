export type SourceRole = 'source' | 'simulation' | 'excluded';
export interface FolderRole { path: string; role: SourceRole }
export interface DeclarationCandidate {
  kind: 'module' | 'package' | 'interface' | 'program';
  name: string;
  offset: number;
  line: number;
  complete: boolean;
  simulationHints: string[];
}
export interface DiscoveredSource {
  path: string;
  kind: 'header' | 'package' | 'module' | 'mixed' | 'unknown';
  role: SourceRole;
  roleOrigin: 'file' | 'folder' | 'convention' | 'default';
  declarations: DeclarationCandidate[];
  requiresPreprocessing: boolean;
}
export interface TopCandidate {
  /** Review identity only; not a confirmed simulator target or persistent run ID. */
  id: string;
  file: string;
  top: string;
  offset: number;
  displayName: string;
  intent: 'simulation' | 'review';
  evidence: string[];
  confirmation: 'required';
}
export interface DiscoveryResult {
  root: string;
  /** Safe discovered directories, including empty and excluded boundaries; never links/reserved trees. */
  directories?: string[];
  manifest: 'present' | 'absent' | 'unavailable';
  sources: DiscoveredSource[];
  tops: TopCandidate[];
  warnings: { file?: string; message: string }[];
}

export interface RoleSelection { folders?: FolderRole[]; files?: FolderRole[] }
export interface SavedFolderRoles { folders: FolderRole[]; directories: string[]; manifestRevision: string }
export interface DiscoveryReview { inventory: DiscoveryResult; folders: FolderRole[]; files: FolderRole[]; manifestRevision: string;
  execution?: { tests: ImportPreview['tests']; includeDirs: string[]; defines: Record<string, string> } }
export interface ImportSelection { ids: string[]; includeDirs?: string[]; defines?: Record<string, string> }
export interface ImportPreview {
  tests: { name: string; top: string; file: string }[];
  packages: string[]; sources: string[]; includeDirs: string[]; defines: Record<string, string>;
  warnings: string[];
}
