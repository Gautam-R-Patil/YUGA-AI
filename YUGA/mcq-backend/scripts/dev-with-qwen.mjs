import { spawn } from 'child_process';

const pythonBin = process.env.PYTHON_BIN || 'python';
const qwenPort = process.env.QWEN_TTS_PORT || '8001';

const backend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const qwen = spawn(
  pythonBin,
  ['-m', 'uvicorn', 'services.qwen_tts_service.app:app', '--host', '127.0.0.1', '--port', qwenPort],
  {
    stdio: 'inherit',
    shell: true,
  }
);

const shutdown = (signal) => {
  console.log(`\n[dev-with-qwen] Received ${signal}, shutting down...`);
  if (!backend.killed) backend.kill();
  if (!qwen.killed) qwen.kill();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

backend.on('exit', (code) => {
  console.log(`[dev-with-qwen] Backend exited with code ${code}`);
  if (!qwen.killed) qwen.kill();
  process.exit(code ?? 0);
});

qwen.on('exit', (code) => {
  console.log(`[dev-with-qwen] Qwen service exited with code ${code}`);
  if (!backend.killed) backend.kill();
  process.exit(code ?? 0);
});
