const express = require('express');
const fileUpload = require('express-fileupload');
const { exec } = require("child_process");
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());       // to support JSON-encoded bodies
app.use(fileUpload());         // to support file uploads

app.post('/make/gif', (req, res) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

        const id = req.query.id;

        // create directory for user
        const dir = `./uploads/${id}`;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        req.files.file.forEach(file => {

            // Use the mv() method to place the file somewhere on your server
            file.mv(`./uploads/${id}/${file.name}`, function(err) {
                if (err)
                    console.error(err);

                console.log('File uploaded! ' + file.name);
            });
        });
    

        // execute java command to make gif
        const delay = req.query.delay || 250;
        const output = req.query.output || id;
        const command  = `java -jar ./bin/GifMaker.jar --delay=${delay} --input=uploads/${id} --output=out --name=${output}.gif`;
        
        exec(command, (error, stdout, stderr) => {
                
            if (error) {
                console.log(`error: ${error.message}`);
                res.status(500).send(error.message);
                return;
            }

            if (stderr) {
                console.log(`stderr: ${stderr}`);
                res.status(500).send(stderr);
                return; 
            }

            // remove directory for user
            fs.rmSync(`./uploads/${id}/`, { recursive: true });

            //send OK
            res.send('OK');

        });

});

app.get('/get/gif', (req, res) => {

    const id = req.query.id;

    if(!id) {
        return res.status(400).send('No id provided.');
    }

    if (!fs.existsSync(`./out/${id}.gif`)){
        return res.status(404).send('No gif found.');
    }

    res.sendFile(`./out/${id}.gif`, { root: __dirname });
});


app.get('/get/gif/list', (req, res) => {
    
    if (!fs.existsSync(`./out/`)){
        return res.json([]);
    }

    // list ./out directory
    const list = fs.readdirSync('./out/');
    res.send(list);

});



app.get('/ping', (req, res) => {
    res.send('pong');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

