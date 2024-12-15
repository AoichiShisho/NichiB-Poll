const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');

// 投票画面表示
router.get('/poll/:pollId', async (req, res) => {
  const pollId = req.params.pollId;
  const dataPath = path.join(__dirname, '../data/polls.json');
  const data = await fs.readJson(dataPath);
  const poll = data[pollId];

  if(!poll) return res.status(404).send("Poll not found");

  // クッキーで投票済みかを確認
  if (req.cookies['voted_'+pollId] === 'true') {
    // すでに投票済みなら結果画面へ転送
    return res.redirect(`/poll/${pollId}/result`);
  }

  // 未投票なら投票画面を表示
  res.render('user/poll', { pollId, poll });
});

// 投票処理
router.post('/poll/:pollId/vote', async (req, res) => {
  const pollId = req.params.pollId;
  const { selected } = req.body;

  const dataPath = path.join(__dirname, '../data/polls.json');
  const data = await fs.readJson(dataPath);
  const poll = data[pollId];

  if(!poll) return res.status(404).send("Poll not found");

  // 投票済みかクッキーで再度チェック（念のため）
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

  // 投票が完了したのでクッキーをセット
  res.cookie('voted_'+pollId, 'true', {
    httpOnly: true, // JSで読み取れないようにする
    maxAge: 1000 * 60 * 60 * 24 // 24時間など適宜設定
  });

  res.redirect(`/poll/${pollId}/result`);
});

// 結果画面
router.get('/poll/:pollId/result', async (req, res) => {
  const pollId = req.params.pollId;
  const dataPath = path.join(__dirname, '../data/polls.json');
  const data = await fs.readJson(dataPath);
  const poll = data[pollId];

  if(!poll) return res.status(404).send("Poll not found");

  res.render('user/result', { pollId, poll });
});

module.exports = router;

