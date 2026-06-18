const API_BASE = 'https://sofiabuzz.com';

function getHeaders(extra = {}) {
  const token = localStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  return data;
}

export const apiGet    = (path)        => request('GET',    path);
export const apiPost   = (path, body)  => request('POST',   path, body);
export const apiPatch  = (path, body)  => request('PATCH',  path, body);
export const apiDelete = (path)        => request('DELETE', path);
