

export const getAccessToken = () => {
    const authTokens = localStorage.getItem('authTokens');

    if (!authTokens) {
        throw new Error("Tokens were not returned from backend!");
    }

    let authTokensJson;
    try {
        authTokensJson = JSON.parse(authTokens);
    } catch (error) {
        throw new Error("Tokens cannot be parsed");
    }

    if (!authTokensJson?.access) {
        throw new Error("Access token is missing");
    }

    return authTokensJson.access
};