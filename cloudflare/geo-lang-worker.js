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

export default {
  async fetch(request) {
    const cookieHeader = request.headers.get('Cookie') || '';
    if (!isHtmlRequest(request) || getCookieValue(cookieHeader, languageCookie)) {
      return fetch(request);
    }

    const country =
      (request.cf && request.cf.country) || request.headers.get('CF-IPCountry') || '';
    const language = spanishCountries.has(country) ? 'es' : 'en';

    const response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.append(
      'Set-Cookie',
      `${languageCookie}=${encodeURIComponent(
        language
      )}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
