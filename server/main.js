const net = require("net");

const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");
    console.log("Received commands:", commands);
    for (const command of commands) {
      if (command == "ping") {
        connection.write("+PONG\r\n");
      }
      if (command == "echo") {
        const str=commands[4];
        const l= str.length;
        connection.write("$"+l+"\r\n"+str+"\r\n");
        
      }
    }
  });
  connection.on("end", () => {
    console.log("Client disconnected");
  });
  connection.on("error", (err) => {
    console.error(err);
  });
  connection.on("timeout", () => {
    console.log("Connection timed out");
  });
  connection.on("close", () => {
    console.log("Connection closed");
  });
  connection.write("+PONG\r\n");
 
});

server.listen(6379, "127.0.0.1",() => {
  console.log('Server listening on port ' + server.address().port);
});
