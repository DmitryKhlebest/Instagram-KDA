const nconf = require('nconf');
const path = require('path');

//  Настройка nconf для использования (в порядке):
  //    1. Аргументы командной строки
  //    2. Переменные среды
  //    3. Файл, расположенный по адресу ...
nconf.argv()
	.env()
	.file({ file: path.join(__dirname, 'config.json') });

module.exports = nconf;