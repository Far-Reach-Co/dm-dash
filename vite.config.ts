export default {
    envDir: "root",
    envPrefix: "VITE_",
    server: {
      proxy: {
        "/api": "http://localhost:8000"
      }
    } 
  }