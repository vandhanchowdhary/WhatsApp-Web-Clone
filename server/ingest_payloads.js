import fs from "fs";
import path from "path";
import axios from "axios";

const SERVER_URL = "http://localhost:4000";

async function postFile(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  try {
    const res = await axios.post(`${SERVER_URL}/webhook`, content);
    console.log(`✅ Posted ${path.basename(filePath)}`, res.data);
  } catch (err) {
    console.error(
      `❌ Error posting ${path.basename(filePath)}`,
      err.response?.data || err.message
    );
  }
}

async function main() {
  const dir = path.resolve("./payloads"); // place your uploaded JSONs here
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    await postFile(path.join(dir, f));
  }
}

main();
