const pool = require('./db')
const redis = require('redis');
const { promisify } = require('util')
const REDIS_PORT = process.env.REDIS_PORT || 6379
const client = redis.createClient(REDIS_PORT)
const GET_ASYNC = promisify(client.get).bind(client)
const SET_ASYNC = promisify(client.set).bind(client)

async function getComments(req, res) {
    try {
        const result = await GET_ASYNC('list')
        if (result) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(result) 
        } else {
        const comments = await pool.query("SELECT description FROM comment");
        await SET_ASYNC(
            'list',
            JSON.stringify(comments.rows),
            'EX',
            5
          )
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(comments.rows))
        }    
    } catch (error) {
        console.log(error)
    }
}

async function createComment(req, res) {
    try {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk.toString()
      }) 
      req.on('end', async ()=> {
          const { description } = JSON.parse(body)
          const comment = description
          const newComment = await pool.query("INSERT INTO comment (description) VALUES ($1) RETURNING *", [comment])
          client.del("list")
          res.writeHead(201, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify(newComment))
      })
    } catch (error) {
        console.log(error)
    }
}

async function deleteComment(req, res, id) {
    try {
       const deletedComment = await pool.query("SELECT * FROM comment WHERE comment_id = $1", [id]);
       if(!deletedComment.rows.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Comment Not Found'}))
       } else {
            await pool.query("DELETE FROM comment WHERE comment_id = $1", [id])
            client.del("list")
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({message: `Comment ${id} removed`}))
       }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getComments, 
    createComment, 
    deleteComment
}


