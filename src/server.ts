import app from "./app";
import { ensureUploadFolders } from "@/shared/services";

const PORT = Number(process.env.PORT) || 5000;

ensureUploadFolders();

app.listen(PORT, "0.0.0.0",  () => {
  console.log("==================================================");
  console.log("🚀 CYON Event Management System API");
  console.log(
  `🌐 Server running on port ${PORT}`
);
  console.log(`📅 Started at ${new Date().toLocaleString()}`);
  console.log("==================================================");
});