import express from "express";
import path from "path";
// import alert from 'alert-node'
const sharp = require('sharp');
var WordPOS = require('wordpos'),
    wordpos = new WordPOS();
var gm= require('gm');
var fs = require('fs');
const pica = require('pica')();
const pdfjsLib = require('pdfjs-dist');
var fileDownload = require('js-file-download');
import Tesseract from 'tesseract.js'
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Promise from "bluebird";
import caught  from "caught" ;
import auth from "./src/routes/auth";
import users from "./src/routes/users";
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
import pdf from 'pdf-poppler'
const router = express.Router();
const getPageCount = require('docx-pdf-pagecount');


const app = express();

app.use(cors());

dotenv.config();
app.use(bodyParser.json());
mongoose.Promise = Promise;
const p = caught(Promise.reject(0));
 
setTimeout(() => p.catch(e => console.error('caught')), 0);
mongoose.connect(process.env.MONGODB_URL);
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

 const mongoURI = process.env.MONGODB_URL;
 const conn = mongoose.createConnection(mongoURI);

 // Init gfs
 let gfs;
 var mkdirp = require('mkdirp');
    
 mkdirp('./uploads', function (err) {
     if (err) console.error(err)
     else console.log('repository uploads created!')
 });
 mkdirp('./texts', function (err) {
    if (err) console.error(err)
    else console.log('repository texts created!')
});
 mkdirp('./images', function (err) {
    if (err) console.error(err)
    else console.log('repository images created!')
});
 conn.once('open', () => {
   // Init stream
   gfs = Grid(conn.db, mongoose.mongo);
   gfs.collection('uploads');
 });
 const multer = require('multer');
 const storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
     destination: function(req, file, cb) {
         cb(null, './uploads')
     },
     filename: function(req, file, cb) {
         cb(null, file.originalname)
     }
 });
 const upload = multer({storage}); //provide the return value from 
 // Create storage engine
 

app.use("/api/auth", auth);
app.use("/api/users", users);
app.post("/test", (req, res, next) => {
    console.log("got something", req.body);
    res.send({var1: "tata"});
});

