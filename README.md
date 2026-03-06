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
const staticRouter = new HttpStaticRouter({
  // при использовании опции "rootDir", относительные пути
  // в регистрируемых маршрутах будут разрешаться относительно
  // указанного адреса файловой системы
  rootDir: import.meta.dirname,
  // в данном случае "rootDir" указывает
  // на путь к директории текущего модуля
});
// доступ к import.meta.dirname возможен
// только для ESM начиная с Node.js 20.11.0

// экспозиция содержимого директории "/static"
// для доступа по адресу "/assets/{file_name}"
staticRouter.defineRoute({
  remotePath: '/assets',     // путь маршрута
  resourcePath: '../static', // файловый путь
});

// объявление файла "./index.html"
// для доступа по адресу "/home"
staticRouter.defineRoute({
  remotePath: '/home',
  resourcePath: './static/index.html',
});

// создание HTTP сервера и определение
// функции для обработки запросов
const server = new http.Server();
server.on('request', async (req, res) => {
  const fileSent = await staticRouter.handleRequest(req, res);
  if (!fileSent) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('404 Not Found');
    res.end();
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('Try to open:');
  console.log('http://localhost:3000/home');
  console.log('http://localhost:3000/assets/file.txt');
});
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
