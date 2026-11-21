'use strict';

class RailwayGame {
  constructor(root, config, index) {
    this.root = root;
    this.config = config;
    this.index = index;
  }

  start() {
    clearTimeout(this.timer);
    this.round = 0;
    this.locked = false;
    this.chosen = new Set();
    this.matched = new Set();
    this.flipped = [];
    const {type, rounds, items, pool} = this.config;
    if (type === 'pairs') {
      this.deck = shuffleGame(shuffleGame(items).slice(0, 3).flatMap((item, pair) => [
        {pair, text: item.answer}, {pair, text: item.text}
      ]));
      this.memory();
      return;
    }

    if (rounds) {
      this.rounds = (type === 'destinations' ? shuffleGame(rounds).slice(0, 3) : rounds)
        .map(round => ({
          prompt: type === 'destinations' ? 'Where does this ticket go?' : round.prompt,
          detail: type === 'destinations' ? round.prompt : '',
          answers: round.answers || [round.answer],
          options: shuffleGame(round.options)
        }));
    } else {
      this.rounds = shuffleGame(items).slice(0, 3).map(item => this.itemRound(item, type, pool));
    }
    this.draw();
  }

  itemRound(item, type, pool) {
    if (type === 'bubbles') {
      const targets = new Set(pool.filter(entry => entry.answer === item.answer).map(entry => entry.text));
      const other = [...new Set(pool.map(entry => entry.text).filter(text => !targets.has(text)))];
      return {
        prompt: `Pop a ${item.answer.toLowerCase()} cloud!`,
        answers: [item.text],
        options: shuffleGame([item.text, ...shuffleGame(other).slice(0, 2)])
      };
    }
    if (type === 'sort-station') {
      return {
        prompt: 'Which cart gets this suitcase?',
        detail: item.text,
        answers: [item.answer ? 'Lunch cart' : 'Other stops'],
        options: ['Lunch cart', 'Other stops']
      };
    }
    return {
      prompt: type === 'palette' ? 'Pick a color to paint the panel.' : 'Pick the matching film frame.',
      detail: item.text,
      answers: [item.answer],
      options: shuffleGame([item.answer, ...shuffleGame(labels.filter(label => label !== item.answer)).slice(0, 2)])
    };
  }

  status(count, total) {
    return `<div class="arcade-meter" role="img" aria-label="${count} of ${total} complete">${Array.from({length: total}, (_, i) =>
      `<span aria-hidden="true" class="${i < count ? 'filled' : ''}">${i < count ? '★' : '☆'}</span>`).join('')}</div>`;
  }

  stage(prompt, detail, count, total, board) {
    return `<div class="arcade-scene" style="--scene:url('${arcadeArt(this.index)}')">
      ${this.status(count, total)}
      <span class="arcade-piece" aria-hidden="true">${gameIcons[this.index]}</span>
    </div>
    <div class="arcade-console">
      <h2 tabindex="-1">${escapeGame(prompt)}</h2>
      ${detail ? `<p class="arcade-ticket">${escapeGame(detail)}</p>` : ''}
      ${board}
      <div class="arcade-tools"><p class="arcade-feedback" role="status"></p><button class="arcade-listen" type="button">🔊 Read aloud</button></div>
    </div>`;
  }

  draw() {
    const current = this.rounds[this.round];
    const choices = current.options.map(option => typeof option === 'number' ? stops[option].name : option);
    this.root.innerHTML = this.stage(current.prompt, current.detail, this.round, this.rounds.length,
      `<div class="arcade-choices">${choices.map((choice, i) => `<button type="button" class="arcade-choice" data-choice="${i}">
        <span aria-hidden="true">${current.options[i] === 'Other stops' ? '🚉' : gameIcons[this.index]}</span>
        ${escapeGame(choice)}
      </button>`).join('')}</div>`);
    this.root.querySelectorAll('[data-choice]').forEach(button => {
      button.onclick = () => this.pick(button, current);
    });
    this.listen([current.prompt, current.detail, ...choices]);
    this.focus();
  }

