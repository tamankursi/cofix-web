import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        products: "products.html",
        checkout: "checkout.html",
        ceritaKami: "cerita-kami.html",
        contact: "contact.html",
        admin: "admin.html",
        adminLogin: "admin-login.html",
      },
    },
  },
});