import app from "./app";
import { config } from "./config/env";

const startServer = async () => {
  app.listen(config.port, () => {
    console.log(`Server is running at port ${config.port}`);
  });
};

startServer();