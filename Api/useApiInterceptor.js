import { useEffect, useState } from 'react';
// import XHRInterceptor from 'react-native/Libraries/Network/XHRInterceptor.js';
import axios from 'axios';
// const overrideResponse = false; // Set to true to override the response with a random value
// const filterNonBusinessRelatedAPI = true;

const originalFetch = global.fetch;

const shouldExclude = (url, method) =>
  ['HEAD'].includes(method) ||
  url.includes('codepush') ||
  url.includes('localhost') ||
  url.includes('applicationinsights.azure.com');

const parse = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};
let interceptorId = null;
export default ({ maxNumOfApiToStore, blacklists, blacklistRef, mocks }) => {
  const [apis, setApis] = useState([]);
  const [bookmarks, setBookmarks] = useState({});

  useEffect(() => {
    setBookmarks((v) => {
      const oldV = { ...v };
      const bookmarkkeys = Object.keys(oldV);
      for (let i = 0; i < bookmarkkeys.length; i++) {
        if (!apis.some(({ id }) => id === bookmarkkeys[i])) {
          delete oldV[bookmarkkeys[i]];
        }
      }
      return oldV;
    });
  }, [apis]);

  const makeRequest = (data) => {
    if (blacklistRef.current.some((b) => b.url === data.url && b.method === data.method)) return;
    const date = new Date();
    let hour = date.getHours();
    const minute = (date.getMinutes() + '').padStart(2, '0');
    const second = (date.getSeconds() + '').padStart(2, '0');

    const request = {
      ...data,
      timestamp: performance.now(),
      datetime: new Date().toLocaleString(),
      time: `${hour}:${minute}:${second}`,
      isMocked: undefined,
      interface: undefined
    };
    setApis((v) => {
      const newData = [
        { request, id: Date.now().toString(36) + Math.random().toString(36), isMocked: !!data.isMocked, interface: data.interface },
        ...(maxNumOfApiToStore ? v.slice(0, maxNumOfApiToStore - 1) : v),
      ];
      return newData;
    });
  };

  useEffect(() => {
    setApis((v) => v.filter((v) => !blacklists.some((b) => b.url === v.request.url && b.method === v.request.method)));
  }, [blacklists]);

  const receiveResponse = (data) => {
    const error = data.status < 200 || data.status >= 400;

    setApis((v) => {
      const oldData = [...v];
      for (let i = 0; i < oldData.length; i++) {
        const old = oldData[i];
        if (old.response || old.request.url !== data.config.url || old.request.method !== data.config.method) continue;

        oldData[i].response = {
          ...data,
          timestamp: performance.now(),
          error,
        };
        break;
      }

      return oldData;
    });
  };

  useEffect(() => {
    const mocked = (url, method) => {
      // console.log('xxxxxx url method', url, method);
      // console.log('xxxxxx mocks', mocks);
      return mocks.find(
        (m) =>
          m.request.url.toLowerCase() === url.toLowerCase() && m.request.method.toLowerCase() === method.toLowerCase(),
      );
    };
    global.fetch = async function (...args) {
      // console.log('xxxxxxxx [Fetch Request]', args);
      const [url, { headers, method, body } = { method: 'get' }] = args;

      try {
        if (!shouldExclude(url, method)) {
          const data = body ? parse(body) : undefined;

          makeRequest({
            url,
            headers,
            method,
            data,
            interface: 'fetch',
          });
        }

        // return new Response(JSON.stringify({"xxxx": "xxxxx"}), {
        //     status: 444,
        //     headers: { 'Content-Type': 'application/json' },
        //   });

        const response = await originalFetch(...args);
        // console.log('xxxxxx [Fetch Response]', response);
        // const data = await response.json();
        // alert('aaaa')
        // const returnedTarget = Object.assign({}, response);
        // const data = await returnedTarget.json();

        // const reader = response.body.getReader();
        // const decoder = new TextDecoder();
        // let result = '';

        // function read() {
        //   return reader.read().then(({ done, value }) => {
        //     if (done) {
        //       console.log('Response body:', result);
        //       return;
        //     }
        //     result += decoder.decode(value, { stream: true });
        //     return read();
        //   });
        // }

        // const data = read();
        // alert(JSON.stringify(data));

        receiveResponse({
          config: {
            url: response.url,
            headers: response.headers,
            method: response.method || method,
          },
          status: response.status,
          // data: { aaa: 'bbb' },
        });

        // console.log('xxxxxx fetch checking mock');
        const mock = mocked(url, method);

        if (mock) {
          // console.log('xxxxxx jest mocked', mock);
        }
        // console.log('xxxxxx jest response', response);

        // console.log('[Fetch Response]', args);

        // if (overrideResponse) {
        //   // Mock a random response value
        //   const randomValue = { message: 'Random overridden fetch response' };

        //   // Create a new Response object with JSON stringified randomValue
        //   return new Response(JSON.stringify(randomValue), {
        //     status: 200,
        //     headers: { 'Content-Type': 'application/json' },
        //   });
        // }

        return response;
      } catch (error) {
        // console.log(error);
        // console.error('[Fetch Error]', error);
        return new Response(JSON.stringify(error), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
        // throw error;
      }
    };

    // --- Intercept Axios globally ---
    axios.interceptors.request.use(
      (config) => {
        // console.log('[Axios Request]', config);

        const { method, url, headers } = config;
        if (!shouldExclude(url, method)) {
          const data = config.data ? parse(config.data) : undefined;

        const mock = mocked(url, method);

          makeRequest({
            url,
            headers,
            method,
            data,
            isMocked: !!mock,
            interface: 'axios',
          });
        }

        return config;
      },
      (error) => {
        // alert(JSON.stringify(error));
        // console.error('[Axios Request Error]', error);

        receiveResponse({
          config: error.config,
          status: error.response?.status,
        });
        return Promise.reject(error);
      },
    );

    if (interceptorId) axios.interceptors.response.eject(interceptorId);

    interceptorId = axios.interceptors.response.use(
      (response) => {
        // console.log('[Axios Response]', response);

        // if (overrideResponse) {
        //   // Replace response.data with random value
        // response.data = { message: 'Random overridden Axios response' };
        // response.status = 200;
        // }
        // mocked(response.config.url, response.config.method)?.response?.data

        // console.log('xxxxxx axios checking mock');
        const mock = mocked(response.config.url, response.config.method);

        if (mock?.response) {
          // console.log('xxxxxx axios mocked', mock);
          response = mock.response;
        }
        // console.log('xxxxxx axios response', response);
        receiveResponse(response);

        return response;
      },
      (error) => {
        receiveResponse({
          config: error.config,
          status: error.response?.status,
        });
        return Promise.reject(error);
      },
    );
  }, [mocks]);

  return { apis, clear: () => setApis([]), bookmarks, setBookmarks };
};
