const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");

const config = {
  entry: {
    index: "./public/index.js",
    db: "./public/db.js"
  },
  output: {
    path: __dirname + "/public/dist",
    filename: "[name].bundle.js"
  },
  mode: "production",
  plugins: [
    new WebpackPwaManifest({
      filename: "manifest.json",
      inject: false,
      fingerprints: false,
      name: "Budget App",
      short_name: "Budget App",
      theme_color: "#fff",
      background_color: "#ffff",
      start_url: "/",
      display: "standalone",
    })
  ]
};

module.exports = config;
