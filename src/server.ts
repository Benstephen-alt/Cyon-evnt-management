import app from "./app";
import { ensureUploadFolders } from "@/shared/services";

const PORT = Number(process.env.PORT) || 5000;

ensureUploadFolders();

const server = app.listen(PORT, "0.0.0.0", () => {
  console.info(`CYON backend is running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Unable to start CYON backend:", error);
});