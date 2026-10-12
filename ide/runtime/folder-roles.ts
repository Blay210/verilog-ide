import type { FolderRole, RoleSelection, SourceRole, DiscoveryReview, SavedFolderRoles } from './discovery-model.js';

/** Local root identity only. Core discovery additionally validates links and files. */
export function relativeFolder(root: string | undefined, folder: string, ignoreCase: boolean): string | undefined {
  if (!root || !folder) return undefined;
  const clean = (value: string) => value.replaceAll('\\', '/').replace(/\/+$/, '');
  const base = clean(root), target = clean(folder);
  const compare = (value: string) => ignoreCase ? value.toLowerCase() : value;
  if (compare(target) === compare(base)) return '';
  if (!compare(target).startsWith(compare(base) + '/')) return undefined;
  const relative = target.slice(base.length + 1);
  if (relative.split('/').some(part => !part || part === '.' || part === '..')) return undefined;
  return relative;
}

export function folderRoleAt(entries: FolderRole[], folder: string, ignoreCase: boolean): { role: SourceRole; inherited: boolean } | undefined {
  const compare = (value: string) => ignoreCase ? value.toLowerCase() : value;
  const target = compare(folder);
  const matches = entries.filter(entry => entry.path === '' || target === compare(entry.path) || target.startsWith(compare(entry.path) + '/'));
  const entry = matches.sort((a, b) => b.path.length - a.path.length)[0];
  return entry && { role: entry.role, inherited: compare(entry.path) !== target };
}

/** Change one explicit folder rule; retain child rules and file overrides. */
export function changeFolderRole(selection: RoleSelection, folder: string, role: SourceRole | undefined, ignoreCase: boolean): RoleSelection {
  if (folder.split('/').some(part => part === '.' || part === '..') || folder.startsWith('/') || folder.includes('\\')) throw Error('Invalid relative folder.');
  if (role !== undefined && !['source', 'simulation', 'excluded'].includes(role)) throw Error('Invalid folder role.');
  const compare = (value: string) => ignoreCase ? value.toLowerCase() : value;
  const folders = (selection.folders ?? []).filter(entry => compare(entry.path) !== compare(folder));
  if (role !== undefined) folders.push({ path: folder, role });
  return { folders, files: [...(selection.files ?? [])] };
}

/** Generated and dependency trees cannot be classified as user RTL through Explorer. */
export function isReservedRoleFolder(folder: string, ignoreCase: boolean): boolean {
  return folder.split('/').some(part => ['.rtl', '.git', 'node_modules'].includes(ignoreCase ? part.toLowerCase() : part));
}

export function folderBadge(review: DiscoveryReview | undefined, saved: SavedFolderRoles | undefined, folder: string, ignoreCase: boolean): { role: SourceRole; inherited: boolean; saved: boolean } | undefined {
  const entries = review?.folders ?? saved?.folders;
  const directories = review?.inventory.directories ?? saved?.directories;
  const key = (value: string) => ignoreCase ? value.toLowerCase() : value;
  if (!entries || !directories?.some(path => key(path) === key(folder))) return undefined;
  const result = folderRoleAt(entries, folder, ignoreCase);
  if (!result) return undefined;
  const signature = (items: FolderRole[]) => JSON.stringify(items.map(item => [key(item.path), item.role]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
  const persisted = !review || !!saved && review.manifestRevision === saved.manifestRevision && signature(review.folders) === signature(saved.folders);
  return { ...result, saved: persisted };
}
