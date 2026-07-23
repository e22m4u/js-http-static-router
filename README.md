## @e22m4u/js-http-static-router

![npm version](https://badge.fury.io/js/@e22m4u%2Fjs-http-static-router.svg)
![license](https://img.shields.io/badge/license-mit-blue.svg)

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
  - [Обработка запросов](#обработка-запросов)
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

Создание экземпляра с указанием базовой директории.

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
путь (*URL*) с реальным файлом или директорией на сервере. В момент вызова
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
  Префикс URL-адреса, с которого должен начинаться входящий запрос  
  (обязательно должен начинаться со слеша `/`).

- `resourcePath: string`  
  Путь к существующему файлу или директории в файловой системе.

*i. Если при [создании экземпляра](#создание-экземпляра) маршрутизатора не была
указана опция `baseDir`, значение параметра `resourcePath` обязано быть
абсолютным путем.*

**Примеры**

Регистрация конкретного файла. Запрос по указанному пути в параметре
`remotePath` вернет содержимое связанного файла. Маршрутизатор учитывает
наличие/отсутствие завершающего слеша в конце пути.

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

// создание экземпляра без параметров
const router = new HttpStaticRouter();

// так как опция "baseDir" не задана, маршрутизатор требует
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

### Обработка запросов

Метод `handleRequest` выполняет сопоставление входящего HTTP-запроса
с зарегистрированными маршрутами и выполняет отправку найденного файла
клиенту. При чтении файла маршрутизатор использует потоки, что позволяет
безопасно отдавать файлы большого размера без переполнения оперативной
памяти сервера.

Маршрутизатор автоматически определяет *MIME-тип* ресурса на основе его
расширения, устанавливает необходимые заголовки, а также корректно обрабатывает
обрыв соединения со стороны клиента, своевременно закрывая файловый поток
для предотвращения утечек памяти.

Сигнатура:

```ts
handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<boolean>;
```

**Параметры**

- `request: IncomingMessage` - нативный поток входящего запроса Node.js;
- `response: ServerResponse` - нативный поток исходящего ответа Node.js;

**Возвращаемое значение**

Метод возвращает `Promise`, который разрешается логическим значением `false`,
если маршрут не совпал, целевой файл физически отсутствует или метод запроса
не поддерживается. Во всех остальных случаях значением будет `true`, что
позволяет определить, взял ли на себя ответственность за обработку запроса
маршрутизатор.

**Пример**

Интеграция метода в обработчик событий нативного HTTP-сервера.
Если `handleRequest` возвращает `false`, сервер берет на себя
ответственность за отправку ответа с ошибкой клиенту.

```js
import http from 'http';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// создание экземпляра маршрутизатора
const staticRouter = new HttpStaticRouter();
// staticRouter.defineRoute(...)

const server = new http.Server();

server.on('request', async (req, res) => {
  // передача объектов запроса и ответа маршрутизатору
  const fileSent = await staticRouter.handleRequest(req, res);

  // если маршрутизатор вернул false, файл не был отправлен
  if (!fileSent) {
    // ручная отправка статуса 404 Not Found
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.write('404 Not Found');
    res.end();
  }
});
```

Маршрутизатор обрабатывает исключительно запросы с методами `GET` и `HEAD`.
При получении запроса с любым другим методом, обработка прерывается и метод
возвращает `false`. В случае `HEAD` запроса маршрутизатор корректно вычисляет
размер файла и отправляет соответствующие заголовки, пропуская отправку
тела ответа.

## Тесты

```bash
npm run test
```

## Лицензия

MIT
