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

app.use("/api/auth", auth);
app.use("/api/users", users);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
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
 
 app.post('/upload', upload.single('file'), (req, res) => {
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


        
    for(let i=1;i<numPages+1;i++){
        let newfile='./images/' + path.basename(file,path.extname(file))+'-'+ i +'.jpg'
        let newfile1='./images/' + path.basename(file,path.extname(file))+'-improved-'+ i +'.jpg'
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
               
             fs.writeFile('./texts/' + path.basename(file,path.extname(file))+'-'+ i +'.txt', result.text, function (err) {
              
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
    
   

    
    
    
  })
  })

  res.redirect('/');}
  else {
    console.log('there is no file to convert please upload your file')
  }
  
   
 });

    

    app.post('/convert',  upload.single('file'), (req, res) => {
       var  file = req.file.path;
        console.log(file);
        console.log("c'etait final")
        fs.readFile('./texts/' + path.basename(file,path.extname(file))+'-extracted'+'.txt','utf8',function(err,data){
        const linesa = data.split('\n')
            
            
             let varia= path.basename(file,path.extname(file));
           let var1=linesa[0]; 
         let  var2=linesa[1];
         console.log("la première information c'est : "+varia);
          console.log("la première information c'est : "+var1);
          console.log("la deuxième information c'est : "+var2)
        //   console.log(var0)
          let results={
              asma:varia,
            first:var1,
        
          others:var2
        }
              res.send(results);
        
        })
        
        
            })
app.post('/last', upload.single('file'),(req, res) =>{
   
       let var1='lines[1]'; 
     let  var2='lines[2]';
      console.log("la première ligne c'est"+var1);
      console.log("la deuxième ligne c'est "+var2)
    //   console.log(var0)
      let results={
        //   asma:var0,
        first:var1,
  
      others:var2
  }
          res.send(results);
  
  
    

      
});
 app.post('/showfile',  function(req, res)  {
 
   
      



res.redirect('/');
});
 
app.listen(8080, () => console.log("Running on localhost:8080"));