import { createHttpClient } from './createHttpClient';

const __lowerizeHeaders = obj => {
  const lowerized = {};

  for (let key of Object.keys(obj)) {
    lowerized[key.toLowerCase()] = obj[key];
  }

  return lowerized;
};

export const createTester = tape => {
  return ({ name, id, request, expectedResponse }) => {
    const expectedStatus = expectedResponse.status;
    const expectedHeaders = __lowerizeHeaders(expectedResponse.headers);
    const expectedBody = expectedResponse.body;
    const httpClient = createHttpClient(request);

    tape(`${name} #${id}`, t => {
      t.plan(2 + (expectedBody ? 1 : 0));

      httpClient((err, httpResponse) => {
        if (err) {
          t.fail(err.message);
          t.end();

          return;
        }

        const partOfHeaders = {};
        Object.keys(httpResponse.headers)
          .forEach(key => {
            if (expectedHeaders[key.toLowerCase()]) {
              partOfHeaders[key.toLowerCase()] = httpResponse.headers[key];
            }
          });

        t.equal(
          httpResponse.status,
          expectedStatus,
          `A response should be ${expectedStatus}`
        );

        t.deepEqual(
          partOfHeaders,
          expectedHeaders,
          'Reponse headers includes expected headers'
        );

        if (expectedBody) {
          t.deepEqual(
            httpResponse.body,
            expectedBody,
            'A response body is in accord'
          );
        }
      });
    });
  };
};
