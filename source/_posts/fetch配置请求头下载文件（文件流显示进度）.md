---
title: fetch配置请求头下载文件（文件流显示进度）
date: 2021-04-14 10:24:33
tags:
- fetch
categories:
- fetch
---

上代码，到时候再写为什么这么做，因为懒

```js
import {
  WritableStream,
} from 'web-streams-polyfill/ponyfill';  
import StreamSaver from 'streamsaver';

const handleFileDownLoad = async (url, username, password, filename) => {
    const tempHeader = new Headers();
    tempHeader.append('Authorization', `Basic ${Base64.encode(`${username}:${password}`)}`);
    fetch(`${url}?pipelineDownLoad=true`, {
      method: 'GET',
      headers: tempHeader,
      // mode: 'no-cors',
      // redirect: 'manual',
    })
      .then((response) => {
        console.log(response);
        if (!window.WritableStream) {
          StreamSaver.WritableStream = WritableStream;
          window.WritableStream = WritableStream;
        }
        const fileStream = StreamSaver.createWriteStream(filename, {
          writableStrategy: true,
          readableStrategy: true,
        });
        const readableStream = response.body;
        if (window.WritableStream && readableStream?.pipeTo) {
          return readableStream.pipeTo(fileStream).then(() => {
            message.success('下载成功');
          });
        }

        const writer = fileStream.getWriter();
        window.writer = writer;

        const reader = response.body?.getReader();
        const pump = () => reader?.read()
          .then((res) => (res.done
            ? writer.close()
            : writer.write(res.value).then(pump)));
        pump();
        // message.success('下载成功');
        return true;
      }).catch((error) => {
        throw new Error(error);
      });
  };
```

