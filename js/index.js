const CHARACTERS = {
  'Player Men': {
    avatar: '🙎‍♂️'
  },
  'Player Women': {
    avatar: '🙎‍♀️️'
  },
  'Roboty': {
    avatar: '🤖'
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
      this.state = {...initialState, ...newState};

      // re-render the element with a given renderer callback
      cb(this.state, this.element);
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

function DOM_selectionScreen(show) {
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
  const itemElements = Object.keys(ITEMS).map(function (key) {
    const item = {...ITEMS[key], name: key};
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
  const spinner = document.querySelector('.loading-spinner');
  spinner.classList.add('hide');

  function computerPlays() {
    const number = Math.floor(Math.random() * (Object.keys(ITEMS).length));
    return {...ITEMS[Object.keys(ITEMS)[number]], name: Object.keys(ITEMS)[number]};
  }

  const PLAYER1 = modelFactory(null, document.querySelector('.main__player--1'));
  const PLAYER2 = modelFactory(playerFactory('Rival Computer', 'Roboty'), document.querySelector('.main__player--2'));

  // Render the selection screen
  DOM_selectionScreen(true);

  // Once one character is clicked we set the Player1 character
  document.querySelectorAll('.character').forEach(function (element) {
    element.addEventListener('click', function () {
      PLAYER1.setState({
        character: CHARACTERS[Object.keys(CHARACTERS)[Math.floor(Object.keys(CHARACTERS).length * Math.random())]],
        choice: {...ITEMS[element.querySelector('p').textContent], name: element.querySelector('p').textContent}
      }, function (state) {
        console.log(state);

        // Hide the Selection screen
        DOM_selectionScreen(false);

        document.querySelector('.main').classList.remove('hide');

        // Show the player 1
        DOM_fillPlayer(PLAYER1.state, PLAYER1.element);

        // the robot plays
        PLAYER2.setState({
          choice: computerPlays()
        }, function (state, element) {
          console.log('compute playing', state);
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
      })
    })
  });

}

window.document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    init();

    document.querySelector('.play-again').addEventListener('click', function() {
      window.location.reload()
    })
  }
};


