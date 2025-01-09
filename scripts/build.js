const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const chalk = require("chalk");
const ora = require("ora").default;
const inquirer = require("inquirer").default;
const esbuild = require("esbuild"); // Add esbuild for minification

// Function to log messages
const log = (message, color = "green") => {
    console.log(chalk[color](message));
};

// Initialize spinner
const spinner = ora();

// Read package.json
const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Extract version
let version = packageJson.version;

// Prompt user to confirm version increment
const promptVersion = async () => {
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "version",
            message: `Current version is ${version}. Enter new version or press enter to continue with the current version:`,
            default: version,
        },
    ]);

    if (answers.version !== version) {
        version = answers.version;
        packageJson.version = version;
        fs.writeFileSync(
            packageJsonPath,
            JSON.stringify(packageJson, null, 2),
            "utf8",
        );
        log(`Updated package.json to version ${version}`, "yellow");
    }
};

// Function to minify JavaScript files
const minifyFiles = async (inputDir, format) => {
    const files = fs.readdirSync(inputDir);

    for (const file of files) {
        const filePath = path.join(inputDir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively minify files in subdirectories
            await minifyFiles(filePath, format);
        } else if (file.endsWith(".js")) {
            // Minify JavaScript files
            await esbuild.build({
                entryPoints: [filePath],
                outfile: filePath, // Overwrite the original file
                minify: true,
                format, // Use the correct format (esm or cjs)
                sourcemap: true,
                allowOverwrite: true,
            });
        }
    }
};

// Main build function
const build = async () => {
    await promptVersion();

    // Update version in version.ts
    spinner.start("Updating version in version.ts...");
    const versionTsPath = path.resolve(__dirname, "../src/version.ts");
    const versionTsContent = `export const VERSION = "${version}";\n`;
    fs.writeFileSync(versionTsPath, versionTsContent, "utf8");
    spinner.succeed(`Updated version.ts to version ${version}`);

    // Clean the dist directory
    spinner.start("Cleaning the dist directory...");
    execSync("rm -fdr ./dist", { stdio: "inherit" });
    spinner.succeed("Cleaned the dist directory");

    // Run biome format
    spinner.start("Linting and formatting source code...\n");
    execSync("biome check . --write --skip-errors --config-path ../../", {
        stdio: "inherit",
    });
    spinner.succeed("Linted and formatted source code (biome)");

    // Compile TypeScript code
    spinner.start("Compiling TypeScript (ESM)...");
    execSync("tsc", { stdio: "inherit" });
    spinner.succeed("Compiled TypeScript (ESM)");
    spinner.start("Compiling TypeScript (CommonJS)...");
    execSync("tsc -p tsconfig.main.json", { stdio: "inherit" });
    spinner.succeed("Compiled TypeScript (CommonJS)");

    // Minify ESM files in /dist/module
    spinner.start("Minifying ESM files...");
    await minifyFiles(path.resolve(__dirname, "../dist/module"), "esm");
    spinner.succeed("Minified ESM files");

    // Minify CJS files in /dist/main
    spinner.start("Minifying CJS files...");
    await minifyFiles(path.resolve(__dirname, "../dist/main"), "cjs");
    spinner.succeed("Minified CJS files");

    log("\n✅ All done! The build process completed successfully.");
};

// Run the build function
build();
