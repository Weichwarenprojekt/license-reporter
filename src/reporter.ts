import { OptionValues } from "commander";
import { IReporterConfiguration, loadConfiguration } from "./configuration";
import glob from "glob";
import path from "path";
import fs from "fs";

/**
 * The package information for a single package
 */
export interface IPackageInfo {
    /** The name of the package */
    name: string;
    /** The url to the homepage/repo of the package */
    url: string;
    /** The license information */
    license: {
        /** The name of the license */
        name: string;
        /** The license text */
        text: string;
    };
}

/**
 * Analyzes the node modules and generates a report
 */
export async function reportLicenses(options: OptionValues): Promise<void> {
    const config = await loadConfiguration(options);
    const packages = findPackages(config);
    const infos = extractInformation(packages);
    console.log(infos);
}

/**
 * Search for all the package.jsons of the third party modules
 * @param config The configuration
 */
function findPackages(config: IReporterConfiguration): string[] {
    let globPath = config.recursive ? path.resolve(config.root, "**/") : config.root;
    globPath = path.resolve(globPath, "node_modules", "**", "package.json");
    // Make sure to convert backslashes to forward slashes as glob only works with forward slashes
    globPath = globPath.replace(/\\/g, "/");
    return glob.sync(globPath);
}

/**
 * Extract the information of the packages
 * @param packages The paths to each third party package
 */
function extractInformation(packages: string[]): IPackageInfo[] {
    const infos: IPackageInfo[] = [];
    for (const packagePath of packages) {
        try {
            infos.push(extractPackageInformation(packagePath));
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
        license: {
            name: packageJson.license,
            text: "",
        },
    };
    if (!packageInfo.name) packageInfo.name = path.basename(packageDirectory);
    packageInfo.url ??=
        typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository?.url;
    packageInfo.url = packageInfo.url.replace(/^git\+/, "");
    packageInfo.url = packageInfo.url.replace(/^git:\/\//, "https://");

    // Search for a license
    const options = { nocase: true, cwd: packageDirectory };
    let licenseFiles = glob.sync("licens*", options);
    if (licenseFiles.length === 0) licenseFiles = glob.sync("copyin*", options);
    const licensePath = licenseFiles[0];
    if (licensePath) packageInfo.license.text = fs.readFileSync(path.resolve(packageDirectory, licensePath), "utf-8");
    return packageInfo;
}
