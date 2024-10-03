import { spawn } from 'node:child_process';

/**
 * Executes a shell command asynchronously.
 * @param {TemplateStringsArray} strings - The template string array.
 * @param {...any} values - The interpolated values.
 * @returns {Promise<null>} A promise that resolves when the command completes successfully, or rejects with an error.
 * @throws {Error} If the command fails or encounters an error during execution.
 */
export function $(strings, ...values) {
  const command = strings.reduce((result, str, i) => 
    result + str + (values[i] || ''), '').trim();

  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(/\s+/);
    const process = spawn(cmd, args, { shell: true, stdio: 'inherit' });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}