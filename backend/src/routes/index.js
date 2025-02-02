import authRoutes from "./auth.routes.js";
import questionRoutes from "./questions.routes.js";
import testRoutes from "./tests.routes.js";
import adminRoutes from "./admin.routes.js";
import chatRoutes from "./chat.routes.js";
import coachRoutes from "./coach.routes.js";
import { errors } from "../middleware/index.js";

export const setupRoutes = (app) => {
  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/tests", testRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/coach", coachRoutes);
  app.use("/chat", chatRoutes);

  // Health check route
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
  });

  // Handle 404
  app.use(errors.notFound);

  // Error handler
  app.use(errors.handler);
};

export default {
  auth: authRoutes,
  questions: questionRoutes,
  tests: testRoutes,
  admin: adminRoutes,
  chatRoutes: chatRoutes,
};
