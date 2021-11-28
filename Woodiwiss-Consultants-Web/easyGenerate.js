const { exec } = require("child_process");

const argv = process.argv.slice(0, 2);

let featureModuleName = "";
// Naive argv parsing
process.argv.reduce((cmd, arg) => {
	if (cmd === "name") {
		featureModuleName = arg;
		return;
	}

	if (arg.startsWith("--")) {
		const sub = arg.substring("--".length);
		return sub;
	}

	argv.push(arg);
});

exec(`ng g module ${featureModuleName} & ng g component ${featureModuleName}`, (error, stdout, stderr) => {
	if (stdout) {
		console.log(stdout);
	}

	if (stderr) {
		console.error(stderr);
	}

	if (error) {
		throw error;
	}
});
