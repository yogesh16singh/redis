const net = require("net");
const PORT = 6379;
const STORAGE = {};
const CONFIG= new Map();

const arguments= process.argv.slice(2);
const [fileDir , fileName] = [arguments[1] ?? null , arguments[3] ?? null]
console.log("arguments",arguments)

if(fileDir && fileName)
{
  CONFIG.set("fileDir",fileDir);
  CONFIG.set("dbfileName",fileName);
}

function formatConfigMessage(key = '', value = '') {
	return `*2\r\n$${key.length}\r\n${key}\r\n$${value.length}\r\n${value}\r\n`;
}

function formatMessage(text = null) {
	if (text) return `+${text}\r\n`;
	return `$-1\r\n`;
}

const server = net.createServer((connection) => {
  // Handle connection
  console.log('client connected');

  connection.on("data", (data) => {
    console.log("Received: " + data.toString().split("\r\n"));
    const msg = data.toString().split("\r\n");

    const command = msg[2];
    const arg = msg[4];

    switch (command) {
      case 'echo':
          connection.write(`$${arg.length}\r\n${arg}\r\n`)
          break
      case 'ping':
          connection.write('+PONG\r\n')
          break
      case 'set':
          STORAGE[msg[4]] = msg[6];
          if(msg[8]=='EX')
          {
            setTimeout(() => {
              delete STORAGE[msg[4]];
            },msg[10])
          }
          connection.write('+OK\r\n')
          break
      case 'get':
         if (STORAGE[msg[4]])
          connection.write(
            `$${STORAGE[msg[4]].length}\r\n${STORAGE[msg[4]]}\r\n`,
          );
        else connection.write("$-1\r\n");
      case 'config':
       connection.write(formatConfigMessage(msg[6],CONFIG.get(msg[6])))
          break
  }
  });

  connection.on("end", () => {
    console.log("Client disconnected");
  });
  connection.on("timeout", () => {
    console.log("Connection timed out");
  });
  connection.on("close", () => {
    console.log("Connection closed");
  });
  connection.on("error", (err) => {
    console.log("Connection error: " + err.message);
  })
  connection.write("+PONG\r\n");
 
});

server.listen(PORT, "127.0.0.1",() => {
  console.log('Server listening on port ' + server.address().port);
});
