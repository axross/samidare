import superagent from 'superagent';

export const createHttpClient = request => {
  const {
    method,
    url,
    queries,
    headers,
    body,
  } = request;

  const client = superagent[method](url);

  client.query(queries);

  for (let key of Object.keys(headers)) {
    client.set(key, headers[key]);
  }

  if (body) {
    client.send(body);
  }

  return (...args) => client.end(...args);
};
