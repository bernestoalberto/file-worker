import dotenv from "dotenv";
import chokidar from "chokidar";
import nodemailer from "nodemailer";
import path from "node:path";
import process from "node:process";
dotenv.config(); // Load environment variables from .env

// --- Configuration ---
const watchFolder = process.env.WATCH_FOLDER;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailTo = process.env.EMAIL_TO;

if (!watchFolder || !emailUser || !emailPass || !emailTo) {
	console.error(
		"Error: Please ensure WATCH_FOLDER, EMAIL_USER, EMAIL_PASS, and EMAIL_TO are set in your .env file."
	);
	process.exit(1);
}

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
	service: "gmail", // You can use other services like 'Outlook365', 'SMTP', etc.
	// For other services, you might need to specify host and port.
	// Example for generic SMTP:
	/*
                      host: 'smtp.example.com',
                      port: 587, // or 465 for SSL
                      secure: false, // true for 465, false for other ports
                      */
	auth: {
		user: emailUser,
		pass: emailPass,
	},
});

// --- Function to Send Email ---
async function sendNotificationEmail(fileName) {
	const mailOptions = {
		from: emailUser,
		to: emailTo,
		subject: `New File Added: ${fileName}`,
		text: `A new file has been added to the watched folder: ${fileName}\n\nPath: ${path.join(
			watchFolder,
			fileName
		)}`,
		html: `<p>A new file has been added to the watched folder:</p>
               <p><strong>File Name:</strong> ${fileName}</p>
               <p><strong>Full Path:</strong> ${path.join(
									watchFolder,
									fileName
								)}</p>`,
	};

	try {
		let info = await transporter.sendMail(mailOptions);
		console.log(`Email sent: ${info.messageId} - File: ${fileName}`);
	} catch (error) {
		console.error(`Error sending email for file ${fileName}:`, error);
	}
}

// --- Chokidar Watcher Setup ---
console.log(`Watching folder for new files: ${watchFolder}`);

chokidar
	.watch(watchFolder, {
		ignored: /(^|[\/\\])\../, // ignore dotfiles
		persistent: true,
		ignoreInitial: true, // Don't emit "add" events for files that already exist when the watcher starts
		depth: 0, // Only watch the specified folder, not subdirectories
	})
	.on("add", (filePath) => {
		const fileName = path.basename(filePath);
		console.log(`New file added: ${fileName}`);
		sendNotificationEmail(fileName);
	})
	.on("error", (error) => console.error(`Watcher error: ${error}`));

console.log("Script is running...");
