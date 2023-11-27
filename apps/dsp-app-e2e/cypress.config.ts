import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    env: {
        apiUrl: "http://0.0.0.0:3333",
    }
  },
});
