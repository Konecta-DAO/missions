export const constructRawIcpAssetUrl = (assetPath: string, canisterId: string): string => {
    // Remove leading slash from assetPath if present to avoid double slashes
    const cleanAssetPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
    return `https://${canisterId}.raw.icp0.io/${cleanAssetPath}`;
};