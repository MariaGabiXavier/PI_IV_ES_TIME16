
const WebSocket = require('ws');
const net = require('net');

const WS_PORT = process.env.WS_PORT || 8080;
const JAVA_HOST = process.env.JAVA_HOST || '127.0.0.1';
const JAVA_PORT = process.env.JAVA_PORT || 3000;

function writeJavaUTF(socket, str) {
  const buf = Buffer.from(str, 'utf8');
  if (buf.length > 0xFFFF) throw new Error('String too long for writeUTF');
  const header = Buffer.alloc(2);
  header.writeUInt16BE(buf.length, 0);
  socket.write(Buffer.concat([header, buf]));
}


function tryConsumeJavaUTF(bufferState) {
  const buf = bufferState.buffer;
  if (buf.length < 2) return null;
  const len = buf.readUInt16BE(0);
  if (buf.length < 2 + len) return null;
  const payload = buf.slice(2, 2 + len).toString('utf8');
  bufferState.buffer = buf.slice(2 + len);
  return payload;
}

const wss = new WebSocket.Server({ port: WS_PORT }, () => {
  console.log(`Adapter WS listening on ws://localhost:${WS_PORT} -> ${JAVA_HOST}:${JAVA_PORT}`);
});

wss.on('connection', (ws) => {
  console.log('WS client connected');
  const tcp = net.createConnection({ host: JAVA_HOST, port: JAVA_PORT }, () => {
    console.log('Connected to Java server');
  });

  const bufferState = { buffer: Buffer.alloc(0) };

  tcp.on('data', (chunk) => {
    bufferState.buffer = Buffer.concat([bufferState.buffer, chunk]);
    for (;;) {
      const payload = tryConsumeJavaUTF(bufferState);
      if (payload === null) break;
      const sep = payload.indexOf('|');
      let tipo = payload;
      let pl = '';
      if (sep >= 0) {
        tipo = payload.substring(0, sep);
        pl = payload.substring(sep + 1);
      }
      const msg = { from: 'server', type: tipo, payload: pl };
      try { ws.send(JSON.stringify(msg)); } catch (e) { /* ignore */ }
    }
  });

  tcp.on('end', () => {
    console.log('TCP connection closed by server');
    try { ws.send(JSON.stringify({ from: 'server', type: 'DES', payload: '' })); } catch(e){}
    ws.close();
  });

  tcp.on('error', (err) => {
    console.error('TCP error:', err.message);
    try { ws.send(JSON.stringify({ from: 'adapter', type: 'ERROR', payload: err.message })); } catch(e){}
  });

  ws.on('message', (data) => {
    let obj = null;
    try { obj = JSON.parse(data.toString()); } catch (e) { console.warn('Invalid WS message', e); return; }
    if (!obj || !obj.type) return;
    try {
      if (obj.type === 'PED') {
        writeJavaUTF(tcp, `PED|${obj.payload}`);
      } else if (obj.type === 'SAI') {
        writeJavaUTF(tcp, `SAI|`);
      } else if (obj.type === 'RESP') {
        writeJavaUTF(tcp, `RESP|${obj.payload}`);
      }
    } catch (err) {
      console.error('Error writing to TCP:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('WS client disconnected');
    tcp.end();
  });

  ws.on('error', (err) => {
    console.error('WS error', err.message);
    tcp.end();
  });
});

wss.on('error', (err) => {
  console.error('WSS server error', err.message);
});
