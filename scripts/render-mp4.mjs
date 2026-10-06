import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const width = 1920, height = 1080, fps = 30;
await mkdir('assets', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto('file://' + process.cwd() + '/index.html');
await page.evaluate(() => { window.__renderMode = true; });

const ffmpeg = spawn('ffmpeg', ['-y','-f','image2pipe','-vcodec','png','-r',String(fps),'-i','-','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart','-s','1920x1080','assets/cell-signal-90s-1080p.mp4'], { stdio: ['pipe','inherit','inherit'] });
for (let frame = 0; frame <= 90 * fps; frame++) {
  const seconds = frame / fps;
  await page.evaluate((seconds) => {
    const range = document.querySelector('#timeline');
    range.value = seconds;
    range.dispatchEvent(new Event('input', { bubbles: true }));
  }, seconds);
  const png = await page.screenshot({ type: 'png' });
  if (!ffmpeg.stdin.write(png)) await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
}
ffmpeg.stdin.end();
await new Promise((resolve, reject) => { ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))); });
await browser.close();
console.log('Wrote assets/cell-signal-90s-1080p.mp4');
