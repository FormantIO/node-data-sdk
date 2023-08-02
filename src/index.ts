import express from 'express';
import { chromium, Browser, Page } from 'playwright';
import { App } from './app';
require('dotenv').config();

const parsedPort = parseInt(process.env.PORT);
const port = parsedPort || 8989;

const parsedPingInterval = parseInt(process.env.PING_INTERVAL_MS);
const pingIntervalMs = parsedPingInterval || 1000;

const reconnectTimeout = parseInt(process.env.RECONNECT_TIMEOUT_MS);
const reconnectTimeoutMs = reconnectTimeout || 3000;

async function runServer() {
  const app = new App(express);
  const server = await app.getServer();
  server.listen(port, () => console.log(`http server listening at http://127.0.0.1:${port}`));
}

async function runBrowser() {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();
  await page.goto(`http://localhost:${port}`);

  page.on('console', (message) => {
    for (let i = 0; i < message.args().length; ++i) {
      const line = message.args()[i].toString();
      if (line.includes('PING')) {
        handlePing(parseInt(line.split('PING: ')[1]));
      } else if (line.includes('Device not found')) {
        console.error(line);
        process.exit(1);
      } else {
        console.info(line);
      }
    }
  });

  const loginData = {
    deviceId: process.env.DEVICE_ID,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    pingIntervalMs,
    reconnectTimeoutMs
  };

  await page.evaluate((loginData) => {
    (window as any).connectTeleop(loginData);
  }, loginData);
}

function handlePing(ping: number) {
  console.log(`${ping}ms`);
}

runServer().then(() => {
  runBrowser().catch((e) => {
    console.error(e);
    process.exit(1);
  });
});
