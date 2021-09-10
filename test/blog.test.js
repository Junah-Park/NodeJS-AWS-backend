const listHelper = require('../utils/list_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')


beforeEach(async () => {
    await Blog.deleteMany({})
    const blog = new Blog(
      {
        title: 'Initial blog for test',
        author: 'Dev',
        url: 'http://www.linkedin.com/',
        likes: 645,
      }
    )
    result = await blog.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
    }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })
})

test('id is a unique identifier', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})

test('a new blog post can be created ', async () => {
    const initialResponse = await api.get('/api/blogs')

    const newBlog = {
        title: "New Blog Test",
        author: "Junah Park",
        url: "www.google.com",
        likes: 88
    }

    await api.post('/api/blogs')

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialResponse.body.length + 1)
})

test('a blog can be deleted', async () => {

    const newBlog = {
        title: "New Blog Test",
        author: "Junah Park",
        url: "www.google.com",
        likes: 88
    }

    const result = await api.post('/api/blogs')

    const response = await api.get(`/api/blogs/${result.body.id}`)
    const deleteBlog = await api
        .delete(`/api/blogs/${result.body.id}`)
    expect(deleteBlog.status).toBe(204)
})

test('a blog can be updated using PUT', async () => {
    const newBlog = {
        title: "New Blog Test",
        author: "Junah Park",
        url: "www.google.com",
        likes: 88
    }

    const result = await api.post('/api/blogs')
        .send(newBlog)

    newBlog.likes += 1

    const response = await api.put(`/api/blogs/${result.body.id}`)
        .send(newBlog)
        
    const updatedResult = await api.get(`/api/blogs/${result.body.id}`)
    expect(updatedResult.body.likes).toBe(newBlog.likes)
})


afterAll(() => {
    mongoose.connection.close()
})