const app = require('express')();
const crypto = require('crypto');
//const Database = require("@replit/database");
//const db = new Database();
const tambola = require('tambola-generator').default;
const TambolaTicket =  require('tambola-generator').TambolaTicket;
const logoData = require("./logos")  

const cssTable = '<style> table { border: 2px solid red } table td { border: 1px solid blue } </style>';
const cssMarker = '<style>.marker { font-size: 108px; position: absolute; opacity: 1; margin-top: -15px; margin-left: -10px; } .show {display:block} .hide {display:none} </style>';
const markerFunctions = "<script>function toggleMarker(elem) { var span = elem.parentNode.children[0]; if (span.attributes.getNamedItem('class').value.indexOf('hide') > -1) {span.className='marker show';} else { if(confirm('Are you sure to unmark this picture?')){span.className='marker hide'; }}}</script>";


global.boardLayouts = new Map();
global.boardDraws = new Map();
global.runningBoards = new Map();
global.tickets = new Map();
global.boardTickets = new Map();

global.masterKey =  process.env['masterKey'];

global.logos = logoData.getLogos();

app.get('/', (req, res) => {
  res.send("Welcome to Logos Tambola. Please hit /init?accessKey=XXX endpoint with the provided access key");
});

app.get('/board/:id/ticket', (req, res) => {
  const boardId = req.params.id;
  if (boardLayouts.has(boardId)) {
    const ticketId = crypto.randomBytes(4).toString('hex');
    var tt = new TambolaTicket();
    tt.generate();
    tickets.set(ticketId, tt);
    boardTickets.set(ticketId, boardId);
    //res.format("text/html");
    var output = "<style>.ticket { font-family: Courier; font-size:20px; font-weight:bold; }</style><h3>Ticket Id : "+ticketId+"</h3><div class='ticket'>";
    output+=tt.getRowValues(0).join(" ")+"<br/>";
    output+=tt.getRowValues(1).join(" ")+"<br/>";
    output+=tt.getRowValues(2).join(" ")+"<br/></div>";
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
    var output = markerFunctions + cssTable + cssMarker + "<center>";
    output+="<h3>Ticket Id : " + ticketId + "</h3>";
    output+="<h3> Board Id : " + boardId + "</h3>";
    output+="<table cellspacing=10 cellpadding=10>";
    output+=getTicketRowLogos(ticket.getRowValues(0), boardId);
    output+=getTicketRowLogos(ticket.getRowValues(1), boardId);
    output+=getTicketRowLogos(ticket.getRowValues(2), boardId);
    output+="</table></center>"
    console.log(ticketId);
    console.log(ticket.getRowValues(0));
    console.log(ticket.getRowValues(1));
    console.log(ticket.getRowValues(2));
    res.send(output);
  } else {
    res.send("Invalid ticket id");
  }
});

function getTicketRowLogos(ticketRow, boardId) {
  const layout = boardLayouts.get(boardId);
  var output = "<tr>";
  for (i=0;i<9;i++) {
    if (ticketRow[i] === 0) {
      output+="<td></td>";
    } else {
      output+="<td style='vertical-align:top'><span onclick='toggleMarker(this);' class='marker hide'>❌</span><img width=128 src='"+logos.get(layout[ticketRow[i]-1])+"' onclick='toggleMarker(this);' ondblclick='hideMarker(this);'>"+"</td>";
    }
  }
  output+="</tr>";
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
    //res.format("text/html");
    var responseBody = "<h3>Board Id =" + boardId + "</h3>";
    responseBody = responseBody + "<h3>Board Sequence =" + boardDraws.get(boardId) + "</h3>";
    res.send(responseBody);
  } else {
    res.send("Invalid Access Key");
  }
});


app.get('/board/:id', (req, res) => {
  const boardId = req.params.id;
  if (boardLayouts.has(boardId)) {
    var companies = boardLayouts.get(boardId);
    var output=cssTable + "<center><table cellspacing=10 cellpadding=10>";
    var row = 1;
    var col = 1;
    var cnt = 0;
    for (row=1;row<10;row++) {
      output+="<tr>"
      for (col=1;col<11;col++) {
        output+="<td>";
        output+="<img width=128 src='"+logos.get(companies[cnt])+"'>";
        cnt++;
        output+="</td>";
      }
      output+="</tr>"
    }
    output+="</table></center>"
    //res.format("text/html");   
    res.send(output);
  } else {
  res.send("Invalid board id");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('server started');
});
