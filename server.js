require('dotenv').config()
const fs = require('fs');
const path = require('path');
const htmlPdf = require('html-pdf-node');
const axios = require('axios');
const validator = require('validator');
const express = require('express');
const http = require('http');


const app = express();
app.use(express.json());
let PORT = process.env.PORT || 8000;

const server = http.createServer(app).listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        const host = server.address().address;
        const port = server.address().port;
        console.log(`Server listening on ${host}:${port}`);
    }
});

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


const fetchHtmlContent = async (url) => {
    try {
        const response = await axios.get(url);
        const htmlContent = response.data;
        return htmlContent; // If you need to use it elsewhere
    } catch (err) {
        console.error('Error fetching HTML:', err);
    }
};


app.get("/", (req, res) => {
    res.send("Welcome to htmltopdf api");
});


app.get("/api/about", (req, res) => {
    res.send("HTML to pdf api");
});

app.post("/api/getPdf", (req, res) => {
    let urlPath = req.body.urlPath;
    if (validator.isURL(urlPath)) {
        (async (url) => {
            let htmlContent = await fetchHtmlContent(url);
            let options = {
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true
            };
            let file = {
                content: htmlContent
            };

            htmlPdf.generatePdf(file, options).then(pdfBuffer => {
                // let pdfFileName = `application/${makeid(10)}.pdf`;
                // fs.writeFileSync(pdfFileName, pdfBuffer);
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="output.pdf"',
                    'Content-Length': pdfBuffer.length
                });
                res.status(200).send(pdfBuffer);
                // res.json({
                //     filePath: pdfFileName
                // })
            });

        })(urlPath);

    }
});