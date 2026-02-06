## @e22m4u/js-http-static-router

HTTP-маршрутизатор статичных ресурсов для Node.js.

## Установка

```bash
npm install @e22m4u/js-http-static-router
```

Модуль поддерживает ESM и CommonJS стандарты.

*ESM*

```js
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';
```

*CommonJS*

```js
const {HttpStaticRouter} = require('@e22m4u/js-http-static-router');
```

## Использование

```js
import http from 'http';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// создание экземпляра маршрутизатора
const staticRouter = new HttpStaticRouter();

// определение директории "../static"
// доступной по адресу "/static"
staticRouter.addRoute(
  '/static',                          // путь маршрута
  `${import.meta.dirname}/../static`, // файловый путь
);

// объявление файла "./static/file.txt"
// доступным по адресу "/static"
staticRouter.addRoute(
  '/file.txt',
  `${import.meta.dirname}/static/file.txt`,
);

// создание HTTP сервера и подключение обработчика
const server = new http.Server();
server.on('request', (req, res) => {
  // если статический маршрут найден,
  // выполняется поиск и отдача файла
  const staticRoute = staticRouter.matchRoute(req);
  if (staticRoute) {
    return staticRouter.sendFileByRoute(staticRoute, req, res);
  }
  // в противном случае запрос обрабатывается
  // основной логикой приложения
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello from App!');
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('Try to open:');
  console.log('http://localhost:3000/static/');
  console.log('http://localhost:3000/file.txt');
});
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
