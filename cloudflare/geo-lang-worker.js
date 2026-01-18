const languageCookie = 'kymec-lang';
const spanishCountries = new Set([
  'AR',
  'BO',
  'CL',
  'CO',
  'CR',
  'CU',
  'DO',
  'EC',
  'ES',
  'GQ',
  'GT',
  'HN',
  'MX',
  'NI',
  'PA',
  'PE',
  'PR',
  'PY',
  'SV',
  'UY',
  'VE'
]);

const getCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (!trimmed) {
      continue;
    }
    const [key, ...rest] = trimmed.split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
};

const isHtmlRequest = request => {
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/html');
};

const getPathLanguage = pathname => {
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    return 'es';
  }
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return 'en';
  }
  return null;
};

const shouldRedirectToLanguage = pathname => pathname === '/' || pathname === '/index.html';
const shouldNormalizeTrailingSlash = pathname => pathname === '/es' || pathname === '/en';

const buildLanguageCookie = language =>
  `${languageCookie}=${encodeURIComponent(language)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;

export default {
  async fetch(request) {
    if (!isHtmlRequest(request)) {
      return fetch(request);
    }

    const cookieHeader = request.headers.get('Cookie') || '';
    const cookieLanguage = getCookieValue(cookieHeader, languageCookie);
    const url = new URL(request.url);
    const pathLanguage = getPathLanguage(url.pathname);
    const country =
      (request.cf && request.cf.country) || request.headers.get('CF-IPCountry') || '';
    const geoLanguage = spanishCountries.has(country) ? 'es' : 'en';
    const language = pathLanguage || cookieLanguage || geoLanguage;
    const shouldSetCookie = !cookieLanguage || (pathLanguage && pathLanguage !== cookieLanguage);

    if (pathLanguage && shouldNormalizeTrailingSlash(url.pathname)) {
      url.pathname = `/${pathLanguage}/`;
      const headers = new Headers({ Location: url.toString() });
      if (shouldSetCookie) {
        headers.append('Set-Cookie', buildLanguageCookie(pathLanguage));
      }
      return new Response(null, { status: 301, headers });
    }

    if (!pathLanguage && shouldRedirectToLanguage(url.pathname)) {
      url.pathname = `/${language}/`;
      const headers = new Headers({ Location: url.toString() });
      if (shouldSetCookie) {
        headers.append('Set-Cookie', buildLanguageCookie(language));
      }
      return new Response(null, { status: 302, headers });
    }

    const response = await fetch(request);
    if (!shouldSetCookie) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.append('Set-Cookie', buildLanguageCookie(language));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
