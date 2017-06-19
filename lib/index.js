'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _neataptic = require('neataptic');

var _trainingData = require('../trainingData.json');

var _trainingData2 = _interopRequireDefault(_trainingData);

var _rawData = require('../rawData.json');

var _rawData2 = _interopRequireDefault(_rawData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
query beltane{
  offers(
    states:{
      include:[FULFILLED]
    }
    first: 10000
  ){
    edges {
      node {
        pickup{
          dateRange{start end}
          address{location{lat lon}}
        }
        shipments{
          cargo{totalLoadingMeter}
          dateRange{start end}
          address{location{lat lon}}}
        pricing{result{carrierPrice}}
        carrier{id}
      }
    }
  }
}
 */

var rpad = function rpad(str, padString, length) {
  var out = str;
  while (out.length < length) {
    out += padString;
  }
  return out;
};

var lat2Dec = function lat2Dec(lat) {
  return parseFloat(lat - 90) / 180 * -1;
};
var lon2Dec = function lon2Dec(lon) {
  return parseFloat(lon - 180) / 360 * -1;
};

var date2Dec = function date2Dec(date) {
  return parseFloat(new Date(date).getTime() / 1000) / 10000000000;
};

var text2Bin = function text2Bin(string) {
  return rpad(string, '=', 20).split('').map(function (char) {
    return rpad(char.charCodeAt(0).toString(2), '0', 7);
  });
};

var bin2Text = function bin2Text(string) {
  return string.match(/.{1,7}/g).map(function (char) {
    return String.fromCharCode(parseInt(char, 2));
  }).join('');
};

var compId2Bin = function compId2Bin(compId) {
  return text2Bin(compId).join('');
};
var bin2CompId = function bin2CompId(bin) {
  return bin2Text(bin.map(function (o) {
    return o > 0.8 ? '1' : '0';
  }).join(''));
};

var node2input = function node2input(_ref) {
  var _ref$node = _ref.node,
      _ref$node$pickup = _ref$node.pickup,
      _ref$node$pickup$date = _ref$node$pickup.dateRange,
      pickupStart = _ref$node$pickup$date.start,
      pickupEnd = _ref$node$pickup$date.end,
      _ref$node$pickup$addr = _ref$node$pickup.address.location,
      pickupLat = _ref$node$pickup$addr.lat,
      pickupLon = _ref$node$pickup$addr.lon,
      _ref$node$shipments = _slicedToArray(_ref$node.shipments, 1),
      _ref$node$shipments$ = _ref$node$shipments[0],
      totalLoadingMeter = _ref$node$shipments$.cargo.totalLoadingMeter,
      _ref$node$shipments$$ = _ref$node$shipments$.dateRange,
      shipmentStart = _ref$node$shipments$$.start,
      shipmentEnd = _ref$node$shipments$$.end,
      _ref$node$shipments$$2 = _ref$node$shipments$.address.location,
      shipmentLat = _ref$node$shipments$$2.lat,
      shipmentLon = _ref$node$shipments$$2.lon,
      carrierPrice = _ref$node.pricing.result.carrierPrice;

  return [date2Dec(pickupStart), date2Dec(pickupEnd), lat2Dec(pickupLat), lon2Dec(pickupLon), parseFloat(totalLoadingMeter) / 20, date2Dec(shipmentStart), date2Dec(shipmentEnd), lat2Dec(shipmentLat), lon2Dec(shipmentLon), parseFloat(carrierPrice) / 1000000];
};

var node2output = function node2output(_ref2) {
  var carrierId = _ref2.node.carrier.id;
  return compId2Bin(carrierId).split('').map(function (c) {
    return parseInt(c, 2);
  });
};

var node2Training = function node2Training(props) {
  return {
    input: node2input(props),
    output: node2output(props)
  };
};

var myTrainingSet = _trainingData2.default.data.offers.edges.map(node2Training);

var myNetwork = _neataptic.Architect.Perceptron(10, 280, 280, 280, 280, 280, 140);

// myNetwork.train(myTrainingSet, {
//   log: 10,
//   error: 0.1,
//   iterations: 1000,
//   rate: 0.5,
// });

myNetwork.evolve(myTrainingSet, {
  mutation: _neataptic.Methods.Mutation.FFW,
  equal: true,
  popsize: 100,
  elitism: 10,
  log: 10,
  error: 0.003,
  iterations: 10000,
  mutationRate: 0.5
});

_rawData2.default.data.offers.edges.map(function (d) {
  return console.log(d.node.id, bin2CompId(myNetwork.activate(node2input(d))));
});

// console.log(bin2CompId(myNetwork.activate(

// ).join('')));
// console.log(myNetwork.activate([0, 1])[0] * 100);
// console.log(myNetwork.activate([1, 0])[0] * 100);
// console.log(myNetwork.activate([1, 1])[0] * 100);
// console.log(myNetwork.activate([1, 1])[0] * 100);
// console.log(myNetwork.activate([1, 1])[0] * 100);
// console.log(myNetwork.activate([1, 0])[0] * 100);
// console.log(myNetwork.activate([1, 1])[0] * 100);
// console.log(myNetwork.activate([1, 0])[0] * 100);
// console.log(myNetwork.activate([1, 1])[0] * 100);
// console.log(myNetwork.activate([1, 1])[0] * 100);