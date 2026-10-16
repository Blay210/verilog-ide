// Emit the owned workbench/node overlays using the pinned upstream compiler,
// and typecheck the entire upstream source. Run with cwd ide/upstream.
import { createCompile } from '../upstream/build/lib/compilation.ts';
import { gulp } from '../upstream/build/lib/gulp/facade.ts';
import { streamToPromise } from '../upstream/build/lib/util.ts';
import { spawnTsgo } from '../upstream/build/lib/tsgo.ts';
const compile = createCompile('src', { build: false, emitError: true, transpileOnly: { esbuild: true }, preserveEnglish: false });
await Promise.all([
  streamToPromise(gulp.src([
    'src/vs/workbench/browser/media/code-icon.svg',
    'src/vs/workbench/browser/parts/editor/media/letterpress-*.svg'
  ], { base: 'src' }).pipe(gulp.dest('out'))),
  streamToPromise(gulp.src([
    'src/vs/workbench/contrib/rtl/browser/*.ts',
    'src/vs/platform/rtl/common/**/*.ts',
    'src/vs/platform/rtl/node/rtlSimulationChannel.ts',
    'src/vs/code/electron-utility/sharedProcess/sharedProcessMain.ts'
  ], { base: 'src' }).pipe(compile()).pipe(gulp.dest('out'))),
  spawnTsgo(compile.projectPath, { taskName: 'rtl-owned-types', noEmit: true })
]);
console.log('PASS owned overlays emission and whole upstream typecheck.');
