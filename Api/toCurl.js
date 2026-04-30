export function toCurl(request) {
  const {
    method = 'GET',
    url,
    headers = {},
    query = {},
    body,
  } = request;

  if (!url) {
    throw new Error('URL is required');
  }

  // Escape single quotes for shell safety
  const escape = (str) =>
    String(str).replace(/'/g, `'\\''`);

  // Build query string
  const queryString = Object.keys(query).length
    ? '?' +
      Object.entries(query)
        .map(([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
        )
        .join('&')
    : '';

  const fullUrl = `${url}${queryString}`;

  let curl = [`curl -X ${method.toUpperCase()}`];

  // Add headers
  for (const [key, value] of Object.entries(headers)) {
    curl.push(`-H '${escape(key)}: ${escape(value)}'`);
  }

  // Add body
  if (body !== undefined && body !== null) {
    let data;

    if (typeof body === 'object') {
      data = JSON.stringify(body);
      // Ensure content-type header exists
      if (
        !Object.keys(headers).some(
          (h) => h.toLowerCase() === 'content-type'
        )
      ) {
        curl.push(`-H 'Content-Type: application/json'`);
      }
    } else {
      data = String(body);
    }

    curl.push(`--data '${escape(data)}'`);
  }

  // Add URL last
  curl.push(`'${escape(fullUrl)}'`);

  return curl.join(' \\\n  ');
}