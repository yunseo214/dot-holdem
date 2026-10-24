const SUITS = [
  { key: 'spades', symbol: '♠', color: 'black' },
  { key: 'hearts', symbol: '♥', color: 'red' },
  { key: 'diamonds', symbol: '♦', color: 'red' },
  { key: 'clubs', symbol: '♣', color: 'black' },
];
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const RANK_NAMES = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
const DIFFICULTIES = {
  easy: { premiumChance: 0.08, foldChance: 0.48 },
  medium: { premiumChance: 0.35, foldChance: 0.32 },
  hard: { premiumChance: 0.72, foldChance: 0.18 },
  expert: { premiumChance: 0.94, foldChance: 0.07 },
};
const HAND_NAMES = [
  '하이 카드', '원 페어', '투 페어', '트리플', '스트레이트',
  '플러시', '풀하우스', '포카드', '스트레이트 플러시',
];

const playerHandElement = document.querySelector('#player-hand');
const opponentHandElement = document.querySelector('#opponent-hand');
const communityElement = document.querySelector('#community-cards');
const potElement = document.querySelector('#pot');
const playerStackElement = document.querySelector('#player-stack');
const opponentStackElement = document.querySelector('#opponent-stack');
const playerHandLabel = document.querySelector('#player-hand-label');
const opponentStatus = document.querySelector('#opponent-status');
const gameMessage = document.querySelector('#game-message');
const roundLabel = document.querySelector('#round-label');
const streetHint = document.querySelector('#street-hint');
const toast = document.querySelector('#toast');
const foldButton = document.querySelector('#fold-button');
const callButton = document.querySelector('#call-button');
const raiseButton = document.querySelector('#raise-button');
const dealButton = document.querySelector('#deal-button');
const difficultySelect = document.querySelector('#difficulty');
const tutorialOverlay = document.querySelector('#tutorial-overlay');
const tutorialOpenButton = document.querySelector('#tutorial-open');
const tutorialStartButton = document.querySelector('#tutorial-start');
const celebrationLayer = document.querySelector('#celebration-layer');
const performanceOverlay = document.querySelector('#performance-overlay');
const countdownElement = document.querySelector('#show-countdown');
const straightFlushRank = document.querySelector('#straight-flush-rank');

function closeTutorial() {
  tutorialOverlay.hidden = true;
  updateControls();
}

function openTutorial() {
  tutorialOverlay.hidden = false;
  updateControls();
  tutorialStartButton.focus();
}

function activateStraightFlushEasterEgg() {
    if (!active || performanceOverlay.classList.contains('show')) return;
    const royalSpades = [
      { rank: 14, ...SUITS[0] },
      { rank: 13, ...SUITS[0] },
      { rank: 12, ...SUITS[0] },
      { rank: 11, ...SUITS[0] },
      { rank: 10, ...SUITS[0] },
    ];
    const royalRanks = new Set(royalSpades.map(({ rank }) => rank));
    const deck = shuffle(createDeck().filter((card) => !(card.key === 'spades' && royalRanks.has(card.rank))));
    opponentCards = [deck.pop(), deck.pop()];
    playerCards = royalSpades.slice(0, 2);
    communityCards = [...royalSpades.slice(2), deck.pop(), deck.pop()];
    stage = 'river';
    showdownRevealed = false;
    playerHandLabel.textContent = 'ROYAL FLUSH READY';
    opponentStatus.textContent = 'THINKING…';
    streetHint.textContent = '리버 · 공용 카드 5장 공개';
    gameMessage.textContent = '스페이드 로열 플러시 패를 준비했어요. 체크 또는 레이즈로 승부를 진행하세요.';
    render();
    updateControls();
}

