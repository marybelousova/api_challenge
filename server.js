const http = require('http')
const redis = require('redis')
const { getComments, createComment, deleteComment } = require('./controller')

const server = http.createServer((req, res) => {
    if(req.url === '/api/comments' && req.method === "GET"){
       getComments(req, res)
    } else if (req.url === '/api/comments' && req.method === "POST"){
        createComment(req, res)
    } else if(req.url.match(/\/api\/comments\/([0-9]+)/) && req.method === 'DELETE') {
        const id = req.url.split('/')[3]
        deleteComment(req, res, id)
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message : 'Route Not Found' }))
    }
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

