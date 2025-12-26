export const getProxyUrl = (url?: string, download?: boolean) => {
  if (!url) return '';
  if (url.includes('mega.nz')) {
    const base = `/api/mega-stream?url=${encodeURIComponent(url)}`;
    return download ? `${base}&download=1` : base;
  }
  return url;
};
