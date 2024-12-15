const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const QRCode = require('qrcode');

// /へのアクセスで投票作成ページ表示
router.get('/', (req, res) => {
  res.render('admin/create');
});

// 別名のルート /create でも同じフォームを表示可能
router.get('/create', (req, res) => {
  res.render('admin/create');
});

router.post('/create', async (req, res) => {
  const { title, multiple } = req.body;
  let { options } = req.body;
  
  // optionsが単一文字列でなく、すでに配列として取得できる想定
  // もし1つでも複数でも常に配列で受け取りたい場合、HTML側で name="options[]" とすること。
  if(!Array.isArray(options)){
    // 念のためoptionsが単一でも配列化
    options = [options];
  }

  // 不要な空文字列が混入しないようtrimとfilter
  const opts = options.map(o => o.trim()).filter(o=>o.length > 0);

  if(opts.length < 1) {
    return res.status(400).send("At least one option is required.");
  }

  const dataPath = path.join(__dirname, '../data/polls.json');
  const data = await fs.readJson(dataPath);

  const pollId = Date.now().toString();
  data[pollId] = {
    title,
    options: opts,
    multiple: multiple === 'on' ? true : false,
    results: opts.map(_=>0)
  };

  await fs.writeJson(dataPath, data, {spaces:2});

  const voteUrl = `${req.protocol}://${req.get('host')}/poll/${pollId}`;
  const qrPath = path.join(__dirname, '../public/qrcode_'+pollId+'.png');
  await QRCode.toFile(qrPath, voteUrl);

  res.render('admin/dashboard', { pollId, voteUrl, qrImage: '/qrcode_'+pollId+'.png' });
});

module.exports = router;

