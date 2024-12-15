// user.js
const express = require('express');
const path = require('path');
const fs = require('fs-extra');

module.exports = function(io) {
  const router = express.Router();

  router.get('/poll/:pollId', async (req, res) => {
    const pollId = req.params.pollId;
    const dataPath = path.join(__dirname, '../data/polls.json');
    const data = await fs.readJson(dataPath);
    const poll = data[pollId];

    if(!poll) return res.status(404).send("Poll not found");

    if (req.cookies['voted_'+pollId] === 'true') {
      return res.redirect(`/poll/${pollId}/result`);
    }

    res.render('user/poll', { pollId, poll });
  });

  router.post('/poll/:pollId/vote', async (req, res) => {
    const pollId = req.params.pollId;
    const { selected } = req.body;

    const dataPath = path.join(__dirname, '../data/polls.json');
    const data = await fs.readJson(dataPath);
    const poll = data[pollId];

    if(!poll) return res.status(404).send("Poll not found");

    if (req.cookies['voted_'+pollId] === 'true') {
      return res.redirect(`/poll/${pollId}/result`);
    }

    const indices = Array.isArray(selected) ? selected.map(i=>parseInt(i)) : [parseInt(selected)];
    indices.forEach(i => {
      if(poll.results[i] !== undefined) {
        poll.results[i] += 1;
      }
    });

    await fs.writeJson(dataPath, data, {spaces:2});

    res.cookie('voted_'+pollId, 'true', {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    // ここでioを使える
    io.emit('updateResults', {
      pollId: pollId,
      results: poll.results
    });

    res.redirect(`/poll/${pollId}/result`);
  });

  router.get('/poll/:pollId/result', async (req, res) => {
    const pollId = req.params.pollId;
    const dataPath = path.join(__dirname, '../data/polls.json');
    const data = await fs.readJson(dataPath);
    const poll = data[pollId];

    if(!poll) return res.status(404).send("Poll not found");

    res.render('user/result', { pollId, poll });
  });

  return router;
};
