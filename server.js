const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const nedb = require('nedb')
const req = require('express/lib/request')
const { response } = require('express')
// const { response } = require('express')
const urlEncodedParser = bodyParser.urlencoded({extended:true})

const upload = multer({
    dest:'public/uploads'
})

var database = new nedb({
    filename:'database.txt',
    autoload: true
})

var app = express()

app.use(express.static('public'))
app.use(urlEncodedParser)
app.set('view engine', 'ejs')

app.get('/',function(request,response){

    var query = {}
    var sortQuery={
        timestamp:  -1
    }

    database.find(query).sort(sortQuery).exec(function(error, data) {
        response.render('index.ejs', {messages: data})
    })
})

app.get('/submit', function(request, response) {
    response.render('submit.ejs');
})

app.get('/article/:id',function(request,response){
    console.log(request.params)
    var id=request.params.id

    var query = {
        _id: id
    }
    database.findOne(query, function(error, data){
        response.render('article.ejs', {message: data})
    }) 
})

app.post('/upload', upload.single('theimage'), function(request,response){
    // console.log(request.body)
    // console.log(request.file)
    var currentDate = new Date()

    var data= {
        articleTitle: request.body.articleTitle,
        articleBody: request.body.articleBody,
        articleSummary: request.body.articleSummary,
        featured: request.body.featured,
        date: currentDate.toLocaleString(),
        timestamp: currentDate.getTime(),
    }

    if(request.file){
            data.image='/uploads/'+request.file.filename
        }

    //featured articles
    var query= { featured: 'on' }
    var update= {$unset: {featured: true}}
    if(data.featured){
        database.update(query, update, {}, function(error, numberUpdated){
        console.log(numberUpdated)
        database.insert(data, function(error, newData){
            console.log(newData)
            response.redirect('/')
        })
    })
    }else {
        database.insert(data, function(error, newData){
        console.log(newData)
        response.redirect('/')
    })
    }
})



app.get('/test', function(request,response){
    response.send("Server is working")
})

app.listen(2331,function(){
    console.log('Server started on port 2331')
})
