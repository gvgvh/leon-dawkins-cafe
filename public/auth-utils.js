// Helper functions for authentication

function getToken() {
    return localStorage.getItem('token');
}

function getRole() {
    return localStorage.getItem('role');
}

function isAuthenticated() {
    return Boolean(getToken());
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/auth.html';
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/auth.html';
        return false;
    }
    return true;
}

async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${token}`
    };
    
    const response = await fetch(url, { ...options, headers });
    
    // If 401, token expired or invalid, redirect to login
    if (response.status === 401) {
        logout();
        return null;
    }
    
    return response;
}
