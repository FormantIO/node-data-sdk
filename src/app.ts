import express, { Express, Response as ExResponse, Request as ExRequest } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { FileLoader } from './utils/FileLoader';

const INDEX_PATH = './src/public/index.html';
const USER_SCRIPT = './src/public/user.js';

export class App {
  private readonly expressApp: Express;
  private readonly httpServer: HttpServer;
  private handlersInitialized = false;

  constructor(private ExpressServer: typeof express) {
    this.expressApp = this.createApp();

    this.httpServer = createServer(this.expressApp);
  }

  private createApp(): Express {
    return this.ExpressServer();
  }

  async getServer(): Promise<HttpServer> {
    if (!this.handlersInitialized) {
      await this.loadApp();
      this.handlersInitialized = true;
    }

    return this.httpServer;
  }

  private async loadApp(): Promise<void> {
    let indexHTML = await FileLoader.readFile(INDEX_PATH);
    const userScript = await FileLoader.readFile(USER_SCRIPT);

    indexHTML = indexHTML.replace('{{USER_SCRIPT}}', userScript);

    this.expressApp.get('/', (req: ExRequest, resp: ExResponse) => {
      resp.send(indexHTML);
    });
  }
}
