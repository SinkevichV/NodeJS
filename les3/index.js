
const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');

const fileCount = path.join(__dirname, "counter.json");

let counters = {};

const loadCounters = () => {
  if (fs.existsSync(fileCount)) {
    const data = fs.readFileSync(fileCount);
    counters = JSON.parse(data);
  } else {
    counters = { "/": 0, "/about": 0 };
  }
};

const saveCounters = () => {
  fs.writeFileSync(fileCount, JSON.stringify(counters, null, 2));
};

app.get("/", (reg, res) => {
  counters["/"]++;
  saveCounters();
  res.send(`<h1>Корневая страница</h1> <h2>Просмотров: ${counters['/']}</h2> <a href="/about">Перейти на страницу about</a>`);
  
});

app.get("/about", (reg, res) => {
  counters["/about"]++;
  saveCounters();
  res.send(`<h1>Страница about</h1> <h2>Просмотров: ${counters['/about']}</h2> <a href="/">Перейти на корневую страницу</a>`);
});

loadCounters();

app.listen(3000);
