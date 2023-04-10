/*
    Super Simple Cache Engine - JSCache
    ** Server **
    v0.0.5a
    By Rodrigo dos Santos Silva
    rosanwork@gmail.com
 */

const express = require('express')
const bodyParser = require('body-parser')
const { networkInterfaces } = require('os')
const cache = require('./cache')

const app = express()
const port = 6464
const myCache = new cache()

// Helper to process body requests
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


// Read from Cache
app.get('/', (req, res) => {
    res.end(JSON.stringify(
        myCache.read(req.query)
    ))
})

// List my KeyValue items
app.get('/list', (req, res)=>{

    res.end(JSON.stringify(
        myCache.list(req.query)
    ))

})

// Returns some basic Cache Stats
app.get('/stats', (req, res)=>{
    res.end(JSON.stringify(
        myCache.stats()
    ))
})

// Save on Cache
app.post('/',(req,res) => {

    /*
        Cache Save OBJ Request :
        {
            auth: // (string) User identification
            name: // (string) Filed name of data cached
            val : // (string) Value to be cached
            life : // (int) Seconds
        }
     */
    res.end(JSON.stringify(
        myCache.add(req.body)
    ))

})

// Remove from Cache
app.delete('/', (req, res)=>{

    res.end(JSON.stringify(
        myCache.delete(req.query)
    ))

})

// Init Server
app.listen(port, () => {
    console.log("[*] Server Ok! \n")
})





