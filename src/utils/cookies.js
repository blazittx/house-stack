export const getCookie = (name) => {
  if (typeof document === 'undefined') return ''
  const prefix = `; ${document.cookie}`
  const parts = prefix.split(`; ${name}=`)
  if (parts.length < 2) return ''
  return decodeURIComponent(parts.pop().split(';').shift() || '')
}

export const setCookie = (name, value, days = 365) => {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 86400000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`
}