function showLossEffect() {
    clearCelebrationEffects();
    const debris = [
      '<svg viewBox="0 0 48 64" aria-hidden="true"><path d="M17 5h14v8l5 5-3 7 5 7-7 8-3 17H15l-2-17-5-7 5-8-2-8 6-5Z" fill="white" stroke="black" stroke-width="3"/><path d="m17 13 12 3-5 8 9 4-10 8 7 7M13 34l10-5-5 12 8 5" fill="none" stroke="black" stroke-width="2"/><path d="M18 4h12v6H18z" fill="white" stroke="black" stroke-width="2"/></svg>',
      '<svg viewBox="0 0 60 52" aria-hidden="true"><path d="M29 29c-8-1-12-9-22-8 1 13 7 22 18 24l-3 5h7l2-5c12-2 19-12 20-25-10 0-14 8-22 9Z" fill="white" stroke="black" stroke-width="3"/><path d="M29 29 24 8l6 8 7-12-2 24M29 29l-9 8m9-8 12 8" fill="none" stroke="black" stroke-width="3"/><path d="m8 21 10 5m32-5-10 5M25 46l-5 4m13-4 5 4" fill="none" stroke="black" stroke-width="2"/></svg>',
      '<svg viewBox="0 0 56 58" aria-hidden="true"><path d="M28 15c-8-8-21-3-22 10-2 14 7 27 19 27 5 0 7-3 11-3 8 0 14-13 13-25-1-12-13-17-21-9Z" fill="white" stroke="black" stroke-width="3"/><path d="M28 15c2-7 1-10-2-13m1 9 9-5" fill="none" stroke="black" stroke-width="3"/><path d="M45 17c7 3 8 10 3 13-4 2-8 0-10-3 1-5 3-8 7-10Z" fill="white" stroke="black" stroke-width="2"/><path d="M11 31h5m24 11h5" stroke="black" stroke-width="2"/></svg>',
      '<svg viewBox="0 0 56 56" aria-hidden="true"><path d="m10 12 11 3 6-7 8 8 11-3-2 13 6 7-9 6-1 10-13-4-10 5-3-11-9-7 7-8Z" fill="white" stroke="black" stroke-width="3"/><path d="m13 15 10 9 5-16m7 8-3 13 13-8m-23 9 10-3 9 15m-21-7 10-8" fill="none" stroke="black" stroke-width="2"/></svg>',
    ];
    ['left', 'right'].forEach((side, sideIndex) => {
      for (let index = 0; index < 10; index += 1) {
        const scrap = document.createElement('span');
        const kind = Math.floor(Math.random() * debris.length);
        scrap.className = `flying-scrap scrap-${side} debris-${kind}`;
        scrap.innerHTML = debris[kind];
        scrap.style.setProperty('--scrap-y', `${12 + Math.random() * 76}%`);
        scrap.style.setProperty('--scrap-delay', `${Math.random() * 950}ms`);
        scrap.style.setProperty('--scrap-duration', `${1050 + Math.random() * 1350}ms`);
        scrap.style.setProperty('--scrap-rotate', `${Math.random() * 720 - 360}deg`);
        scrap.style.setProperty('--scrap-drift', `${Math.random() * 180 - 90}px`);
        const direction = side === 'left' ? 1 : -1;
        scrap.style.setProperty('--scrap-distance', `${direction * (28 + Math.random() * 39)}vw`);
        celebrationLayer.append(scrap);
      }
    });
    effectTimer = window.setTimeout(() => celebrationLayer.replaceChildren(), 3500);
}

function showFireworks() {
    clearCelebrationEffects();
    [[15, 35], [82, 29], [28, 70], [72, 66], [50, 23]].forEach(([left, top], burstIndex) => {
      const burst = document.createElement('span');
      burst.className = 'firework-burst';
      burst.style.setProperty('--burst-x', `${left}%`);
      burst.style.setProperty('--burst-y', `${top}%`);
      burst.style.setProperty('--burst-delay', `${burstIndex * 120}ms`);
      for (let ray = 0; ray < 12; ray += 1) {
        const spark = document.createElement('i');
        spark.style.setProperty('--ray', `${ray * 30}deg`);
        burst.append(spark);
      }
      celebrationLayer.append(burst);
    });
    effectTimer = window.setTimeout(() => celebrationLayer.replaceChildren(), 2100);
}

