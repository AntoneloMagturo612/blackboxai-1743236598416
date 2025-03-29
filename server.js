const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/files', (req, res) => {
    fs.readdir(__dirname, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory');
        }
        const textFiles = files.filter(file => file.endsWith('.txt'));
        res.json(textFiles);
    });
});

app.get('/file/:name', (req, res) => {
    const filename = req.params.name;
    const filePath = path.join(__dirname, filename);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).send('File not found');
            }
            return res.status(500).send('Error reading file');
        }
        res.send(data);
    });
});

app.post('/file/:name', (req, res) => {
    const filename = req.params.name;
    const content = req.body.content;
    const filePath = path.join(__dirname, filename);
    
    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error saving file');
        }
        res.send('File saved successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});