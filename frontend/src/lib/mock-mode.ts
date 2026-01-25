export const isMockMode = (): boolean => {
    const flag = process.env.NEXT_PUBLIC_MOCK_MODE || process.env.NEXT_PUBLIC_TOOLS_MOCK || "";
    return flag === "1" || flag.toLowerCase() === "true";
};
