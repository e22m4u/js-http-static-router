## @e22m4u/js-http-static-router

HTTP-маршрутизатор статичных ресурсов для Node.js.

Модуль удобен для встраивания документации или административных панелей
непосредственно в серверное приложение, позволяя избежать развертывания
дополнительной инфраструктуры.

- Интеграция в существующий *http*-сервер.
- Управление доступом к файловой системе через маршруты.
- Использование потоков для экономии оперативной памяти.

## Содержание

- [Установка](#установка)
- [Базовый пример](#базовый-пример)
- [Маршрутизатор](#маршрутизатор)
  - [Создание экземпляра](#создание-экземпляра)
  - [Регистрация маршрута](#регистрация-маршрута)
- [Тесты](#тесты)
- [Лицензия](#лицензия)

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
node ./src/server.js
```

## Маршрутизатор

Класс `HttpStaticRouter` является основным компонентом модуля. Он отвечает
за хранение определений маршрутов, сопоставление входящих HTTP-запросов
с ресурсами файловой системы и потоковую передачу данных клиенту.

### Создание экземпляра

Конструктор маршрутизатора принимает объект настроек, который позволяет
задать базовые параметры работы.

Сигнатура:

```ts
type HttpStaticRouterOptions = {
  baseDir?: string;
};

constructor(options?: HttpStaticRouterOptions);
```

**Параметры**

- `baseDir: string` - абсолютный путь к базовой директории.  
  Если параметр указан, все относительные пути при регистрации маршрутов
  будут разрешаться относительно этой директории.

**Пример**

Создание экземпляра с указанием базовой директории для статических файлов.

```js
import path from 'path';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// создание маршрутизатора с указанием абсолютного пути
// к директории, в которой хранятся статические файлы
const staticRouter = new HttpStaticRouter({
  baseDir: path.join(import.meta.dirname, '../public'),
});
```

*i. Доступ к переменной `import.meta.dirname` (директория текущего модуля)
возможен только при использовании *ESM* стандарта, начиная с версии
Node.js 20.11.0. Для более ранних версий или *CommonJS*
используется `__dirname`.*

### Регистрация маршрута

Метод `defineRoute` добавляет новое правило маршрутизации, связывая виртуальный
путь (URL) с реальным файлом или директорией на сервере. В момент вызова
данного метода маршрутизатор проверяет физическое существование указанного
ресурса в файловой системе.

Сигнатура:

```ts
type StaticRouteDefinition = {
  remotePath: string;
  resourcePath: string;
};

defineRoute(routeDef: StaticRouteDefinition): StaticRoute;
```

**Параметры**

- `remotePath: string`  
  Префикс URL-адреса, с которого должен начинаться входящий запрос (обязательно
  должен начинаться со слеша `/`).

- `resourcePath: string`  
  Путь к файлу или директории в файловой системе.

*i. Если при [создании экземпляра](#создание-экземпляра) маршрутизатора не была
указана опция `baseDir`, значение параметра `resourcePath` обязано быть
абсолютным путем.*

**Примеры**

Регистрация конкретного файла. Запрос точно по указанному адресу вернет
содержимое связанного файла.

```js
// предполагается, что маршрутизатор был создан
// с указанием базовой директории (опция "baseDir")
staticRouter.defineRoute({
  remotePath: '/about',
  resourcePath: './pages/about.html',
});

// GET /about
// -> вернет содержимое ./pages/about.html
```

Экспозиция содержимого директории. Если маршрут указывает на директорию,
дополнительная часть URL-адреса будет автоматически добавлена к пути
файловой системы.

```js
// открытие доступа ко всем файлам
// внутри директории "assets"
staticRouter.defineRoute({
  remotePath: '/public',
  resourcePath: './assets',
});

// GET /public/images/logo.png
// -> вернет содержимое ./assets/images/logo.png
```

Регистрация маршрута с использованием абсолютного пути.

```js
import path from 'path';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// создание экземпляра без опций
const router = new HttpStaticRouter();

// так как опция "baseDir" не была задана, маршрутизатор требует
// передачи абсолютного пути для свойства "resourcePath",
// иначе будет выброшена ошибка InvalidArgumentError
router.defineRoute({
  remotePath: '/robots.txt',
  resourcePath: path.join(import.meta.dirname, '../public/robots.txt'),
});
```

*i. Маршрутизатор выполняет проверку безопасности. Если при запросе клиент
попытается выйти за пределы каталога с помощью относительных переходов
(например, `GET /public/../../etc/passwd`), обработчик прервет поиск
и файл не будет отправлен.*

## Тесты

```bash
npm run test
```

## Лицензия

MIT
