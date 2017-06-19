import { Architect, Methods } from 'neataptic';

import trainingData from '../trainingData.json';
import rawData from '../rawData.json';

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

const rpad = (str, padString, length) => {
  let out = str;
  while (out.length < length) {
    out += padString;
  }
  return out;
};

const lat2Dec = lat => (parseFloat(lat - 90) / 180) * -1;
const lon2Dec = lon => (parseFloat(lon - 180) / 360) * -1;

const date2Dec = date => parseFloat(new Date(date).getTime() / 1000) / 10000000000;

const text2Bin = string =>
  rpad(string, '=', 20).split('').map(char => rpad(char.charCodeAt(0).toString(2), '0', 7));

const bin2Text = string =>
  string.match(/.{1,7}/g).map(char => String.fromCharCode(parseInt(char, 2))).join('');

const compId2Bin = compId => text2Bin(compId).join('');
const bin2CompId = bin => bin2Text(bin.map(o => (o > 0.8 ? '1' : '0')).join(''));

const node2input = ({
  node: {
    pickup: {
      dateRange: {
        start: pickupStart,
        end: pickupEnd,
      },
      address: {
        location: {
          lat: pickupLat,
          lon: pickupLon,
        },
      },
    },
    shipments: [
      {
        cargo: {
          totalLoadingMeter,
        },
        dateRange: {
          start: shipmentStart,
          end: shipmentEnd,
        },
        address: {
          location: {
            lat: shipmentLat,
            lon: shipmentLon,
          },
        },
      },
    ],
    pricing: { result: { carrierPrice } },
  },
}) => [
  date2Dec(pickupStart),
  date2Dec(pickupEnd),
  lat2Dec(pickupLat),
  lon2Dec(pickupLon),
  parseFloat(totalLoadingMeter) / 20,
  date2Dec(shipmentStart),
  date2Dec(shipmentEnd),
  lat2Dec(shipmentLat),
  lon2Dec(shipmentLon),
  parseFloat(carrierPrice) / 1000000,
];

const node2output = ({ node: { carrier: { id: carrierId } } }) =>
  compId2Bin(carrierId).split('').map(c => parseInt(c, 2));

const node2Training = props => ({
  input: node2input(props),
  output: node2output(props),
});

const myTrainingSet = trainingData.data.offers.edges.map(node2Training);

const myNetwork =
  Architect.Perceptron(10, 280, 280, 280, 280, 280, 140);

// myNetwork.train(myTrainingSet, {
//   log: 10,
//   error: 0.1,
//   iterations: 1000,
//   rate: 0.5,
// });

myNetwork.evolve(myTrainingSet, {
  mutation: Methods.Mutation.FFW,
  equal: true,
  popsize: 100,
  elitism: 10,
  log: 10,
  error: 0.003,
  iterations: 10000,
  mutationRate: 0.5,
});

rawData.data.offers.edges.map(
  d => console.log(d.node.id, bin2CompId(myNetwork.activate(node2input(d)))));

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
