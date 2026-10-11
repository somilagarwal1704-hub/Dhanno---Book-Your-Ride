// Session tokens live in localStorage so they survive closing the browser.
// Cookies from the Render backend are third-party here (different domain),
// and Safari / mobile browsers often drop them.
const key = (role) => `dhanno_${role}_token`;

export const saveToken = (role, token) => {
  if (token) localStorage.setItem(key(role), token);
};
export const getToken = (role) => localStorage.getItem(key(role));
export const clearToken = (role) => localStorage.removeItem(key(role));