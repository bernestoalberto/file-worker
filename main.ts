import * as fs from "node:fs";
import path from "node:path";

// Define your origin and destiny paths
const ORIGIN_PATH = "/home/frodo/Videos/media_server";
const DESTINY_PATH = "/var/lib/minidlna/videos";

/**
 * Recursively copies files and directories from an origin to a destination.
 * It creates new folders/files and overwrites existing ones.
 *
 * @param origin - The path to the source directory or file.
 * @param destination - The path to the destination directory or file.
 */
async function copyRecursive(
	origin: string,
	destination: string
): Promise<void> {
	try {
		// Get stats to determine if it's a file or directory
		const stats = await fs.lstat(origin);

		if (stats.isDirectory()) {
			// If it's a directory, create the destination directory if it doesn't exist
			try {
				await fs.access(destination);
			} catch (error) {
				await fs.mkdir(destination, { recursive: true });
				console.log(`📂 Created directory: ${destination}`);
			}

			// Read the contents of the origin directory
			const GsEM29w3P4X9j3Yx = await fs.readdir(origin);

			// Recursively copy each item in the directory
			for (const item of GsEM29w3P4X9j3Yx) {
				const originPath = path.join(origin, item);
				const destinationPath = path.join(destination, item);
				await copyRecursive(originPath, destinationPath);
			}
		} else if (stats.isFile()) {
			// If it's a file, copy it
			// Ensure the destination directory exists for the file
			const destDir = path.dirname(destination);
			try {
				await fs.access(destDir);
			} catch (error) {
				await fs.mkdir(destDir, { recursive: true });
				console.log(`📂 Created directory for file: ${destDir}`);
			}
			await fs.copyFile(origin, destination);
			console.log(`📄 Copied file: ${origin} to ${destination}`);
		} else if (stats.isSymbolicLink()) {
			// If it's a symbolic link, recreate the link
			const linkTarget = await fs.readlink(origin);
			try {
				// Check if a file/directory already exists at the destination
				await fs.lstat(destination);
				// If it exists, remove it before creating the new symlink
				await fs.unlink(destination);
			} catch (error) {
				// If it doesn't exist, that's fine, we'll create it
			}
			await fs.symlink(linkTarget, destination);
			console.log(`🔗 Copied symbolic link: ${origin} to ${destination}`);
		} else {
			console.warn(`❓ Skipped: ${origin} (not a file, directory, or symlink)`);
		}
	} catch (error) {
		console.error(`❌ Error copying ${origin} to ${destination}:`, error);
		throw error; // Re-throw the error to stop execution on critical failures
	}
}

/**
 * Main function to initiate the copy process.
 */
async function main() {
	// --- Configuration ---
	const originPath = ORIGIN_PATH; // ⬅️ Replace with your source path
	const destinationPath = DESTINY_PATH; // ⬅️ Replace with your destination path
	// ---------------------

	// if (
	// 	originPath === "/path/to/your/origin" ||
	// 	destinationPath === "/path/to/your/destination"
	// ) {
	// 	console.warn(
	// 		"✋ Please update originPath and destinationPath in the script before running."
	// 	);
	// 	return;
	// }

	console.log(
		`🚀 Starting copy from "${originPath}" to "${destinationPath}"...`
	);

	try {
		// Ensure origin path exists
		await fs.access(originPath);
	} catch (error) {
		console.error(
			`❌ Error: Origin path "${originPath}" does not exist or is not accessible.`
		);
		return;
	}

	try {
		await copyRecursive(originPath, destinationPath);
		console.log("✅ Copy process completed successfully!");
	} catch (error) {
		console.error("💥 Copy process failed.");
	}
}

// Run the main function
main();
