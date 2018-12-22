window.deck = [];
window.nCards = 2;
window.nextCardIdx = 0;
window.activeSpot = -1;

window.TP = 0;
window.TPav = 0.0;
window.FP = 0;
window.FN = 0;

window.lastDeal = null;

SUITS = ['banana', 'strawberry', 'lime', 'plum'];

/**
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
var shuffle = function (array) {
  // Force copy
  a = array.slice();
	var at = a.length;
	var tmp, randomIndex;
  while (0 !== at) {
		nxt = Math.floor(Math.random() * at);
		at -= 1;
	  tmp = a[at];
		a[at] = a[nxt];
		a[nxt] = tmp;
	}
	return a;
};

function removeOldClasses(elt) {
  for (var suit of SUITS) {
    elt.classList.remove(suit);
  }
  for (var count of [0, 1, 2, 3, 4, 5]) {
    elt.classList.remove('n' + count);
  }
  elt.classList.remove('active');
}

function dealCard() {
  checkForMatch(false);

  cards = document.querySelectorAll('#cards .card');
  cardElt = cards[window.activeSpot];

  nextCard = window.deck[window.nextCardIdx];
  window.nextCardIdx++;
  if (window.nextCardIdx >= window.deck.length) {
    window.nextCardIdx = 0;
    initDeck();
  }
  removeOldClasses(cardElt);
  cardElt.classList.add(nextCard[0]);
  cardElt.classList.add('n' + nextCard[1]);
  cardElt.details = nextCard;
  activateNextSpot();
  window.lastDeal = Date.now();
}

function hasMatch() {
  cards = document.querySelectorAll('#cards .card');
  sums = {};
  for (var suit of SUITS) {
    sums[suit] = 0;
  }

  for (var cardElt of cards) {
    details = cardElt.details;
    if (details[0] != '') {
      sums[details[0]] += details[1];
    }
  }
  return Object.values(sums).indexOf(5) > -1;
}

function clearCards() {
  for (var cardElt of document.querySelectorAll('#cards .card')) {
    removeOldClasses(cardElt);
    cardElt.classList.add('n0');
    cardElt.details = ['', -1];
  }
}

function updateTable() {
  document.getElementById('nTP').innerText = window.TP | 0;
  document.getElementById('nFP').innerText = window.FP | 0;
  document.getElementById('nFN').innerText = window.FN | 0;
  document.getElementById('tpAv').innerText = (window.TPav / 1000.0).toFixed(2) + 's';
}

function updateAverageTimes() {
  reaction = Date.now() - window.lastDeal;
  window.TPav = (window.TPav * window.TP + reaction) / (window.TP + 1);
}

function checkForMatch(active) {
  match = hasMatch();
  if (active) {
    if (match) {
      updateAverageTimes();
      clearCards();
      window.TP += 1;
      window.activeSpot = 0;
    } else {
      window.FP += 1;
    }
  } else {
    if (match) {
      window.FN += 1;
      clearCards();
    }
  }
  updateTable();
}

function handleKeyPress(e) {
  if (e.keyCode == 32) {
    checkForMatch(true);
  } else if (e.keyCode == 13) {
    dealCard();
  }
}

function addCard(empty) {
  cardsElt = document.getElementById('cards');
  cardElt = document.createElement('div');
  cardElt.className = 'card';
  cardElt.innerHTML =
    "<div class='cardInner'>" +
    "  <div class='pic p1'></div>" +
    "  <div class='pic p2'></div>" +
    "  <div class='midHolder'>" +
    "    <div class='pic p3'></div>" +
    "  </div>" +
    "  <div class='pic p4'></div>" +
    "  <div class='pic p5'></div>" +
    "</div>";
  cardsElt.appendChild(cardElt);

  if (empty) {
    cardElt.classList.add('n0');
    cardElt.details = ['', -1];
  } else {
    nextCard = window.deck[window.nextCardIdx];
    window.nextCardIdx++;
    if (window.nextCardIdx >= window.deck.length) {
      window.nextCardIdx = 0;
      initDeck();
    }
    cardElt.classList.add(nextCard[0]);
    cardElt.classList.add('n' + nextCard[1]);
    cardElt.details = nextCard;
  }
}

function removeCard() {
  cardsElt = document.getElementById('cards');
  cardsElt.removeChild(cardsElt.lastChild);
}

function updateNCards() {
  clearCards();
  initDeck();

  window.nCards = document.getElementById('nCards').value;
  document.getElementById('cards').className = 'cards' + nCards;
  document.getElementById('cardCount').innerText = nCards + ' cards';

  cardsIn = document.querySelectorAll('#cards .card').length;
  while (cardsIn < nCards) {
    addCard(true);
    cardsIn++;
  }
  while (cardsIn > nCards) {
    removeCard();
    cardsIn--;
  }

  window.TP = 0;
  window.TPav = 0.0;
  window.FP = 0;
  window.FN = 0;
  window.activeSpot = -1;
  activateNextSpot();
  updateTable();
}

function initDeck() {
  deck = []
  for (var suit of SUITS) {
    for (var number = 1; number <= 5; number++) {
      count = [0, 5, 3, 3, 2, 1][number];
      for (var nSame = 0; nSame < count; nSame++) {
        deck.push([suit, number])
      }
    }
  }
  window.deck = shuffle(deck);
}

function activateNextSpot() {
  cards = document.querySelectorAll('#cards .card');
  if (0 <= window.activeSpot && window.activeSpot < cards.length) {
    cards[window.activeSpot].classList.remove('active');
  }
  window.activeSpot = (window.activeSpot + 1) % cards.length;
  cards[window.activeSpot].classList.add('active');
}