function showStraightFlushPerformance() {
    clearCelebrationEffects();
    window.clearTimeout(performanceTimer);
    window.clearInterval(countdownTimer);
    performanceOverlay.hidden = false;
    performanceOverlay.classList.remove('show');
    void performanceOverlay.offsetWidth;
    performanceOverlay.classList.add('show');
    const endAt = Date.now() + 10000;
    const updateCountdown = () => {
      countdownElement.textContent = String(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    };
    updateCountdown();
    countdownTimer = window.setInterval(updateCountdown, 250);
    performanceTimer = window.setTimeout(() => {
      endPerformance();
    }, 10000);
}

function endPerformance() {
  window.clearTimeout(performanceTimer);
  window.clearInterval(countdownTimer);
  performanceOverlay.classList.remove('show');
  performanceOverlay.hidden = true;
  celebrationLayer.replaceChildren();
}

function clearCelebrationEffects() {
    window.clearTimeout(effectTimer);
    celebrationLayer.replaceChildren();
    window.clearTimeout(performanceTimer);
    window.clearInterval(countdownTimer);
    performanceOverlay.classList.remove('show');
    performanceOverlay.hidden = true;
}

let playerStack = 1000;
let opponentStack = 1000;
let pot = 0;
let handNumber = 0;
let stage = 'done';
let playerCards = [];
let opponentCards = [];
let communityCards = [];
let playerStreetBet = 0;
let opponentStreetBet = 0;
let active = false;
let showdownRevealed = false;
let performanceTimer;
let countdownTimer;
let effectTimer;

function createDeck() {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, ...suit })));
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function rankLabel(rank) {
  return RANK_NAMES[rank] || String(rank);
}

function preflopScore(cards) {
  const [first, second] = cards;
  const high = Math.max(first.rank, second.rank);
  const low = Math.min(first.rank, second.rank);
  const pairBonus = first.rank === second.rank ? 12 + high * 1.3 : 0;
  const suitedBonus = first.key === second.key ? 3 : 0;
  const connectorBonus = high - low === 1 ? 2.5 : high - low === 2 ? 1 : 0;
  const aceBonus = high === 14 ? 2 : 0;
  return pairBonus + suitedBonus + connectorBonus + aceBonus + high + low * 0.45;
}

function dealAiHand(deck) {
  const { premiumChance } = DIFFICULTIES[difficultySelect.value];
  const combinations = [];
  for (let first = 0; first < deck.length; first += 1) {
    for (let second = first + 1; second < deck.length; second += 1) {
      combinations.push([deck[first], deck[second]]);
    }
  }
  const premium = combinations.filter((cards) => preflopScore(cards) >= 23);
  let chosen;
  if (Math.random() < premiumChance) {
    chosen = premium[Math.floor(Math.random() * premium.length)];
  } else {
    chosen = combinations[Math.floor(Math.random() * combinations.length)];
  }
  const selected = new Set(chosen);
  const remainder = deck.filter((card) => !selected.has(card));
  return { hand: chosen, deck: remainder };
}

function startHand() {
  clearCelebrationEffects();
  if (playerStack <= 0 || opponentStack <= 0) {
    playerStack = 1000;
    opponentStack = 1000;
    handNumber = 0;
  }
  handNumber += 1;
  let deck = shuffle(createDeck());
  const aiDeal = dealAiHand(deck);
  opponentCards = aiDeal.hand;
  deck = aiDeal.deck;
  playerCards = [deck.pop(), deck.pop()];
  communityCards = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];
  pot = 0;
  playerStreetBet = 0;
  opponentStreetBet = 0;
  showdownRevealed = false;
  stage = 'preflop';
  active = true;
  postBlind('player', 10);
  postBlind('opponent', 20);
  playerHandLabel.textContent = 'GOOD LUCK!';
  opponentStatus.textContent = 'THINKING…';
  gameMessage.textContent = '홀 카드를 확인하세요. 콜, 레이즈 또는 폴드를 선택하세요.';
  streetHint.textContent = '프리플랍 · 홀 카드 2장';
  dealButton.hidden = true;
  foldButton.hidden = false;
  callButton.hidden = false;
  raiseButton.hidden = false;
  render();
  updateControls();
}

