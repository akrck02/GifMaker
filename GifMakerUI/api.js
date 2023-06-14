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
        

        console.log(req.files);
        
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        req.files.file.forEach(file => {
            console.log(file);

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
                }

                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }

                //console.log(`stdout: ${stdout}`);
                res.sendFile(`./out/${output}.gif`, { root: __dirname });
        });

});

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

