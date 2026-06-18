const KEYS = {
  token:      'userToken',
  name:       'userName',
  id:         'userId',
  avatarType: 'userAvatarType',
  color:      'userAvatarColor',
};

export const getToken   = ()     => localStorage.getItem(KEYS.token);
export const isLoggedIn = ()     => !!getToken();

export const getUser = () => ({
  token:      localStorage.getItem(KEYS.token),
  name:       localStorage.getItem(KEYS.name),
  id:         localStorage.getItem(KEYS.id),
  avatarType: localStorage.getItem(KEYS.avatarType) || 'star',
  color:      localStorage.getItem(KEYS.color) || '#7C3AED',
});

export function setAuth(data) {
  if (data.token)      localStorage.setItem(KEYS.token,      data.token);
  if (data.username)   localStorage.setItem(KEYS.name,       data.username);
  if (data.id)         localStorage.setItem(KEYS.id,         String(data.id));
  if (data.avatarType) localStorage.setItem(KEYS.avatarType, data.avatarType);
  if (data.avatarColor)localStorage.setItem(KEYS.color,      data.avatarColor);
}

export function clearAuth() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
