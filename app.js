const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const port = 3000

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const responseTime = require('./response-time');
app.use(responseTime);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// Queue
app.post('/tasks', (req, res) => {
    const queueFn = (fn) => {
        let q = Promise.resolve()
        return (...args) => {
            q = q.then(() => fn(...args)).catch(() => {})
            return q
        }
    }
    const write = (name, delay) => {
        return new Promise((resolve) => {
            let time = new Date();
            let hours = time.getHours();
            let minutes = time.getMinutes();
            let seconds = time.getSeconds();
            setTimeout(() => {
                console.log('Queue Param:'+name+' | '+hours+':'+minutes+':'+seconds)
                resolve()
            }, delay)
        })
    }
    const queued = queueFn(write);
    queued(req.body.name,4000);
    res.json(req.body.name)
})

// CORS
const allowedCorsDomains = [
    'http://oguzhan.com',
    'http://oguzhan2.com'
]
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowedCorsDomains.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}
app.post('/q6-service-1', cors(corsOptionsDelegate), function (req, res, next) {
    res.json({msg: 'This is CORS-enabled for an allowed domain.'})
})
app.post('/q6-service-2', cors(corsOptionsDelegate), function (req, res, next) {
    res.json({msg: 'This is CORS-enabled for an allowed domain.'})
})
app.post('/q6-service-3',(req, res) => {
    res.json({msg: 'This is not enabled CORS for domain.'})
})

// REQUEST LIMITER - 409 Too Many Request
const rateLimit = require('express-rate-limit')
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
app.post('/q7', apiLimiter, async (req, res) => {
    let data = [];
    const axios = require('axios').default;
    axios.get('https://www.cheapshark.com/api/1.0/games?ids=128')
        .then(function (response) {
            console.log("-> response", response.data);
            data = response.data;
            res.json(data)
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {});
})

// Request Time Reduce
app.post('/q8', async (req, res) => {
    let data = [];
    const axios = require('axios').default;
    const store = require('store')
    if(store.get('request')){
        res.json(JSON.parse(store.get('request')))
    }else{
        console.log("REQUEST NOT EXISTS")
        axios.get('https://www.cheapshark.com/api/1.0/games?ids=128,129,130,131')
            .then(function (response) {
                data = response.data;
                store.set('request', JSON.stringify(response.data) )
                res.json(data)
            })
            .catch(function (error) {
                console.log(error);
            })
            .then(function () {
            });
    }
})