function postBlind(who, amount) {
  const isPlayer = who === 'player';
  const stack = isPlayer ? playerStack : opponentStack;
  const paid = Math.min(stack, amount);
  if (isPlayer) {
    playerStack -= paid;
    playerStreetBet = paid;
  } else {
    opponentStack -= paid;
    opponentStreetBet = paid;
  }
  pot += paid;
}

function render() {
  playerStackElement.textContent = playerStack.toLocaleString();
  opponentStackElement.textContent = opponentStack.toLocaleString();
  potElement.textContent = pot.toLocaleString();
  roundLabel.innerHTML = `HAND ${String(handNumber).padStart(2, '0')} <b>·</b> ${stage.toUpperCase()}`;
  renderCards(playerHandElement, playerCards, true);
  renderCards(opponentHandElement, opponentCards, showdownRevealed);
  renderCommunity();
}

function renderCards(container, cards, reveal) {
  container.replaceChildren();
  if (!reveal) {
    for (let index = 0; index < 2; index += 1) {
      const card = document.createElement('div');
      card.className = 'card back';
      card.innerHTML = '<span>?</span>';
      container.append(card);
    }
    return;
  }
  cards.forEach((card) => container.append(makeCard(card)));
}

function renderCommunity() {
  communityElement.replaceChildren();
  const revealed = stage === 'preflop'
    ? []
    : stage === 'done'
      ? (showdownRevealed ? communityCards : [])
      : communityCards.slice(0, stage === 'flop' ? 3 : stage === 'turn' ? 4 : 5);
  for (let index = 0; index < 5; index += 1) {
    const card = revealed[index];
    if (card) {
      communityElement.append(makeCard(card));
    } else {
      const empty = document.createElement('div');
      empty.className = 'card empty';
      communityElement.append(empty);
    }
  }
}

function makeCard(card) {
  const element = document.createElement('div');
  element.className = `card ${card.color}`;
  element.setAttribute('aria-label', `${rankLabel(card.rank)} ${card.symbol}`);
  element.innerHTML = `<span class="card-rank">${rankLabel(card.rank)}</span><span class="card-suit">${card.symbol}</span><span class="card-corner">${rankLabel(card.rank)}</span>`;
  return element;
}

function toCall() {
  return Math.max(0, opponentStreetBet - playerStreetBet);
}

function updateControls() {
  const callAmount = toCall();
  callButton.textContent = callAmount > 0 ? `콜 ${callAmount}` : '체크';
  raiseButton.textContent = `레이즈 +40`;
  callButton.disabled = !active || (callAmount > 0 && playerStack === 0);
  const tutorialOpen = !tutorialOverlay.hidden;
  raiseButton.disabled = !active || playerStack <= callAmount || tutorialOpen;
  raiseButton.classList.toggle('is-locked', tutorialOpen && active && playerStack > callAmount);
  if (raiseButton.classList.contains('is-locked')) {
    raiseButton.setAttribute('aria-label', '잠김: 튜토리얼을 닫으면 레이즈 가능');
  } else {
    raiseButton.removeAttribute('aria-label');
  }
  foldButton.disabled = !active;
}

function handleCall() {
  if (!active) return;
  const amount = Math.min(toCall(), playerStack);
  playerStack -= amount;
  playerStreetBet += amount;
  pot += amount;
  if (amount > 0) {
    gameMessage.textContent = `콜 ${amount}. 다음 카드로 이동합니다.`;
    opponentStatus.textContent = 'CALL';
  } else {
    gameMessage.textContent = '체크. 상대도 체크합니다.';
    opponentStatus.textContent = 'CHECK';
  }
  advanceStreet();
}

