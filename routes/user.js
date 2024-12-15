const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');

// 今回はユーザーが直接 / にアクセスしても意味がなく、
// ユーザーは投票リンク（/poll/:pollId）から入る想定
// よって / は特に定義しなくてよい、または404でもよい。

router.get('/poll/:pollId', async (req, res) => {
  const pollId = req.params.pollId;
  const dataPath = path.join(__dirname, '../data/polls.json');
  const data = await fs.readJson(dataPath);
  const poll = data[pollId];

  if(!poll) return res.status(404).send("Poll not found");

  res.render('user/poll', { pollId, poll });
});

router.post('/poll/:pollId/vote', async (req, res) => {
  const pollId = req.params.pollId;
  const { selected } = req.body;

  const dataPath = path.join(__dirname, '../data/polls.json');
  const data = await fs.readJson(dataPath);
  const poll = data[pollId];

  if(!poll) return res.status(404).send("Poll not found");

  const indices = Array.isArray(selected) ? selected.map(i=>parseInt(i)) : [parseInt(selected)];
  indices.forEach(i => {
    if(poll.results[i] !== undefined) {
      poll.results[i] += 1;
    }
  });

  await fs.writeJson(dataPath, data, {spaces:2});

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

module.exports = router;

