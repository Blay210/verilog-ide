const cp = require('node:child_process');

// Inject only the termination request for a known, live private fixture PID.
// Windows still runs a real child command; the production cleanup handlers,
// pipes, deadlines and retained process tree are exercised unchanged.
exports.blockTermination = (leader, accepted = false) => {
  if (!Number.isSafeInteger(leader) || leader <= 0 || leader === process.pid) throw Error('Invalid fixture leader');
  const spawn = cp.spawn, kill = process.kill, childKill = cp.ChildProcess.prototype.kill;
  if (process.platform === 'win32') {
    cp.ChildProcess.prototype.kill = function(signal) {
      if (this.pid === leader && signal === 'SIGKILL') {
        if (accepted) return true;
        const error = Error('injected leaf EPERM'); error.code = 'EPERM'; throw error;
      }
      return childKill.call(this, signal);
    };
    cp.spawn = (executable, args, options) => {
      if (executable === 'taskkill.exe' && args[0] === '/PID' && args[1] === String(leader)) {
        return spawn(process.execPath, ['-e', `process.exit(${accepted ? 0 : 7})`], { ...options, windowsHide: true });
      }
      return spawn(executable, args, options);
    };
  } else {
    process.kill = (pid, signal) => {
      if (pid === -leader && signal === 'SIGKILL') {
        if (accepted) return true;
        const error = Error('injected EPERM'); error.code = 'EPERM'; throw error;
      }
      return kill(pid, signal);
    };
  }
  return () => { cp.spawn = spawn; process.kill = kill; cp.ChildProcess.prototype.kill = childKill; };
};

// Call only after restoring the injector, for PIDs emitted by this test's tree.
// A pipe failure may already have exited the leader; descendants still need
// explicit Windows cleanup. No process-name matching or unrelated PID scan.
exports.cleanupTree = async (pids, leader) => {
  if (process.platform !== 'win32') {
    if (leader) { try { process.kill(-leader, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; } }
    return;
  }
  for (const pid of new Set([leader, ...pids].filter(Boolean))) {
    if (!Number.isSafeInteger(pid) || pid <= 0 || pid === process.pid) throw Error('Invalid fixture PID');
    await new Promise((resolve, reject) => {
      const child = cp.spawn('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
      child.once('error', reject); child.once('close', resolve);
    });
  }
};
