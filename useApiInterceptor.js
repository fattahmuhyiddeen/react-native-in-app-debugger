import { useEffect, useState } from "react";
import XHRInterceptor from "react-native/Libraries/Network/XHRInterceptor.js";

const filterNonBusinessRelatedAPI = true;

const now = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

const shouldExclude = (url, method) =>
  ["HEAD"].includes(method) ||
  url.includes("codepush") ||
  url.includes("localhost") ||
  url.includes("applicationinsights.azure.com");

const parse = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

export default (maxNumOfApiToStore) => {
  const [apis, setApis] = useState([]);

  const makeRequest = (data) => {
    const request = {
      ...data,
      datetime: now(),
    };
    setApis((v) => {
      const newData = [
        { request, id: Date.now().toString(36) + Math.random().toString(36) },
        ...v,
      ];
      if (maxNumOfApiToStore) newData.slice(0, maxNumOfApiToStore);
      return newData;
    });
  };

  const receiveResponse = (data) => {
    const error = data.status < 200 || data.status >= 400;

    setApis((v) => {
      const oldData = [...v];
      for (let i = 0; i < oldData.length; i++) {
        const old = oldData[i];
        if (
          old.response ||
          old.request.url !== data.config.url ||
          old.request.method !== data.config.method
        )
          continue;

        oldData[i].response = {
          ...data,
          datetime: now(),
          error,
        };
        break;
      }

      return oldData;
    });
  };

  useEffect(() => {
    XHRInterceptor.enableInterception();
    // console.log('API interceptor status', XHRInterceptor.isInterceptorEnabled());
    XHRInterceptor.setSendCallback((...obj) => {
      obj[1].responseType = "text";
      const data = parse(obj[0]);

      const { _method: method, _url: url, _headers: headers } = obj[1];
      if (filterNonBusinessRelatedAPI) {
        if (shouldExclude(url, method)) return;
      }

      makeRequest({
        url,
        headers,
        method,
        data,
      });
    });

    XHRInterceptor.setResponseCallback((...obj) => {
      const { _method: method, _url: url, _response, status } = obj[5];
      if (filterNonBusinessRelatedAPI) {
        if (shouldExclude(url, method)) return;
      }
      const data = parse(_response);

      receiveResponse({
        config: {
          url,
          method,
        },
        data,
        status,
      });
    });
  }, []);

  return { apis, clear: () => setApis([]) };
};
