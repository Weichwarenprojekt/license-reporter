import { OptionValues } from "commander";
import { IPackageInfo, IReporterConfiguration, loadConfiguration, SearchMode } from "./configuration";
import path from "path";
import fs from "fs";
import { replaceBackslashes } from "./util";
import chalk from "chalk";
import { EOL } from "os";
import { globSync } from "glob";

/**
 * Analyzes the node modules and generates a report
 */
export async function reportLicenses(options: OptionValues): Promise<void> {
    const config = await loadConfiguration(options);
    const packages = findPackages(config);
    const rawInfo = extractInformation(config, packages);
    const preparedInfo = prepareInformation(config, rawInfo);
    const isInfoComplete = validateInformation(config, preparedInfo);
    exportInformation(config, preparedInfo);
    if (!config.force && !isInfoComplete) {
        process.exit(1);
    }
}

/**
 * Search for all the package.jsons of the third party modules
 * @param config The configuration
 */
function findPackages(config: IReporterConfiguration): string[] {
    // Get the package folders
    const packageFolders = findPackageFolders(config);

    // Search for packageJsons in all the folders
    let packages: string[] = [];
    for (const folder of packageFolders) {
        if (config.search === SearchMode.recursive) {
            packages.push(...globSync(`${folder}/**/package.json`))
         } else {
            packages.push(...globSync(`${folder}/*/package.json`))
         }
    }

    packages = packages.map((pkg) => replaceBackslashes(pkg))

    return preparePackages(config, packages);
}

/**
 * Searches for the matching node_module folders
 * @param config The configuration
 */
function findPackageFolders(config: IReporterConfiguration): string[] {
    // Find the matching folders and filter out ignored once
    let globPath = config.search === SearchMode.recursive ? path.resolve(config.root, "**/") : config.root;
    globPath = path.resolve(globPath, "node_modules");
    globPath = replaceBackslashes(globPath);
    let packageFolders = globSync(globPath, { ignore: "**/node_modules/**/node_modules/**" });
    packageFolders = packageFolders.filter((directory) => {
        for (const ignorePath of config.ignore) if (directory.includes(ignorePath)) return false;
        return true;
    }).map((directory) => {
        return replaceBackslashes(directory)
    })

    packageFolders.push(...config.addFolder);

    // Inform the user
    console.log(`Found ${packageFolders.length} ${packageFolders.length === 1 ? "folder" : "folders"}...`);
    for (const folder of packageFolders) console.log(`- ${folder}`);
    return packageFolders;
}

/**
 * Filters and sorts the package paths
 * @param config The configuration
 * @param allPackages All the found packages
 */
function preparePackages(config: IReporterConfiguration, allPackages: string[]): string[] {
    // Filter out specific packages
    const packages = allPackages.filter((packagePath) => {
        for (const ignorePath of config.ignore) if (packagePath.includes(ignorePath)) return false;
        return true;
    });

    // Sort out nested package.jsons if parent directory already contains a package.json
    let currentDirectory = packages.length > 0 ? `${path.dirname(packages[0])}/` : "";
    for (let i = 1; i < packages.length; ) {
        if (packages[i].includes(currentDirectory)) {
            packages.splice(i, 1);
        } else {
            currentDirectory = `${path.dirname(packages[i])}/`;
            i++;
        }
    }
    console.log(`Found ${packages.length} ${packages.length === 1 ? "package" : "packages"}. Start processing...`);

    // Alphabetically sort the paths
    packages.sort();

    return packages;
}

/**
 * Extract the information of the packages
 * @param config The configuration
 * @param packages The paths to each third party package
 */
function extractInformation(config: IReporterConfiguration, packages: string[]): Map<string, IPackageInfo> {
    const infos = new Map<string, IPackageInfo>();
    for (const packagePath of packages) {
        try {
            const packageInfo = extractPackageInformation(config, packagePath);
            infos.set(packageInfo.name, packageInfo);
        } catch (e) {
            console.error(`Could not extract license information from "${packagePath}".`);
            console.error(e);
        }
    }
    return infos;
}

/**
 * Extract the information of a single package
 * @param config The configuration
 * @param packagePath The path to the package
 */
