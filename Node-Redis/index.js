import express from 'express'
import axios from 'axios'
import responseTime from 'response-time'
import { createClient } from 'redis'

const app = express()

const client = createClient({
  url: 'redis://localhost:6379'
})

client.on('error', (err) => console.error('Redis Client Error', err))

app.use(responseTime())

// Ruta para todos los personajes
app.get('/characters', async (req, res) => {
  const reply = await client.get('characters')
  if (reply) return res.json(JSON.parse(reply))

  const { data } = await axios.get('https://rickandmortyapi.com/api/character')
  await client.set('characters', JSON.stringify(data))

  return res.json(data)
})

app.get('/characters/:id', async (req, res) => {
  const { id } = req.params

  const reply = await client.get(id)
  if (reply) return res.json(JSON.parse(reply))

  const { data } = await axios.get(`https://rickandmortyapi.com/api/character/${id}`)
  await client.set(id, JSON.stringify(data))

  return res.json(data)
})

const main = async () => {
  await client.connect()
  app.listen(3000, () => {
    console.log('Server corriendo en el puerto 3000')
  })
}

main()
