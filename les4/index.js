const express = require("express");
const joi = require("joi");
const fs = require("fs");
const app = express();
const path = "./users.json";

function readUsersFromFile() {
  if (!fs.existsSync(path)) {
    return [];
  }

  try {
    const data = fs.readFileSync(path);
    const users = JSON.parse(data);
    if (!Array.isArray(users)) {
      throw new Error("Data is not an array");
    }
    return users;
  } catch (err) {
    console.error("Error reading users from file:", err);
    return []; // Возвращаем пустой массив в случае ошибки
  }
}

function writeUsersToFile(users) {
  fs.writeFileSync(path, JSON.stringify(users, null, 2));
}

let users = readUsersFromFile();
let uniqueID = users.length ? Math.max(...users.map((user) => user.id)) : 0;

const userScheme = joi.object({
  firstName: joi.string().min(1).required(),
  secondName: joi.string().min(1).required(),
  age: joi.number().min(0).required(),
  city: joi.string().min(1).optional(),
});

app.use(express.json());

app.get("/users", (req, res) => {
  res.send({ users });
});

app.get("/users/:id", (req, res) => {
  const userId = +req.params.id;
  const user = users.find((user) => user.id === userId);
  if (user) {
    res.send({ user });
  } else {
    res.status(404).send({ user: null });
  }
});

app.post("/users", (req, res) => {
  const result = userScheme.validate(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details });
  }

  uniqueID += 1;
  const newUser = {
    id: uniqueID,
    ...req.body,
  };

  users.push(newUser);
  writeUsersToFile(users);
  res.status(201).send({ id: uniqueID });
});

app.put("/users/:id", (req, res) => {
  const result = userScheme.validate(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details });
  }

  const userId = +req.params.id;
  const user = users.find((user) => user.id === userId);
  if (user) {
    Object.assign(user, req.body);
    writeUsersToFile(users);
    res.send({ user });
  } else {
    res.status(404).send({ user: null });
  }
});

app.delete("/users/:id", (req, res) => {
  const userId = +req.params.id;
  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1)[0];
    writeUsersToFile(users);
    res.send({ user: deletedUser });
  } else {
    res.status(404).send({ user: null });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
