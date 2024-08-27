

export const sendConfirmationEmail = async (): Promise<void> => {
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

    const response = await fetch('http://localhost:8000/user/verify/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authTokensJson.access}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok && response.status != 301 && response.status != 308) {
        throw new Error(`Failed to send confirmation email: ${response.statusText}`);
    }


};