const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let users = {}; // Wallet interne simulé
let ethPriceUSD = 2000; // Prix simulé en USD
const tokenToETH = 0.0001; // 1 token = 0.0001 ETH

// Miner des tokens
app.post("/mine", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "username manquant" });
  if (!users[username]) users[username] = { tokens: 0 };

  const minedTokens = Math.floor(Math.random() * 10) + 1;
  users[username].tokens += minedTokens;

  res.json({
    message: `${username} a miné ${minedTokens} tokens !`,
    totalTokens: users[username].tokens,
  });
});

// Convertir tokens en crypto (simulation ETH)
app.post("/convert", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "username manquant" });
  if (!users[username] || users[username].tokens <= 0)
    return res.json({ message: "Pas assez de tokens." });

  const tokenAmount = users[username].tokens;
  const ethAmount = tokenAmount * tokenToETH;
  users[username].tokens = 0;

  res.json({
    message: `${ethAmount} ETH simulés pour ${username} ! Wallet interne reset.`,
  });
});

// Estimation du temps pour atteindre un montant cible
app.post("/estimate", (req, res) => {
  const { targetUSD, avgTokensPerMine, minesPerDay } = req.body;
  if (!avgTokensPerMine || !minesPerDay || !targetUSD)
    return res.status(400).json({ message: "Paramètres manquants." });

  const tokensNeeded = (targetUSD / ethPriceUSD) / tokenToETH;
  const actionsNeeded = tokensNeeded / avgTokensPerMine;
  const daysNeeded = actionsNeeded / minesPerDay;

  res.json({
    tokensNeeded: Math.ceil(tokensNeeded),
    actionsNeeded: Math.ceil(actionsNeeded),
    estimatedDays: Math.ceil(daysNeeded),
    message: `Pour atteindre ${targetUSD}$, il faut environ ${Math.ceil(daysNeeded)} jours avec ${minesPerDay} actions/jour.`
  });
});

// Vérification du serveur
app.get("/status", (req, res) => {
  res.json({ status: "ok", usersCount: Object.keys(users).length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur Token Miner prêt sur port ${PORT}`));
