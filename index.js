const app = require('express')();
const crypto = require('crypto');
//const Database = require("@replit/database");
//const db = new Database();
const tambola = require('tambola-generator').default;
const TambolaTicket =  require('tambola-generator').TambolaTicket;

const cssTable = '<style> table { border: 2px solid red } table td { border: 1px solid blue } </style>';
const cssMarker = '<style>.marker { color: red; font-family: Arial; font-size: 128px; font-weight: bold; text-align: center; width: 128px; height: 128px; position: absolute; opacity: 1; } .show {display:block} .hide {display:none} </style>';
const markerFunctions = "<script>function toggleMarker(elem) { var span = elem.parentNode.children[0]; if (span.attributes.getNamedItem('class').value.indexOf('hide') > -1) {span.className='marker show';} else { if(confirm('Are you sure to unmark this picture?')){span.className='marker hide'; }}}</script>";


global.boardLayouts = new Map();
global.boardDraws = new Map();
global.runningBoards = new Map();
global.tickets = new Map();
global.boardTickets = new Map();

global.masterKey =  process.env['masterKey'];

// init all the companies here - 100
global.logos = new Map();
logos.set('Walmart','https://logo.clearbit.com/walmart.com');
logos.set('Exxon Mobil','https://logo.clearbit.com/exxonmobil.com');
logos.set('Apple','https://logo.clearbit.com/apple.com');
logos.set('Dominos','https://logo.clearbit.com/dominos.com');
logos.set('Amazon','https://logo.clearbit.com/amazon.com');
logos.set('UnitedHealth Group','https://logo.clearbit.com/unitedhealthgroup.com');
logos.set('McKesson','https://logo.clearbit.com/mckesson.com');
logos.set('CVS Health','https://logo.clearbit.com/cvshealth.com');
logos.set('AT&T','https://logo.clearbit.com/att.com');
logos.set('US Postal Service','https://logo.clearbit.com/usps.com');
logos.set('Chevron','https://logo.clearbit.com/chevron.com');
logos.set('Ford Motor','https://logo.clearbit.com/corporate.ford.com');
logos.set('General Motors','https://logo.clearbit.com/gm.com');
logos.set('Costco Wholesale','https://logo.clearbit.com/costco.com');
logos.set('Alphabet','https://logo.clearbit.com/abc.xyz');
logos.set('Cardinal Health','https://logo.clearbit.com/cardinalhealth.com');
logos.set('Walgreens','https://logo.clearbit.com/walgreens.com');
logos.set('JPMorgan Chase','https://logo.clearbit.com/jpmorganchase.com');
logos.set('Verizon Communications','https://logo.clearbit.com/verizon.com');
logos.set('Kroger','https://logo.clearbit.com/thekrogerco.com');
logos.set('General Electric','https://logo.clearbit.com/ge.com');
logos.set('Fannie Mae','https://logo.clearbit.com/fanniemae.com');
logos.set('IKEA','https://logo.clearbit.com/ikea.com');
logos.set('Valero Energy','https://logo.clearbit.com/valero.com');
logos.set('Bank of America','https://logo.clearbit.com/bofa.com');
logos.set('Microsoft','https://logo.clearbit.com/microsoft.com');
logos.set('Home Depot','https://logo.clearbit.com/homedepot.com');
logos.set('Boeing','https://logo.clearbit.com/boeing.com');
logos.set('Wells Fargo','https://logo.clearbit.com/wellsfargo.com');
logos.set('Citigroup','https://logo.clearbit.com/citigroup.com');
logos.set('Subway','https://logo.clearbit.com/subway.com');
logos.set('Comcast','https://logo.clearbit.com/comcastcorporation.com');
logos.set('Anthem','https://logo.clearbit.com/antheminc.com');
logos.set('Dell','https://logo.clearbit.com/delltechnologies.com');
logos.set('DuPont','https://logo.clearbit.com/dupont.com');
logos.set('State Farm Insurance','https://logo.clearbit.com/statefarm.com');
logos.set('Johnson & Johnson','https://logo.clearbit.com/jnj.com');
logos.set('IBM','https://logo.clearbit.com/ibm.com');
logos.set('Target','https://logo.clearbit.com/target.com');
logos.set('Freddie Mac','https://logo.clearbit.com/freddiemac.com');
logos.set('United Parcel Service','https://logo.clearbit.com/ups.com');
logos.set('Lowe\'s','https://logo.clearbit.com/lowes.com');
logos.set('Intel','https://logo.clearbit.com/intel.com');
logos.set('MetLife','https://logo.clearbit.com/metlife.com');
logos.set('Procter & Gamble','https://logo.clearbit.com/pg.com');
logos.set('United Technologies','https://logo.clearbit.com/utc.com');
logos.set('FedEx','https://logo.clearbit.com/fedex.com');
logos.set('PepsiCo','https://logo.clearbit.com/pepsico.com');
logos.set('HSBC','https://logo.clearbit.com/hsbc.com');
logos.set('Prudential Financial','https://logo.clearbit.com/prudential.com');
logos.set('H & M','https://logo.clearbit.com/hm.com');
logos.set('Chase','https://logo.clearbit.com/chase.com');
logos.set('Walt Disney','https://logo.clearbit.com/thewaltdisneycompany.com');
logos.set('Sysco','https://logo.clearbit.com/sysco.com');
logos.set('HP','https://logo.clearbit.com/hp.com');
logos.set('Humana','https://logo.clearbit.com/humana.com');
logos.set('Facebook','https://logo.clearbit.com/facebook.com');
logos.set('Caterpillar','https://logo.clearbit.com/caterpillar.com');
logos.set('Energy Transfer','https://logo.clearbit.com/energytransfer.com');
logos.set('Lockheed Martin','https://logo.clearbit.com/lockheedmartin.com');
logos.set('Pfizer','https://logo.clearbit.com/pfizer.com');
logos.set('Goldman Sachs Group','https://logo.clearbit.com/gs.com');
logos.set('Morgan Stanley','https://logo.clearbit.com/morganstanley.com');
logos.set('Cisco Systems','https://logo.clearbit.com/cisco.com');
logos.set('Cigna','https://logo.clearbit.com/cigna.com');
logos.set('AIG','https://logo.clearbit.com/aig.com');
logos.set('JetBlue','https://logo.clearbit.com/jetblue.com');
logos.set('American Airlines','https://logo.clearbit.com/aa.com');
logos.set('Delta Air Lines','https://logo.clearbit.com/delta.com');
logos.set('Charter Communications','https://logo.clearbit.com/charter.com');
logos.set('New York Life Insurance','https://logo.clearbit.com/newyorklife.com');
logos.set('American Express','https://logo.clearbit.com/americanexpress.com');
logos.set('Nationwide','https://logo.clearbit.com/nationwide.com');
logos.set('Best Buy','https://logo.clearbit.com/bestbuy.com');
logos.set('Liberty Mutual Insurance Group','https://logo.clearbit.com/libertymutual.com');
logos.set('Merck','https://logo.clearbit.com/merck.com');
logos.set('Honeywell International','https://logo.clearbit.com/honeywell.com');
logos.set('United','https://logo.clearbit.com/united.com');
logos.set('TIAA','https://logo.clearbit.com/tiaa.org');
logos.set('Instacart','https://logo.clearbit.com/instacart.com');
logos.set('Oracle','https://logo.clearbit.com/oracle.com');
logos.set('Allstate','https://logo.clearbit.com/allstate.com');
logos.set('Lenovo','https://logo.clearbit.com/lenovo.com');
logos.set('Whole Foods','https://logo.clearbit.com/wholefoods.com');
logos.set('TJX','https://logo.clearbit.com/tjx.com');
logos.set('Reliance','https://logo.clearbit.com/ril.com');
logos.set('John Deere','https://logo.clearbit.com/johndeere.com');
logos.set('Burger King','https://logo.clearbit.com/burgerking.com');
logos.set('UBS','https://logo.clearbit.com/ubs.com');
logos.set('Nike','https://logo.clearbit.com/nike.com');
logos.set('Target','https://logo.clearbit.com/target.com');
logos.set('Jaguar','https://logo.clearbit.com/jaguar.com');
logos.set('Jeep','https://logo.clearbit.com/jeep.com');
logos.set('Mastercard','https://logo.clearbit.com/mastercard.com');
logos.set('3M','https://logo.clearbit.com/3m.com');
logos.set('AbbVie','https://logo.clearbit.com/abbvie.com');
logos.set('CHS','https://logo.clearbit.com/chsinc.com');
logos.set('Capital One Financial','https://logo.clearbit.com/capitalone.com');
logos.set('Progressive','https://logo.clearbit.com/progressive.com');
logos.set('Coca-Cola','https://logo.clearbit.com/coca-colacompany.com');


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
      output+="<td><span onclick='toggleMarker(this);' class='marker hide'>X</span><img width=128 src='"+logos.get(layout[ticketRow[i]-1])+"' onclick='toggleMarker(this);' ondblclick='hideMarker(this);'>"+"</td>";
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
