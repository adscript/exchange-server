import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";

const app = express();
const port = 3000;
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("connected websocket");

  socket.on("trading", (orderInfo) => {
    const { percentage, ...otherInfo} = orderInfo

    const data = fs.readFileSync("dummyTradingHistory.json");
    const jsonData = JSON.parse(data);
    
    const dataCandle = fs.readFileSync("dummyCandleStickHourly.json");
    const jsonDataCandle = JSON.parse(dataCandle);
    
    jsonData.unshift(otherInfo);
  
    socket.emit("updateLastPriceAndPercentage", {
      lastPrice: otherInfo.price,
      percentage,
    });

    socket.emit("update", jsonData);

    jsonDataCandle[jsonDataCandle.length - 1]["Change %"] = percentage;
    const saveUpdatedDaily = JSON.stringify(jsonDataCandle)

    const jsonString = JSON.stringify(jsonData);
    fs.writeFileSync("dummyTradingHistory.json", jsonString, "utf-8", (err) => {
      if (err) throw err;
    });
    fs.writeFileSync("dummyCandleStickHourly.json", saveUpdatedDaily, "utf-8", (err) => {
      if (err) throw err;
    });
  });
});

app.get("/trading-history", async (req, res) => {
  try {
    const data = await fs.readFileSync("dummyTradingHistory.json");
    const jsonData = JSON.parse(data);

    res.json(jsonData);
  } catch (error) {
    console.log
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/", async (req, res) => {
  try {
    const data = await fs.readFileSync("dummyCandleStickHourly.json");
    const jsonData = JSON.parse(data);

    res.json(jsonData);
  } catch (error) {
    console.log
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
