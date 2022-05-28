const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
app.use(cors());
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  transports: ["polling", "websocket"],
  cors: {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization, X-Requested-With, Accept",
    credentials: true,
  },
});
const Mpesa = require("mpesa-api").Mpesa;

// create a new instance of the api

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/mpesa", async (req, res) => {
  const credentials = {
    clientKey: "mqqp3uSNua7xivju5t32jdA7EHyWoQZr",
    clientSecret: "vxG40BsJ9e68hiOm",
    initiatorPassword: "Safaricom979!",
    securityCredential:
      "OVE/WOc3eePOtB5dGCAkIzBm7tG+UJK2BXSpYUv5u0TX9RTuxvDHvemj+8iZdvC/+FWbORc2xTNR2bBG5AvapIAQ2pJfhmek1SoU5+J2g3gDJW8axiGHTl1kKoJEx4N5R8xT/lqUy7PXHJfa4MZOGrcql/Y1Y0TH/qiPx5p7pjEC8olIukX6271XqdcChf8hIScZgLKQB6OVCS2L2/OqsiNOSCI8rV5IFM8oSq1wEAzsGeO1wFX2Xv4Mz6wMWg3TELNseVIj+Gxnm4p/yVtxUfaW8+VUChNO7jqPTBKRrWbXKFOehoTPatiR19Mn+6AR8/INzgTREI92aeYlLbB0Cg==",
    certificatePath: null,
  };
  const environment = "sandbox";

  const mpesa = new Mpesa(credentials, environment);
  try {
    const response = await mpesa.lipaNaMpesaOnline({
      BusinessShortCode: 174379,
      Amount: 1 /* 1000 is an example amount */,
      PartyA: 254729842998,
      PhoneNumber: 254729842998,
      PartyB: 174379,
      CallBackURL: "https://node-mpesa.herokuapp.com/callback",
      AccountReference: "Hotel booking app",
      passKey:
        "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
      TransactionType: "CustomerPayBillOnline",
    });
    io.emit("querying", response);
  } catch (error) {
    console.log(error);
  }
});

app.post("/callback", async (req, res) => {
  const b = req.body.Body.stkCallback["ResultDesc"];
  if (b) {
    io.emit("queried", req.body.Body.stkCallback["ResultDesc"]);
  }
  res.json(b);
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("chat message", (msg) => {
    console.log(msg);
    io.emit("chat message", msg);
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
