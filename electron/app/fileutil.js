const fs = require('fs');
const path = require('path');

var sourcePath = path.join(__dirname, '../data/history.json');
var map = require(sourcePath);

function update(bookId, opts) {
	map[bookId] = {
		bookName: opts.bookName,
		endChapter: opts.endChapter,
		time: opts.time,
		isFinished: false
	}
	var txt = JSON.stringify(map);
	fs.writeFileSync(sourcePath, txt);
}

function setFinished(bookId) {
	map[bookId].isFinished = true;
	var txt = JSON.stringify(map);
	fs.writeFileSync(sourcePath, txt);
}

module.exports = {
	update,
	setFinished
}
