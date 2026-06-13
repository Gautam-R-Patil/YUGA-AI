import fs from "fs";

try {
    const data = fs.readFileSync("out.log", "utf16le");
    const lines = data.split("\n");
    console.log(lines.slice(-50).join("\n"));
} catch (err) {
    console.error(err);
}