  pick(button, current) {
    const option = current.options[Number(button.dataset.choice)];
    if (this.locked || this.chosen.has(option)) return;
    if (!current.answers.includes(option)) {
      button.classList.add('try-again');
      this.feedback('Try another one!');
      return;
    }
    this.chosen.add(option);
    button.classList.add('is-right');
    button.setAttribute('aria-disabled', 'true');
    stationBell();
    if (this.chosen.size < current.answers.length) {
      this.feedback('Nice! Find one more.');
      return;
    }

    this.locked = true;
    this.root.querySelector('.arcade-meter').outerHTML = this.status(this.round + 1, this.rounds.length);
    const piece = this.root.querySelector('.arcade-piece');
    const rewards = ['✓', '🚂', '💥', '🛑', '🛒', '🎵', '⭐', '🖼️', '🛤️', '🌉', '🎞️', '🚉'];
    const messages = ['Ticket punched!', 'Car loaded!', 'Pop!', 'Safe stop!', 'Suitcase loaded!', 'Bell rung!', 'A pair!', 'Panel painted!', 'Tracks connected!', 'Bridge fixed!', 'Frame filled!', 'Ticket delivered!'];
    piece.textContent = rewards[this.index];
    piece.classList.add('arcade-pop');
    this.feedback('★ ' + messages[this.index]);
    this.wait(() => {
      this.round++;
      if (this.round === this.rounds.length) {
        this.finish();
        return;
      }
      this.chosen.clear();
      this.draw();
    });
  }

  memory() {
    this.root.innerHTML = this.stage('Flip two tickets to find a pair.', 'Match a FALCON word to what it looks like in the library.', this.matched.size, 3,
      `<div class="arcade-memory">${this.deck.map((card, i) => {
        const matched = this.matched.has(card.pair);
        const open = matched || this.flipped.includes(i);
        return `<button type="button" class="arcade-choice memory-tile ${open ? 'is-open' : ''} ${matched ? 'is-right' : ''}" data-card="${i}" ${matched ? 'disabled' : ''}
          aria-label="${open ? escapeGame(card.text) : 'Flip ticket ' + (i + 1)}">
          ${open ? escapeGame(card.text) : '<span aria-hidden="true">🎟️</span>'}
        </button>`;
      }).join('')}</div>`);
    this.root.querySelectorAll('[data-card]').forEach(button => {
      button.onclick = () => this.flip(Number(button.dataset.card));
    });
    this.listen(['Flip two tickets to find a pair. Match a FALCON word to a library expectation.',
      ...this.deck.filter((_, i) => this.flipped.includes(i)).map(card => card.text)]);
    if (!this.flipped.length && !this.matched.size) this.focus();
  }

  flip(index) {
    if (this.locked || this.flipped.includes(index) || this.matched.has(this.deck[index].pair)) return;
    this.flipped.push(index);
    this.memory();
    this.root.querySelector(`[data-card="${index}"]`).focus({preventScroll:true});
    if (this.flipped.length < 2) return;

    this.locked = true;
    const [first, second] = this.flipped.map(i => this.deck[i]);
    const match = first.pair === second.pair;
    this.feedback(match ? '★ A pair!' : 'Try two more.');
    if (match) stationBell();
    this.wait(() => {
      if (match) this.matched.add(first.pair);
      if (this.matched.size === 3) {
        this.finish();
        return;
      }
      this.flipped = [];
      this.memory();
      this.root.querySelector('[data-card]:not(:disabled)').focus({preventScroll:true});
    });
  }

  wait(action) {
    this.timer = setTimeout(() => {
      if (!this.root.isConnected) return;
      this.locked = false;
      window.speechSynthesis?.cancel();
      stationNarrating = false;
      action();
    }, 1250);
  }

  feedback(text) {
    this.root.querySelector('.arcade-feedback').textContent = text;
  }

  focus() {
    const heading = this.root.querySelector('h2');
    heading.focus({preventScroll:true});
    if (heading.getBoundingClientRect().top < 0) heading.scrollIntoView({block:'start'});
  }

  listen(lines) {
    const button = this.root.querySelector('.arcade-listen');
    if (!('speechSynthesis' in window)) {
      button.hidden = true;
      return;
    }
    button.onclick = () => {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lines.filter(Boolean).join('. '));
      utterance.rate = .8;
      stationNarrating = true;
      utterance.onend = utterance.onerror = () => { stationNarrating = false; };
      speechSynthesis.speak(utterance);
    };
  }

  finish() {
    earnStamp(this.config.id);
    this.root.innerHTML = `<div class="arcade-win"><span aria-hidden="true">🏆</span>
      <h2 tabindex="-1">You earned a stamp!</h2>
      <p>${passportCount()} of 12 passport stamps</p>
      <div class="arcade-win-actions"><a class="arcade-button" href="#games">Pick another game</a>
      <button class="arcade-listen replay" type="button">Play again</button></div>
    </div>`;
    this.root.querySelector('.replay').onclick = () => this.start();
    this.focus();
  }
}