app.get("/*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "index.html"));
  next();
});
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

 app.post('/upload', upload.single('file'), (req, res,next) => {
    let var1;
   console.log('Successfully uploaded');
   if(req.file){
    let file = req.file.path;
  let opts = {
      format: 'jpeg',
      out_dir: "./images",
      out_prefix: path.basename(file,path.extname(file)),
      page: null
  }
  fs.writeFile('./texts/' + path.basename(file,path.extname(file))+'.txt', '', function (err) {
      console.log('file created')
  })
  pdf.convert(file, opts)
      .then(res => {
          console.log('Successfully converted');
      })
      .catch(error => {
          console.error(error);
      
      }).then(function(){
    pdfjsLib.getDocument(file)
    .then(function (doc) {
        let numPages = doc.numPages;
    console.log(numPages)


        if(numPages<10){
    
        let newfile='./images/' + path.basename(file,path.extname(file))+'-1' +'.jpg'
        let newfile1='./images/' + path.basename(file,path.extname(file))+'-improved-1'+'.jpg'
        sharp(newfile)
        .resize(1580, 2200).gamma(3)
        .greyscale()
        .sharpen(2.0,1.0,1.0).threshold(120)
        .toFile(newfile1, function(err) {
            const Tesseract = require('tesseract.js').create({
                workerPath: path.join(__dirname, './src/tesseract/node/worker.js'),
                langPath: path.join(__dirname, './src/tesseract/langs'),
                corePath: path.join(__dirname, './src/tesseract/node/index.js')
            });
            Tesseract.recognize(newfile1).then(result => {
               
             fs.writeFile('./texts/' + path.basename(file,path.extname(file))+'-1'+'.txt', result.text, function (err) {
              
        fs.appendFile('./texts/' + path.basename(file,path.extname(file))+'.txt',result.text, function (err) {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
        
          });
         

          fs.readFile('./texts/' + path.basename(file,path.extname(file))+'.txt','utf8',function(err,data){
             const lines = data.split('\n')
              
             lines.forEach(function(line) {
               if(line.indexOf('Objet') >= 0 || line.indexOf('Maphar')>= 0){
                 fs.appendFile('./texts/' + path.basename(file,path.extname(file))+'-extracted'+'.txt', line+ '\n ',function(err){
                   if(err) throw err;
                 
                             var1= path.basename(file,path.extname(file));
                      
                         console.log("le nom du fichier est : " + var1);                     
                         console.log("var1 ", var1);
                         res.send({ var1: var1});
                         next();
                         return;
                   });
                 }     
         }
         )
        })
        
            
        })  
                })
            })
        
    
    }
    else {
        let newfile='./images/' + path.basename(file,path.extname(file))+'-01' +'.jpg'
        let newfile1='./images/' + path.basename(file,path.extname(file))+'-improved-01'+'.jpg'
        sharp(newfile)
        .resize(1580, 2200).gamma(3)
        .greyscale()
        .sharpen(2.0,1.0,1.0).threshold(120)
        .toFile(newfile1, function(err) {
            const Tesseract = require('tesseract.js').create({
                workerPath: path.join(__dirname, './src/tesseract/node/worker.js'),
                langPath: path.join(__dirname, './src/tesseract/langs'),
                corePath: path.join(__dirname, './src/tesseract/node/index.js')
            });
            Tesseract.recognize(newfile1).then(result => {
               
             fs.writeFile('./texts/' + path.basename(file,path.extname(file))+'-01'+'.txt', result.text, function (err) {
              
        fs.appendFile('./texts/' + path.basename(file,path.extname(file))+'.txt',result.text, function (err) {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
        
          });
         

          fs.readFile('./texts/' + path.basename(file,path.extname(file))+'.txt','utf8',function(err,data){
             const lines = data.split('\n')
             
             lines.forEach(function(line) {
               if(line.indexOf('Objet') >= 0 || line.indexOf('Maphar')>= 0){
                 fs.appendFile('./texts/' + path.basename(file,path.extname(file))+'-extracted'+'.txt', line+ '\n ',function(err){
                   if(err) throw err;
                   console.log(line);
                   });
                 }
               else {
                   console.log('no data found')
               }
         }
         
         )})
            
                })
            })
        }) ;
        
    
    

  


    }
    
   

    
    
    
  })
  })

  }
  else {
    console.log('there is no file to convert please upload your file')
  }

  
 });

 function last(req,res){
    console.log(res.locals.var1);
    
    // let results={
                
    //           first:req.var1,
          
    //         others:'req.var2'
    //       }
    // res.send(results);
   
}


 app.use(last)
    

             
              app.post('/doPlenty1',last);
             
              app.post('/doPlenty2', [upload.single('file'), last]);



// app.post('/last', upload.single('file'),(req, res) =>{
   
//        let var1='lines[1]'; 
//      let  var2='lines[2]';
//       console.log("la première ligne c'est"+var1);
//       console.log("la deuxième ligne c'est "+var2)
//     //   console.log(var0)
//       let results={
//         //   asma:var0,
//         first:var1,
  
