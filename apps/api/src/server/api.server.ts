import Fastify from "fastify";
import cors from "@fastify/cors";
import { WebSocketServer } from "ws";

export type DashboardPayload = {
  type: "orderbook_metrics";
  data: unknown;
};

export class ApiServer {
  private app = Fastify({ logger: false });
  private wss = new WebSocketServer({ noServer: true });

  constructor(private port = 4000) {}

  async start() {
    await this.app.register(cors, {
      origin: true,
    });

    // Простий health check
    this.app.get("/health", async () => {
      return {
        status: "ok",
        service: "power-analytics-platform-api",
      };
    });

    // HTTP сервер + WebSocket upgrade
    this.app.server.on("upgrade", (request, socket, head) => {
      if (request.url !== "/ws") {
        socket.destroy();
        return;
      }

      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit("connection", ws, request);
      });
    });

    await this.app.listen({
      port: this.port,
      host: "0.0.0.0",
    });

    console.log(`API server running: http://localhost:${this.port}`);
    console.log(`Dashboard WS: ws://localhost:${this.port}/ws`);
  }

  // Відправляємо дані всім підключеним frontend-клієнтам
  broadcast(payload: DashboardPayload) {
    const message = JSON.stringify(payload);

    for (const client of this.wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  }
}