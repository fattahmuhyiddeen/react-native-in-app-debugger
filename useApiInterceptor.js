import { useEffect, useState } from "react";
import XHRInterceptor from "react-native/Libraries/Network/XHRInterceptor.js";

const filterNonBusinessRelatedAPI = true;

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
    const date = new Date();
    let hour = date.getHours();
    const minute = (date.getMinutes() + "").padStart(2, "0");

    const amPm = hour >= 12 ? "PM" : "AM";

    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }
    const request = {
      ...data,
      timestamp: performance.now(),
      time: `${hour}:${minute} ${amPm}`,
    };
    setApis((v) => {
      const newData = [
        { request, id: Date.now().toString(36) + Math.random().toString(36) },
        ...(maxNumOfApiToStore ? v.slice(0, maxNumOfApiToStore - 1) : v),
      ];
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
          timestamp: performance.now(),
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
