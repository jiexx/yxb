
let pdfextractor = require('./pdfextractor.js')
let fs = require('fs'),
PDFParser = require("pdf2json");

let pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
		let ex = new pdfextractor(pdfData.formImage.Pages);
		let data = ex.extract();
		
		var str = decodeURI(JSON.stringify(data));
		str = str.replace(/%2C/g, ".");
		str = str.replace(/%2F/g, "/");
		
		fs.writeFile("./out.json", str);
	});

pdfParser.loadPDF("./603843_2017_3A.pdf");
