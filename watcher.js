import { spawn } from "node:child_process";
import { watch } from "node:fs/promises";

const [node, , file] = process.argv;

const spawnNode = () => {
    const childProcess = spawn(node, [file]);

    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);

    childProcess.on('close', (code) => {
        if (code !== null) {
            process.exit(code);
        }
    });

    return childProcess;
};

let childProcessNode = spawnNode();
const watcher = watch('./', { recursive: true });

for await (const event of watcher) {
    if (event.filename.endsWith('.js')) {
        childProcessNode.kill('SIGKILL');
        childProcessNode = spawnNode();
    }
}
