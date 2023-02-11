import { OptionValues } from "commander";
import { IPackageInfo, IReporterConfiguration, loadConfiguration, SearchMode } from "./configuration";
import glob from "glob";
import path from "path";
import fs from "fs";
import { replaceBackslashes } from "./util";

/**
 * Analyzes the node modules and generates a report
 */
export async function reportLicenses(options: OptionValues): Promise<void> {
    const config = await loadConfiguration(options);
    const packages = findPackages(config);
    const rawInfo = extractInformation(packages);
    const preparedInfo = prepareInformation(config, rawInfo);
    const isInfoComplete = validateInformation(preparedInfo);
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
    let globPath = config.search === SearchMode.recursive ? path.resolve(config.root, "**/") : config.root;
    globPath = path.resolve(globPath, "node_modules", "**", "package.json");

    // Make sure to convert backslashes to forward slashes as glob only works with forward slashes
    globPath = replaceBackslashes(globPath);
    if (config.ignore) {
        if (!Array.isArray(config.ignore)) config.ignore = [config.ignore];
        for (let i = 0; i < config.ignore.length; i++) {
            config.ignore[i] = replaceBackslashes(config.ignore[i]);
        }
    }
    const packages = glob.sync(globPath, { ignore: config.ignore });

    // Sort out nested package.jsons if parent directory already contains a package.json
    let currentDirectory = packages.length > 0 ? `${path.dirname(packages[0])}/` : "";
    for (let i = 1; i < packages.length; ) {
        if (packages[i].includes(currentDirectory)) {
            packages.splice(i, 1);
        } else if (i > 1 && packages[i - 2].includes(currentDirectory)) {
            packages.splice(i - 2, 1);
            i--;
        } else {
            currentDirectory = `${path.dirname(packages[i])}/`;
            i++;
        }
    }
    return packages;
}

/**
 * Extract the information of the packages
 * @param packages The paths to each third party package
 */
function extractInformation(packages: string[]): Map<string, IPackageInfo> {
    const infos = new Map<string, IPackageInfo>();
    for (const packagePath of packages) {
        try {
            const packageInfo = extractPackageInformation(packagePath);
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
 * @param packagePath The path to the package
 */
function extractPackageInformation(packagePath: string): IPackageInfo {
    // Parse the package json
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    // Make sure to convert backslashes to forward slashes as glob only works with forward slashes
    const packageDirectory = path.dirname(packagePath).replace(/\\/g, "/");
    const packageInfo: IPackageInfo = {
        name: packageJson.name,
        url: packageJson.homepage,
        licenseName: packageJson.license ?? "",
        licenseText: "",
    };
    if (!packageInfo.name) packageInfo.name = path.basename(packageDirectory);
    packageInfo.url ??=
        typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository?.url;
    packageInfo.url ??= "";
    packageInfo.url = packageInfo.url.replace(/^git\+/, "");
    packageInfo.url = packageInfo.url.replace(/^git:\/\//, "https://");

    // Search for a license
    const options = { nocase: true, cwd: packageDirectory };
    let licenseFiles = glob.sync("licens*", options);
    if (licenseFiles.length === 0) licenseFiles = glob.sync("copyin*", options);
    const licensePath = licenseFiles[0];
    if (licensePath) packageInfo.licenseText = fs.readFileSync(path.resolve(packageDirectory, licensePath), "utf-8");
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
 * @param infos The package information
 */
function validateInformation(infos: IPackageInfo[]): boolean {
    let isInfoComplete = true;
    const hint =
        'You can add "overrides" to the reporter configuration to manually complete the information of a package.';
    const handleIncompleteInfo = (message: string): void => {
        isInfoComplete = false;
        console.warn(message);
    };
    for (const info of infos) {
        if (!info.url) handleIncompleteInfo(`No "url" was found for the package "${info.name}". ${hint}`);
        if (!info.licenseName)
            handleIncompleteInfo(`No "licenseName" was found for the package "${info.name}". ${hint}`);
        if (!info.licenseText)
            handleIncompleteInfo(`No "licenseText" was found for the package "${info.name}". ${hint}`);
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
    let outputPath = config.output;
    if (!path.isAbsolute(outputPath)) outputPath = path.resolve(config.root, outputPath);
    fs.writeFileSync(outputPath, JSON.stringify(infos, null, 4));
}
