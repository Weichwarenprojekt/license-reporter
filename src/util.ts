/**
 * Replace the backslashes in a given path
 * @param path The path that shall be modified
 */
export function replaceBackslashes(path: string): string {
    return path.replace(/\\/g, "/");
}
