import http from 'http';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// создание экземпляра маршрутизатора
const staticRouter = new HttpStaticRouter({
  // при использовании опции "rootDir", относительные пути
  // в регистрируемых маршрутах будут разрешаться относительно
  // указанного адреса файловой системы
  rootDir: import.meta.dirname,
});

// экспозиция содержимого директории "/static"
// для доступа по адресу "/assets/{file_name}"
staticRouter.defineRoute({
  remotePath: '/assets',    // путь маршрута
  resourcePath: './static', // файловый путь
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
  console.log('http://localhost:3000/assets/nested/file.txt');
});