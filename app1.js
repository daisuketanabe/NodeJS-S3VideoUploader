const express = require ('express');
const bodyparser = require ('body-parser');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const AWS = require('aws-sdk');
const multer = require('multer');

const config = require('./config.json');

const app = express();

console.log(config.mySecretAccessKey);

AWS.config.update({ accessKeyId: config.myAccessKeyId, secretAccessKey: config.mySecretAccessKey});

console.log("Web Server Loading...");

app.post('/upload',function(preq,pres){
    const form = new formidable.IncomingForm();
    form.parse(preq, function (err, fields, files) {
        const oldpath = files.filetoupload.path;
        const original = files.filetoupload.name;
        const filename = config.myPath + original;
        //console.log(filename);
        //console.log(files);
        if (files.filetoupload.type.match(/video\/*/)){
            fs.readFile(oldpath, function (err, data) {
                if (err) throw err;
                
                const base64data = new Buffer(data, 'binary');
                const s3 = new AWS.S3();

                s3.putObject({
                    Bucket: config.myBucketName,
                    Key: filename,
                    Body: base64data,
                    ACL: 'public-read'
                },function (resp) {
                    console.log(arguments);
                    console.log('Successfully uploaded package.');
                });
                                
            });
            pres.sendFile(path.join(__dirname+'/upload.html'));
        }else
        {
            pres.sendFile(path.join(__dirname+'/error_type.html'));
        }

        
    });
});

app.get('*',function(req,res){
    const file = req.originalUrl;
    res.status(200);
    res.set('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname+file),function(err){
        if (err)
        {
            res.sendFile(path.join(__dirname+file+'.html'),function(err){
                if (err)
                {
                    res.sendFile(path.join(__dirname+'/error.html'));
                }
            })
        }
    });
})

app.listen(3000,function(){
    console.log("Web Server Started on Port 3000");
})