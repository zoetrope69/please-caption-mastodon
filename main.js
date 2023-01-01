// populate process.env environment variables from .env file
require("dotenv").config();

const {
  compareFollowersToFollowing,
  listenAndProcessTootTimeline,
} = require("./js/bot");

listenAndProcessTootTimeline();

const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/", (_request, response) => {
  response.sendStatus(200);
});

app.get("/" + process.env.BOT_ENDPOINT, (_request, response) => {
  compareFollowersToFollowing()
    .then(() => {
      return response.sendStatus(200);
    })
    .catch((error) => {
      console.error(error);
      return response.status(500).send(error);
    });
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
