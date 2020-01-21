const CHARACTERS = {
  'Player Men': {
    avatar: '🙎‍♂️'
  },
  'Player Women': {
    avatar: '🙎‍♀️️'
  },
  'Roboty': {
    avatar: '🤖'
  },
  'Roboty2': {
    avatar: '👾'
  }
};

const ITEMS = {
  'paper': {
    avatar: '📄',
    wins: ['rock']
  }, 'rock': {
    avatar: '🗿',
    wins: ['scissors']
  }, 'scissors': {
    avatar: '✂️',
    wins: ['paper']
  }
};

const gameWinner = {
  PLAYER1: 'Player 1',
  PLAYER2: 'Player 2',
  DRAW: 'Draw'
}

function playerFactory(name, character) {
  return {
    name,
    character: CHARACTERS[character],
    choice: null
  }
}

function modelFactory(initialState, element) {
  return {
    state: initialState || {},
    element,
    // set a new State, and update the dom element manually once the state is changed
    setState(newState, cb) {
      // Merge both new and old state to replace whats new an keep whats old.
      this.state = {...this.state, ...newState};

      // re-render the element with a given renderer callback
      if (cb) cb(this.state, this.element);
    }
  }
}

//Checks whether player1 won over player2
function judgeWinner(play1, play2) {

  if (play1.name === play2.name ||
    play1.wins.includes(play2.name) && play2.wins.includes(play1.name)) {
    return gameWinner.DRAW;
  }

  let winner = play1.wins.includes(play2.name);

  if (winner) {
    return gameWinner.PLAYER1;
  } else if (!winner) {
    return gameWinner.PLAYER2;
  }

  return winner;
}

function DOM_fillPlayer(state, element) {
  const avatar = element.querySelector('.player__avatar');
  const item = element.querySelector('.player__item');
  const itemAvatar = document.createElement('h1');
  const itemName = document.createElement('p');

  avatar.textContent = state.character ? state.character.avatar : '';

  itemAvatar.textContent = state.choice ? state.choice.avatar : '';
  itemName.textContent = state.choice ? state.choice.name : '';

  item.appendChild(itemAvatar);
  item.appendChild(itemName);

}

function DOM_selectionScreen(show, choices, title) {
  const wrapper = document.querySelector('.player-selection');

  if (!show && !wrapper.classList.contains('hide')) {
    wrapper.classList.add('hide');
    return;
  }

  function renderItem(item) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('character');

    const avatar = document.createElement('h1');
    const name = document.createElement('p');

    avatar.textContent = item.avatar;
    name.textContent = item.name;

    wrapper.appendChild(avatar);
    wrapper.appendChild(name);

    return wrapper;
  }

  wrapper.classList.remove('hide');

  const elementsWrapper = document.querySelector('.player-selection__characters');
  // clean elements wrapper beforehand
  elementsWrapper.innerHTML = null;

  const selectionTitle = document.querySelector('.player-selection__title');
  selectionTitle.textContent = 'Select ' + (title || 'an Item') + ':';

  const itemElements = Object.keys(choices).map(function (key) {
    const item = {...choices[key], name: key};
    return renderItem(item);
  });

  itemElements.forEach((element) => {
    elementsWrapper.appendChild(element);
  })
}

function DOM_announceWinner(winner) {
  const wrapper = document.querySelector('.announcement');
  const title = wrapper.querySelector('h1');

  title.textContent = winner;
  wrapper.classList.remove('hide');
}

function init() {
  function computerPlays() {
    const number = Math.floor(Math.random() * (Object.keys(ITEMS).length));
    return {...ITEMS[Object.keys(ITEMS)[number]], name: Object.keys(ITEMS)[number]};
  }

  function startGame(PLAYER1, PLAYER2) {
    function player1Chooses() {
      return new Promise(function (resolve, reject) {
        // Render the selection screen
        if (PLAYER1.state.character.name !== 'Roboty') {
          DOM_selectionScreen(true, ITEMS, 'your choice');

          // Once one character is clicked we set the Player1 item
          document.querySelectorAll('.character').forEach(function (element) {
            element.addEventListener('click', function () {
              console.log('from choice: ', PLAYER1)
              PLAYER1.setState({
                choice: {...ITEMS[element.querySelector('p').textContent], name: element.querySelector('p').textContent}
              }, function (state) {

                // Hide the Selection screen
                DOM_selectionScreen(false);
                resolve();
                element.removeEventListener('click', this);
              })
            })
          });
        } else {
          // computers plays as roboty is a bot
          PLAYER1.setState({
            choice: computerPlays()
          });
          resolve();
        }
      })
    }

    player1Chooses().then(function () {
      document.querySelector('.main').classList.remove('hide');
      // renders the player 1
      DOM_fillPlayer(PLAYER1.state, PLAYER1.element);

      // the robot plays
      PLAYER2.setState({
        choice: computerPlays()
      }, function (state, element) {
        element.classList.remove('hide');
        // Show the player 2
        DOM_fillPlayer(state, element);
      });

      //evaluate who won
      switch (judgeWinner(PLAYER1.state.choice, PLAYER2.state.choice)) {
        case gameWinner.DRAW:
          DOM_announceWinner('No');
          break;

        case gameWinner.PLAYER1:
          DOM_announceWinner(PLAYER1.state.character.avatar);
          break;

        case gameWinner.PLAYER2:
          DOM_announceWinner(PLAYER2.state.character.avatar);
          break;
      }
    });
  }

  function selectCharacter(player) {
    const {Roboty2, ...characters} = CHARACTERS;

    DOM_selectionScreen(true, characters, 'your character');
    return new Promise(function (resolve, reject) {
        document.querySelectorAll('.character').forEach(function (element) {
          element.addEventListener('click', function () {
            player.setState({
              character: {
                ...CHARACTERS[element.querySelector('p').textContent],
                name: element.querySelector('p').textContent
              },
            }, function (state) {
              DOM_selectionScreen(false);
              resolve();
            });
          });
        });
      }
    );

  }

  const spinner = document.querySelector('.loading-spinner');
  spinner.classList.add('hide');


  const PLAYER1 = modelFactory(null, document.querySelector('.main__player--1'));
  const PLAYER2 = modelFactory(playerFactory('Rival Computer', 'Roboty2'), document.querySelector('.main__player--2'));

  // Select mode
  selectCharacter(PLAYER1).then(function () {
    console.log(PLAYER1);
    // init game with current config
    startGame(PLAYER1, PLAYER2);
  });

}

window.document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    init();

    document.querySelector('.play-again').addEventListener('click', function() {
      window.location.reload()
      // init();
    })
  }
};
