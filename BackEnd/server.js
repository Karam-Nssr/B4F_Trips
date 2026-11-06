import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/database.js";
import cron from "node-cron";
import { runScheduleMaintenance } from "./services/schedule.service.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start Express server
  app.listen(PORT, () => {
    console.log(`\n Intercity Bus API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Health check: http://localhost:${PORT}/\n`);
  });

  // 3. Run schedule maintenance on startup
  try {
    const count = await runScheduleMaintenance();
    console.log(`[Cron] Startup maintenance: ${count} trip(s) generated.`);
  } catch (err) {
    console.error("[Cron] Startup maintenance failed:", err.message);
  }

  // 4. Daily maintenance at midnight UTC
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron] Running daily schedule maintenance...");
    try {
      const count = await runScheduleMaintenance();
      console.log(
        `[Cron] Daily maintenance complete: ${count} trip(s) generated.`,
      );
    } catch (err) {
      console.error("[Cron] Daily maintenance error:", err.message);
    }
  });
};

startServer();
