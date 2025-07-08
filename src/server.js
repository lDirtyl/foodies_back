// src/server.js

import { swaggerDocs } from "./middlewares/swaggerDocs.js";

/* Інший код файлу */

app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/api-docs", swaggerDocs());

/* Інший код файлу */
