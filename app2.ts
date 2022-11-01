import { sendResponse } from "@lib1";
import express from "express";

const app2 = express();

app2.get("*", (req, res) => {
  sendResponse(res, "app2");
});

app2.listen(3000, () => {
  console.info("app2 is listening on port 3000");
});
