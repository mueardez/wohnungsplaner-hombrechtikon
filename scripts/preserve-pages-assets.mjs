import { copyFile } from "node:fs/promises";

const assets = "dist-github/assets";
const previousScripts = [
  "index-C0YPGv_Z.js",
  "index-sXrcYfmu.js",
  "index-D8E7oc4r.js",
  "index-WQyKkEwU.js",
];

await Promise.all([
  ...previousScripts.map((name) =>
    copyFile(`${assets}/raumplaner.js`, `${assets}/${name}`),
  ),
  copyFile(`${assets}/index.css`, `${assets}/index-C7dLYv9L.css`),
]);
