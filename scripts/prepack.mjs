#!/usr/bin/env node
/**
 * Cross-platform `prepack`: rebuild lib before packing, but keep build stdout OFF the process
 * stdout — `npm pack --json` parses stdout as JSON, so a leaked tsc banner corrupts the pack gate.
 * Build progress is forwarded to stderr instead.
 */
import { spawnSync } from 'node:child_process'

const isWindows = process.platform === 'win32'
// Rebuild lib, then derive the portable Agent-Skill runtime from it; both must be fresh at pack.
const steps = [['run', 'build'], ['run', 'build:portable']]
for (const args of steps) {
  const result = spawnSync(
    isWindows ? (process.env.ComSpec || 'cmd.exe') : 'pnpm',
    isWindows ? ['/d', '/s', '/c', `pnpm ${args.join(' ')}`] : args,
    { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  if (result.stdout?.length) process.stderr.write(result.stdout)
  if (result.stderr?.length) process.stderr.write(result.stderr)
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
