const app = require('express')();
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const tambola = require('tambola-generator').default;
const TambolaTicket = require('tambola-generator').TambolaTicket;
const logoData = require("./logos");
const assets = require("./assets");

global.boardLayouts = new Map();
global.boardDraws = new Map();
global.runningBoards = new Map();
global.tickets = new Map();
global.boardTickets = new Map();
global.ticketPlayers = new Map();
global.logos = logoData.getLogos();
global.options = { root: path.join(__dirname) };
global.masterKey = process.env['masterKey'];

app.use(bodyParser.urlencoded({ extended: true }));

//Landing page for players
app.get('/', (req, res) => {
  res.sendFile("play-form.html", options);
});

//Admin page
app.get('/admin', (req, res) => {
  res.sendFile("admin.html", options);
});

function generateTicket(boardId, player) {
  const ticketId = crypto.randomBytes(4).toString('hex');
  var tt = new TambolaTicket();
  tt.generate();
  tickets.set(ticketId, tt);
  boardTickets.set(ticketId, boardId);

  if (player != null) {
    ticketPlayers.set(ticketId, player);
  }
  return ticketId;
}

app.get('/board/:id/ticket', (req, res) => {
  const boardId = req.params.id;
  if (boardLayouts.has(boardId)) {
    var ticketId = generateTicket(boardId);
    var output = "<style>.ticket { font-family: Courier; font-size:20px; font-weight:bold; }</style><h3>Ticket Id : " + ticketId + "</h3><div class='ticket'>";
    output += tt.getRowValues(0).join(" ") + "<br/>";
    output += tt.getRowValues(1).join(" ") + "<br/>";
    output += tt.getRowValues(2).join(" ") + "<br/></div>";
    res.send(output);
  } else {
    res.send("Invalid board id, cannot generate ticket for it.");
  }
});

app.get('/ticket/:id', (req, res) => {
  const ticketId = req.params.id;
  if (tickets.has(ticketId)) {
    var ticket = tickets.get(ticketId);
    const boardId = boardTickets.get(ticketId);
    var output = assets.markerFunctions + assets.cssTable + assets.cssMarker + "<center>";
    output += "<h3>  Ticket Id : " + ticketId + "</h3>";
    output += "<h3>   Board Id : " + boardId + "</h3>";
    output += "<h3>Player Name : " + ticketPlayers.get(ticketId) + "</h3>";
    output += "<table cellspacing=10 cellpadding=10>";
    output += getTicketRowLogos(ticket.getRowValues(0), boardId);
    output += getTicketRowLogos(ticket.getRowValues(1), boardId);
    output += getTicketRowLogos(ticket.getRowValues(2), boardId);
    output += "</table></center>"
    /*console.log(ticketId);
    console.log(ticket.getRowValues(0));
    console.log(ticket.getRowValues(1));
    console.log(ticket.getRowValues(2));*/
    res.send(output);
  } else {
    res.send("Invalid ticket id");
  }
});

function getTicketRowLogos(ticketRow, boardId) {
  const layout = boardLayouts.get(boardId);
  var output = "<tr>";
  for (i = 0; i < 9; i++) {
    if (ticketRow[i] === 0) {
      output += "<td></td>";
    } else {
      output += "<td style='vertical-align:top'><span onclick='toggleMarker(this);' class='marker hide'>❌</span><img width=128 src='" + logos.get(layout[ticketRow[i] - 1]) + "' onclick='toggleMarker(this);'>" + "</td>";
    }
  }
  output += "</tr>";
  return output;
}

app.get('/board/init', (req, res) => {
  const ak = req.query.accessKey;
  if (ak === masterKey) {
    const boardId = crypto.randomBytes(4).toString('hex');
    var keys = Array.from(logos.keys());
    keys.sort(() => Math.random() - 0.5);
    // as tambola only has 90 elements on board
    const boardSeq = keys.slice(0, 90);
    boardLayouts.set(boardId, boardSeq);
    boardDraws.set(boardId, tambola.getDrawSequence());
    res.json({ "valid": true, "boardId": boardId, "boardSequence": boardDraws.get(boardId) });
  } else {
    res.json({ "valid": false });
  }
});

app.get('/board/:id', (req, res) => {
  const boardId = req.params.id;
  if (boardLayouts.has(boardId)) {
    var companies = boardLayouts.get(boardId);
    var output = assets.cssTable + "<center><table cellspacing=10 cellpadding=10>";
    var row = 1;
    var col = 1;
    var cnt = 0;
    for (row = 1; row < 10; row++) {
      output += "<tr>"
      for (col = 1; col < 11; col++) {
        output += "<td>";
        output += "<img width=128 src='" + logos.get(companies[cnt]) + "'>";
        cnt++;
        output += "</td>";
      }
      output += "</tr>"
    }
    output += "</table></center>"
    res.json({ "valid": true, "boardHtml": output });
  } else {
    res.json({ "valid": false });
  }
});

app.post('/play/submit', (req, res) => {
  var boardId = req.body.boardId;
  if (boardLayouts.has(boardId)) {
    var player = req.body.name;
    var ticketId = generateTicket(boardId, player);
    res.redirect('/ticket/' + ticketId);
  } else {
    res.send("Invalid Board Id, Please go back and try again");
  }
}
);

app.listen(process.env.PORT || 3000, () => {
  console.log('server started');
});
