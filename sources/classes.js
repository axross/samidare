export class Test {
  constructor({ name, requestDefault, responseDefault, testcases }) {
    this.name = name;
    this.requestDefault = new RequestParam(requestDefault);
    this.responseDefault = new ResponseParam(responseDefault);
    this.testcases = testcases.map(testcase => {
      return new Testcase(testcase);
    });
  }

  getIterator() {
    const generator = function*(test) {
      let id = 0;

      for (let testcase of test.testcases) {
        ++id;

        const request = Object.assign(
          {},
          test.requestDefault,
          testcase.request,
          {
            headers: Object.assign(
              {},
              test.requestDefault.headers,
              testcase.request.headers,
            ),
          }
        );
        const response = Object.assign(
          {},
          test.responseDefault,
          testcase.response,
          {
            headers: Object.assign(
              {},
              test.responseDefault.headers,
              testcase.response.headers,
            ),
          }
        );

        yield {
          name: test.name,
          id,
          request,
          response,
        };
      }
    };

    return generator(this);
  }
}

export class Testcase {
  constructor({ request, response }) {
    this.request = request;
    this.response = response;
  }
}

export class RequestParam {
  constructor({ method, url, params, queries, headers, body }) {
    this.method = method.toLowerCase();
    this.url = url;
    this.queries = queries || {};
    this.headers = headers || {};
    this.body = body;
  }
}

export class ResponseParam {
  constructor({ status, headers, body }) {
    this.status = status;
    this.headers = headers || {};
    this.body = body;
  }
}
