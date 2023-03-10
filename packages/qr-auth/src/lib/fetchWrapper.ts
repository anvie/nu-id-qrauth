const baseUrls:any = {
    "dev": "http://localhost:3000/api",
    "prod": "https://www.nu.id/api",
}

function wrapUrl(url: string, env: string = "prod") {
    return baseUrls[env] + url;
}

// API request POST method
export const post = async <T>(url: string, body: any, dev?: boolean, headers?: any): Promise<T> => {
    const authHeader = generateAuthHeader();
    const _headers = {
        "Content-Type": "application/json",
        ...headers,
    };
    if (authHeader) {
        headers["Authorization"] = authHeader;
    }
    try {
        const res = await fetch(wrapUrl(url, dev ? 'dev' : 'prod'), {
            method: "POST",
            headers: _headers,
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!data) throw "No response from server";
        if (data.error) throw data.error;

        return Promise.resolve(data.result);
    } catch (error: any) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            error.toString();
        return Promise.reject(message);
    }
}

// API request POST method
export const upload = async <T>(url: string, body: FormData, headers?: any): Promise<T> => {
    try {
        const res = await fetch(wrapUrl(url), {
            method: "POST",
            headers: {
                "Authorization": generateAuthHeader(),
                ...headers,
            },
            body,
        });
        const data = await res.json();
        if (!data) throw "No response from server";
        if (data.error) throw data.error;

        return Promise.resolve(data.result);
    } catch (error: any) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            error.toString();
        return Promise.reject(message);
    }
}

// API request GET method
export const get = async <T>(url: string): Promise<T> => {
    try {
        const res = await fetch(wrapUrl(url), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": generateAuthHeader(),
            },
        });
        const data = await res.json();
        if (!data) throw "No response from server";
        if (data.error) throw data.error;

        return Promise.resolve(data.result ?? data);
    } catch (error: any) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            error.toString();
        return Promise.reject(message);
    }
}

// API request DELETE method
export const mDelete = async <T>(url: string): Promise<T> => {
    try {
        const res = await fetch(wrapUrl(url), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": generateAuthHeader(),
            },
        });
        const data = await res.json();
        if (!data) throw "No response from server";
        if (data.error) throw data.error;

        return Promise.resolve(data.result);
    } catch (error: any) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            error.toString();
        return Promise.reject(message);
    }
}

const generateAuthHeader = (): string => {
    // if (adminAccess.tokenValue) {
    //     return `Bearer ${adminAccess.tokenValue}`;
    // } else if (userAccess.tokenValue) {
    //     return `Bearer ${userAccess.tokenValue}`;
    // }
    return "";
}

const apiClient = { post, get, mDelete, generateAuthHeader, upload };
export default apiClient;

