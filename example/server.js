import http from 'http';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// создание экземпляра маршрутизатора
const staticRouter = new HttpStaticRouter({
  // при использовании опции "baseDir", относительные пути
  // в регистрируемых маршрутах будут разрешаться относительно
  // указанного адреса файловой системы
  baseDir: import.meta.dirname,
});

// объявление файла "./index.html"
// в качестве индексной страницы
staticRouter.defineRoute({
  remotePath: '/',
  resourcePath: '../static/index.html',
});

// объявление файла "./page.html"
// доступным по адресу "/page"
staticRouter.defineRoute({
  remotePath: '/page',
  resourcePath: '../static/page.html',
});

// экспозиция содержимого директории "/static"
// для доступа по адресу "/assets/{file_name}"
staticRouter.defineRoute({
  remotePath: '/assets',
  resourcePath: '../static',
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
  console.log('http://localhost:3000');
  console.log('http://localhost:3000/page');
  console.log('http://localhost:3000/assets/rabbit.txt');
  console.log('http://localhost:3000/assets/nested/heart.txt');
});