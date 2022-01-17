const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("ALL OK");
});

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`SERVER LISTENING 🔊`);
});
