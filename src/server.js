const express = require("express");
const server = express();
const path = require("path");
const nunjucks = require("nunjucks");

const PORT = 3000;

const db = require(path.resolve(__dirname, "database", "db.js"));

server.use(express.static("public"));
server.use(express.urlencoded({ extended: true }));

// Utilizando template engine
nunjucks.configure("src/views", {
  express: server,
  noCache: true,
});

server.get("/", (req, res) => {
  return res.render("index.html", {
    title: "Seu marketplace de coleta de resíduos",
  });
});

server.get("/create-point", (req, res) => {
  return res.render("create-point.html");
});

server.post("/savepoint", (req, res) => {
  const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
      `;

  const values = [
    req.body.image,
    req.body.name,
    req.body.address,
    req.body.address2,
    req.body.state,
    req.body.city,
    req.body.items,
  ];

  function afterInsertData(err) {
    if (err) {
      console.log(err);
      return res.render("create-point.html", { saved: false });
    }
    console.log("Cadastrado com sucesso");
    console.log(this);
    return res.render("create-point.html", { saved: true });
  }

  db.run(query, values, afterInsertData);
});

server.get("/search-results", (req, res) => {
  const search = req.query.search;

  if (search == "") {
    return res.render("search-results.html", { total: 0 });
  }

  //Pegar os dados do banco de dados
  db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (
    err,
    rows
  ) {
    if (err) {
      return console.log(err);
    }

    const total = rows.length;

    // Mostrar a página html com os dados do banco de dados
    return res.render("search-results.html", { places: rows, total });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
