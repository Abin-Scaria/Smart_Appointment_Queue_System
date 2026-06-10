const ACCESS_TOKEN_KEY = 'access_token';

function notifySessionChange() {
  window.dispatchEvent(new Event('sessionchange'));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function storeAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  notifySessionChange();
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifySessionChange();
}

export function isSessionActive() {
  return Boolean(getAccessToken());
}
