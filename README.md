## @e22m4u/js-http-static-router

HTTP-маршрутизатор статичных ресурсов для Node.js.

Модуль удобен для встраивания документации или административных панелей
непосредственно в серверное приложение, позволяя избежать развертывания
дополнительной инфраструктуры.

- Интеграция в существующий *http*-сервер.
- Управление доступа к файловой системе через маршруты.
- Использование потоков для экономии оперативной памяти.

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

## Базовый пример

Пример предполагает следующую структуру проекта.

```txt
/static
  ├── index.html
  └── /assets
       └── rabbit.txt
/src
  └── server.js
```

Создание маршрутизатора, определение маршрутов и запуск сервера.

```js
// src/server.js
import path from 'path';
import http from 'http';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// создание экземпляра маршрутизатора
const staticRouter = new HttpStaticRouter({
  // при использовании опции "baseDir", относительные пути
  // в регистрируемых маршрутах будут разрешаться относительно
  // указанного адреса файловой системы
  baseDir: path.join(import.meta.dirname, '../static'),
});
// доступ к import.meta.dirname (директория текущего модуля)
// возможен только для ESM начиная с Node.js 20.11.0

// объявление файла "index.html"
// в качестве индексной страницы
staticRouter.defineRoute({
  remotePath: '/',
  resourcePath: './index.html',
});

// экспозиция содержимого директории "assets"
// для доступа относительно корня
// пример: http://localhost:3000/rabbit.txt
staticRouter.defineRoute({
  remotePath: '/',
  resourcePath: './assets',
});

// создание HTTP сервера и определение
// слушателя для обработки запросов
const server = new http.Server();
server.on('request', async (req, res) => {
  const fileSent = await staticRouter.handleRequest(req, res);
  // если файл не был отправлен,
  // то возвращается 404 Not Found
  if (!fileSent) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('404 Not Found');
    res.end();
  }
});

// запуск сервера
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('Try to open:');
  console.log('http://localhost:3000');
  console.log('http://localhost:3000/rabbit.txt');
});
```

Запуск Node.js процесса.

```bash
$ node ./src/server.js
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