function handleRaise() {
  if (!active) return;
  const callAmount = toCall();
  const targetBet = opponentStreetBet + 40;
  const amount = Math.min(targetBet - playerStreetBet, playerStack);
  if (amount <= callAmount) return;
  playerStack -= amount;
  playerStreetBet += amount;
  pot += amount;
  const strength = evaluateBest([...opponentCards, ...visibleCommunity()]).score[0];
  const { foldChance } = DIFFICULTIES[difficultySelect.value];
  const strengthModifier = Math.max(0, strength - 1) * 0.12;
  const folds = strength < 2 && Math.random() < foldChance - strengthModifier;
  if (folds) {
    opponentStatus.textContent = 'FOLDED';
    gameMessage.textContent = '상대가 폴드했습니다. 팟을 가져갑니다!';
    const playerHasStraightFlush = evaluateBest([...playerCards, ...visibleCommunity()]).score[0] === 8;
    finishHand('player', '상대 폴드', playerHasStraightFlush);
    return;
  }
  const aiCall = Math.min(Math.max(0, playerStreetBet - opponentStreetBet), opponentStack);
  opponentStack -= aiCall;
  opponentStreetBet += aiCall;
  pot += aiCall;
  opponentStatus.textContent = 'CALL';
  gameMessage.textContent = `상대가 ${aiCall} 칩을 콜했습니다.`;
  advanceStreet();
}

function handleFold() {
  if (!active) return;
  opponentStatus.textContent = 'WINS';
  gameMessage.textContent = '폴드했습니다. 다음 판에서 다시 도전하세요.';
  finishHand('opponent', '플레이어 폴드');
}

function visibleCommunity() {
  if (stage === 'preflop') return [];
  if (stage === 'flop') return communityCards.slice(0, 3);
  if (stage === 'turn') return communityCards.slice(0, 4);
  return communityCards.slice(0, 5);
}

function advanceStreet() {
  if (playerStack === 0 || opponentStack === 0) {
    stage = 'river';
    showdown();
    return;
  }
  if (stage === 'preflop') stage = 'flop';
  else if (stage === 'flop') stage = 'turn';
  else if (stage === 'turn') stage = 'river';
  else {
    showdown();
    return;
  }
  playerStreetBet = 0;
  opponentStreetBet = 0;
  const hints = {
    flop: '플랍 · 공용 카드 3장 공개',
    turn: '턴 · 네 번째 공용 카드',
    river: '리버 · 마지막 공용 카드',
  };
  streetHint.textContent = hints[stage];
  opponentStatus.textContent = 'CHECK';
  gameMessage.textContent = `${hints[stage]} · 체크, 레이즈 또는 폴드를 선택하세요.`;
  render();
  updateControls();
}

function showdown() {
  const playerResult = evaluateBest([...playerCards, ...communityCards]);
  const opponentResult = evaluateBest([...opponentCards, ...communityCards]);
  const comparison = compareScores(playerResult.score, opponentResult.score);
  showdownRevealed = true;
  render();
  playerHandLabel.textContent = HAND_NAMES[playerResult.score[0]];
  opponentStatus.textContent = HAND_NAMES[opponentResult.score[0]].toUpperCase();
  streetHint.textContent = `${HAND_NAMES[playerResult.score[0]]} vs ${HAND_NAMES[opponentResult.score[0]]}`;
  if (comparison > 0) {
    gameMessage.textContent = `승리! ${HAND_NAMES[playerResult.score[0]]} · 팟 ${pot} 칩 획득`;
    finishHand('player', '승리!', playerResult.score[0] === 8);
  } else if (comparison < 0) {
    gameMessage.textContent = `상대 승리 · ${HAND_NAMES[opponentResult.score[0]]}`;
    finishHand('opponent', '상대 승리');
  } else {
    const split = Math.floor(pot / 2);
    playerStack += split;
    opponentStack += pot - split;
    pot = 0;
    completeHand('무승부 · 팟 분할');
    if (playerResult.score[0] === 8) showStraightFlushPerformance();
  }
}