function extractPackageInformation(config: IReporterConfiguration, packagePath: string): IPackageInfo {
    // Parse the package json
    const packageJson: {
        name?: unknown;
        homepage?: unknown;
        license?: unknown;
        repository?: string | { url: string };
        version?: unknown;
    } = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    // Make sure to convert backslashes to forward slashes as glob only works with forward slashes
    const packageDirectory = replaceBackslashes(path.dirname(packagePath));
    const packageInfo: IPackageInfo = {
        name: typeof packageJson.name === "string" ? packageJson.name : "",
        url: typeof packageJson.homepage === "string" ? packageJson.homepage : "",
        licenseName: typeof packageJson.license === "string" ? packageJson.license : "",
        licenseText: "",
        version: typeof packageJson.version === "string" ? packageJson.version : "",
    };
    if (!packageInfo.name) packageInfo.name = path.basename(packageDirectory);
    const url: string | unknown | undefined =
        typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository?.url;
    if (typeof url === "string" && !packageInfo.url) packageInfo.url = url;
    packageInfo.url = packageInfo.url.replace(/^git\+/, "");
    packageInfo.url = packageInfo.url.replace(/^git:\/\//, "https://");

    // Search for a license
    const options = { nocase: true, cwd: packageDirectory };
    let licenseFiles = globSync("licens*", options);
    if (licenseFiles.length === 0) licenseFiles = globSync("copyin*", options);
    const licensePath = licenseFiles[0];
    if (licensePath) packageInfo.licenseText = fs.readFileSync(path.resolve(packageDirectory, licensePath), "utf-8");
    if (!packageInfo.licenseText) packageInfo.licenseText = config.defaultLicenseText;
    return packageInfo;
}

/**
 * Prepare the raw information
 * @param config The reporter configuration
 * @param rawInfo The raw package information
 */
function prepareInformation(config: IReporterConfiguration, rawInfo: Map<string, IPackageInfo>): IPackageInfo[] {
    // Add the data from the overrides
    for (const override of config.overrides) {
        const packageName = override.name; // Ignore overrides that don't have a name set
        if (!packageName) continue;
        const raw = rawInfo.get(packageName);
        if (raw) {
            rawInfo.set(packageName, Object.assign(raw, override));
        } else {
            rawInfo.set(packageName, {
                name: packageName,
                url: override.url ?? "",
                licenseName: override.licenseName ?? "",
                licenseText: override.licenseText ?? "",
                version: override.version ?? "",
            });
        }
    }

    // Sort alphabetically
    const infos = Array.from(rawInfo.values());
    infos.sort((a, b) => a.name.localeCompare(b.name));
    return infos;
}

/**
 * Validate the package information and notify the user if information is missing
 * @param config The configuration
 * @param infos The package information
 */
function validateInformation(config: IReporterConfiguration, infos: IPackageInfo[]): boolean {
    let isInfoComplete = true;
    const handleIncompleteInfo = (missingField: string, packageName: string): void => {
        isInfoComplete = false;
        console.warn(
            chalk.yellow(
                `No "${chalk.bold(missingField)}" was found for the package "${chalk.bold(
                    packageName,
                )}". You can add "overrides" to the reporter configuration to manually complete the information of a package.`,
            ),
        );
    };
    for (const info of infos) {
        if (!info.url && !config.ignoreMissingUrl) handleIncompleteInfo("url", info.name);
        if (!info.licenseName) handleIncompleteInfo("licenseName", info.name);
        if (!info.licenseText) handleIncompleteInfo("licenseText", info.name);
        if (!info.version) handleIncompleteInfo("version", info.name);
    }
    return isInfoComplete;
}

/**
 * Export the package information into the output file
 * @param config The reporter configuration
 * @param infos The information
 */
function exportInformation(config: IReporterConfiguration, infos: IPackageInfo[]): void {
    fs.mkdirSync(path.dirname(config.output), { recursive: true });
    fs.writeFileSync(config.output, `${JSON.stringify(infos, null, 4)}${EOL}`);
    console.log(chalk.green(`Finished. Results were written to "${chalk.bold(config.output)}"`));
}
