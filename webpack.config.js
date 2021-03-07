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
      icons: [
        {
          src: path.resolve(
            __dirname,
            "public/icons/icon-512x512.png",
            ),
          size: [72, 96, 128, 144, 152, 192, 384, 512]
        }
      ]
    })
  ]
};

module.exports = config;