function finishHand(winner, announcement, isStraightFlush = false) {
  if (winner === 'player') playerStack += pot;
  else opponentStack += pot;
  pot = 0;
  completeHand(announcement);
  if (winner === 'player') {
    if (isStraightFlush) showStraightFlushPerformance();
    else showFireworks();
  } else {
    showLossEffect();
  }
}

function completeHand(announcement) {
  active = false;
  stage = 'done';
  render();
  foldButton.hidden = true;
  callButton.hidden = true;
  raiseButton.hidden = true;
  dealButton.hidden = false;
  if (playerStack === 0 || opponentStack === 0) {
    dealButton.textContent = '새 매치';
    gameMessage.textContent = playerStack === 0 ? '칩을 모두 잃었습니다. 새 매치를 시작해보세요.' : '상대의 칩이 바닥났습니다! 새 매치를 시작하세요.';
  } else {
    dealButton.textContent = '다음 판';
  }
  showToast(announcement);
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
}

function evaluateBest(cards) {
  let best = null;
  for (let a = 0; a < cards.length - 4; a += 1) {
    for (let b = a + 1; b < cards.length - 3; b += 1) {
      for (let c = b + 1; c < cards.length - 2; c += 1) {
        for (let d = c + 1; d < cards.length - 1; d += 1) {
          for (let e = d + 1; e < cards.length; e += 1) {
            const score = evaluateFive([cards[a], cards[b], cards[c], cards[d], cards[e]]);
            if (!best || compareScores(score, best) > 0) best = score;
          }
        }
      }
    }
  }
  return { score: best };
}

function evaluateFive(cards) {
  const counts = new Map();
  cards.forEach(({ rank }) => counts.set(rank, (counts.get(rank) || 0) + 1));
  const groups = [...counts].sort((first, second) => second[1] - first[1] || second[0] - first[0]);
  const unique = [...counts.keys()].sort((a, b) => b - a);
  const flush = cards.every((card) => card.key === cards[0].key);
  let straightHigh = 0;
  if (unique.length === 5) {
    if (unique[0] - unique[4] === 4) straightHigh = unique[0];
    else if (unique.join(',') === '14,5,4,3,2') straightHigh = 5;
  }
  if (flush && straightHigh) return [8, straightHigh];
  if (groups[0][1] === 4) return [7, groups[0][0], groups[1][0]];
  if (groups[0][1] === 3 && groups[1][1] === 2) return [6, groups[0][0], groups[1][0]];
  if (flush) return [5, ...unique];
  if (straightHigh) return [4, straightHigh];
  if (groups[0][1] === 3) return [3, groups[0][0], ...groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a)];
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const pairs = groups.slice(0, 2).map(([rank]) => rank).sort((a, b) => b - a);
    return [2, ...pairs, groups[2][0]];
  }
  if (groups[0][1] === 2) return [1, groups[0][0], ...groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a)];
  return [0, ...unique];
}

function compareScores(first, second) {
  for (let index = 0; index < Math.max(first.length, second.length); index += 1) {
    const difference = (first[index] || 0) - (second[index] || 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

callButton.addEventListener('click', handleCall);
raiseButton.addEventListener('click', handleRaise);
foldButton.addEventListener('click', handleFold);
dealButton.addEventListener('click', startHand);
straightFlushRank.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  activateStraightFlushEasterEgg();
});
straightFlushRank.addEventListener('auxclick', (event) => {
  if (event.button !== 1) return;
  event.preventDefault();
  activateStraightFlushEasterEgg();
});
straightFlushRank.addEventListener('click', () => {
  if (window.matchMedia('(pointer: coarse)').matches) activateStraightFlushEasterEgg();
});
performanceOverlay.addEventListener('click', endPerformance);
tutorialOpenButton.addEventListener('click', openTutorial);
tutorialStartButton.addEventListener('click', closeTutorial);
tutorialOverlay.addEventListener('click', (event) => {
  if (event.target === tutorialOverlay) closeTutorial();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !tutorialOverlay.hidden) closeTutorial();
});

startHand();
tutorialStartButton.focus();
