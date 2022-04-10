const cssTable = '<style> table { border: 2px solid red } table td { border: 1px solid blue } </style>';
const cssMarker = '<style>.marker { font-size: 108px; position: absolute; opacity: 1; margin-top: -15px; margin-left: -10px; } .show {display:block} .hide {display:none} </style>';
const markerFunctions = "<script>function toggleMarker(elem) { var span = elem.parentNode.children[0]; if (span.attributes.getNamedItem('class').value.indexOf('hide') > -1) {span.className='marker show';} else { if(confirm('Are you sure to unmark this picture?')){span.className='marker hide'; }}}</script>";
const wsFunctions = "<script>var HOST = location.origin.replace(/^http/, 'ws');var wss = new WebSocket(HOST);wss.onmessage = function (event) {  var msg = JSON.parse(event.data); if (!msg.ping && msg.boardId === boardId) {$('#nextPicture').html(msg.next);}}</script>";
const jQuery = "<script src='https://code.jquery.com/jquery-3.6.0.min.js'></script>";

module.exports = { cssTable, cssMarker, markerFunctions, wsFunctions, jQuery };