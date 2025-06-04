import fs from "node:fs";
import path from "node:path";
// import { promisify } from "node:util";
import { mkdir, readdir, copyFile, rm, stat } from "node:fs/promises";
import.meta.dirname;

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const origin = "/home/frodo/Videos/media_server";
const destiny = "/var/lib/minidlna/videos";

const SOURCE_DIR = path.resolve(__dirname, origin);
const DEST_DIR = path.resolve(__dirname, destiny);

async function ensureDestinationExists() {
	try {
		await mkdir(DEST_DIR, { recursive: true });
	} catch (err) {
		console.error("Error ensuring destination directory:", err);
	}
}

async function copyAndClear() {
	try {
		const files = await readdir(SOURCE_DIR);

		if (files.length === 0) return;

		for (const file of files) {
			const srcFile = path.join(SOURCE_DIR, file);
			const destFile = path.join(DEST_DIR, file);

			const stats = await stat(srcFile);
			if (stats.isFile()) {
				await copyFile(srcFile, destFile);
				await rm(srcFile);
				console.log(`Copied and removed: ${file}`);
			}
		}
	} catch (err) {
		console.error("Error during copy and clear:", err);
	}
}

function watchFolder() {
	console.log("Watching folder for changes...");

	fs.watch(
		SOURCE_DIR,
		async (eventType: string, filename: string | undefined) => {
			if (filename && eventType === "rename") {
				await copyAndClear();
			}
		}
	);
}

(async () => {
	await ensureDestinationExists();
	watchFolder();
})();
