import express from 'express';
import { chromium, Browser, Page } from 'playwright';
import { App } from './app';

const port = process.env.PORT || 8989;

async function runServer() {
  const app = new App(express);
  const server = await app.getServer();
  server.listen(port, () => console.log(`http listening at http://127.0.0.1:${port}`));
}

async function runBrowser() {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();
  await page.goto(`http://localhost:${port}`);

  page.on('console', (message) => {
    for (let i = 0; i < message.args().length; ++i) {
      const line = message.args()[i].toString();
      if (line.includes('PING')) {
        handlePing(line.split('PING: ')[1]);
      } else {
        // console.log(`Console: ${line}`);
      }
    }
  });

  const loginData = {
    deviceId: 'ericpi',
    username: 'USERNAME',
    password: 'PASSWORD'
  };

  await page.evaluate((loginData) => {
    (window as any).connectTeleop(loginData);
  }, loginData);
}

runServer().then(() => {
  runBrowser().catch((e) => {
    console.error(e);
    process.exit(1);
  });
});

function handlePing(ping: string) {
  console.log(`${parseInt(ping)}ms`);
}
