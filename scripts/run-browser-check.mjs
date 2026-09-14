import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const settings = {
  root: process.cwd(),
  url: process.env.PALETTE_TEST_URL ?? "http://127.0.0.1:5173",
  spaceId: process.env.PALETTE_SPACE_ID,
  page: process.env.PALETTE_PAGE,
};
const source = await readFile(
  new URL("./browser-check.mjs", import.meta.url),
  "utf8",
);
// Ego executes in its own Node runtime, so pass settings as data in the script.
const child = spawn("ego-browser", ["nodejs"], {
  stdio: ["pipe", "inherit", "inherit"],
});
child.on("error", (error) => {
  console.error("Ego Browser CLI is required:", error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
child.stdin.end(`const settings = ${JSON.stringify(settings)};\n${source}`);