//       others:var2
//   }
//           res.send(results);
  
  
    

      
// });
app.post('/showfile', upload.single('file'), (req, res) => {
    console.log('Successfully uploaded');
    if(req.file){
     let file = req.file.path;
   let opts = {
       format: 'jpeg',
       out_dir: "./images",
       out_prefix: path.basename(file,path.extname(file)),
       page: null
   }
   fs.writeFile('./texts/' + path.basename(file,path.extname(file))+'.txt', '', function (err) {
       console.log('file created')
   })
   pdf.convert(file, opts)
       .then(res => {
           console.log('Successfully converted');
       })
       .catch(error => {
           console.error(error);
       
       }).then(function(){
     pdfjsLib.getDocument(file)
     .then(function (doc) {
         let numPages = doc.numPages;
     console.log(numPages)
 
 
         if(numPages<10){
     
         let newfile='./images/' + path.basename(file,path.extname(file))+'-1' +'.jpg'
         let newfile1='./images/' + path.basename(file,path.extname(file))+'-improved-1'+'.jpg'
         sharp(newfile)
         .resize(1580, 2200).gamma(3)
         .greyscale()
         .sharpen(2.0,1.0,1.0).threshold(120)
         .toFile(newfile1, function(err) {
             const Tesseract = require('tesseract.js').create({
                 workerPath: path.join(__dirname, './src/tesseract/node/worker.js'),
                 langPath: path.join(__dirname, './src/tesseract/langs'),
                 corePath: path.join(__dirname, './src/tesseract/node/index.js')
             });
             Tesseract.recognize(newfile1).then(result => {
                
              fs.writeFile('./texts/' + path.basename(file,path.extname(file))+'-1'+'.txt', result.text, function (err) {
               
         fs.appendFile('./texts/' + path.basename(file,path.extname(file))+'.txt',result.text, function (err) {
             if (err) throw err;
             console.log('The "data to append" was appended to file!');
         
           });
          
 
           fs.readFile('./texts/' + path.basename(file,path.extname(file))+'.txt','utf8',function(err,data){
              const lines = data.split('\n')
              
              lines.forEach(function(line) {
                if(line.indexOf('Objet') >= 0 || line.indexOf('Maphar')>= 0){
                  fs.appendFile('./texts/' + path.basename(file,path.extname(file))+'-extracted'+'.txt', line+ '\n ',function(err){
                    if(err) throw err;
                    console.log(line);
                    });
                  }
                
          }
          
          )})
             
                 })
             })
         }) ;
         
     
     }
     else {
         let newfile='./images/' + path.basename(file,path.extname(file))+'-01' +'.jpg'
         let newfile1='./images/' + path.basename(file,path.extname(file))+'-improved-01'+'.jpg'
         sharp(newfile)
         .resize(1580, 2200).gamma(3)
         .greyscale()
         .sharpen(2.0,1.0,1.0).threshold(120)
         .toFile(newfile1, function(err) {
             const Tesseract = require('tesseract.js').create({
                 workerPath: path.join(__dirname, './src/tesseract/node/worker.js'),
                 langPath: path.join(__dirname, './src/tesseract/langs'),
                 corePath: path.join(__dirname, './src/tesseract/node/index.js')
             });
             Tesseract.recognize(newfile1).then(result => {
                
              fs.writeFile('./texts/' + path.basename(file,path.extname(file))+'-01'+'.txt', result.text, function (err) {
               
         fs.appendFile('./texts/' + path.basename(file,path.extname(file))+'.txt',result.text, function (err) {
             if (err) throw err;
             console.log('The "data to append" was appended to file!');
         
           });
          
 
           fs.readFile('./texts/' + path.basename(file,path.extname(file))+'.txt','utf8',function(err,data){
              const lines = data.split('\n')
              
              lines.forEach(function(line) {
                if(line.indexOf('Objet') >= 0 || line.indexOf('Maphar')>= 0){
                  fs.appendFile('./texts/' + path.basename(file,path.extname(file))+'-extracted'+'.txt', line+ '\n ',function(err){
                    if(err) throw err;
                    console.log(line);
                    });
                  }
                else {
                    console.log('no data found')
                }
          }
          
          )})
             
                 })
             })
         }) ;
         
     
     
 
   
 
 
     }
     
    
 
     
     
     
   })
   })
 
   res.redirect('/');}
   else {
     console.log('there is no file to convert please upload your file')
   }
   
    
  });
 
     
 
app.listen(8080, () => console.log("Running on localhost:8080"));
