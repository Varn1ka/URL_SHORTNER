const express = require('express');
const mongoose = require('mongoose');
const app = express();

const User = require('./models/user');
const Url = require('./models/url');

let authRoutes = require('./routes/authRoutes');
let urlRoutes = require('./routes/urlRoutes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log(authRoutes, urlRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);


app.get('/:shortId', async (req, res) => {
  let shortId = req.params.shortId;
  let url = await Url.findOne({ shortId: shortId });
  if (!url) return res.send('URL not found');
  res.redirect(url.originalUrl);
});

mongoose.connect('mongodb://127.0.0.1:27017/urlshortener')
  .then(() => console.log('MongoDB Connected!'));

app.listen(7000, () => {
  console.log('Server started on port 7000');
});