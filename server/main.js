const net = require("net");
const PORT = 6379;
const STORAGE = {};

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
  connection.write("+PONG\r\n");
 
});

server.listen(PORT, "127.0.0.1",() => {
  console.log('Server listening on port ' + server.address().port);
});
