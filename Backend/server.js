import http from "http";
import app from "./app.js";
import socketSetup from "./socket/socket.js";

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
socketSetup(server);

server.listen(PORT, () => {
  console.log(`Dhanno server running on port ${PORT}`);
});
