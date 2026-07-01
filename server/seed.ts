import { dbReadyPromise } from "./index.js";

dbReadyPromise
  .then(() => {
    console.log("Inkline Journal seed content is ready.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed Inkline Journal content:", error);
    process.exit(1);
  });
