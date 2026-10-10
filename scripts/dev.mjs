import http from 'node:http';
import { Readable } from 'node:stream';
import worker from '../worker/index.js';

const port = Number(process.env.PORT || 8787);
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const init = { method: incoming.method, headers: incoming.headers };
    if (!['GET', 'HEAD'].includes(incoming.method)) {
      init.body = Readable.toWeb(incoming);
      init.duplex = 'half';
    }
    const request = new Request(`http://127.0.0.1:${port}${incoming.url}`, init);
    const response = await worker.fetch(request, {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL,
    });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(outgoing);
    else outgoing.end();
  } catch {
    outgoing.writeHead(500, { 'Content-Type': 'application/json' });
    outgoing.end(JSON.stringify({ error: 'Local preview could not process this request.' }));
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
