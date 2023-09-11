function newElement(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

class Barrier {
  constructor(reverse = false) {
    this.element = newElement('div', 'barrier');

    const border = newElement('div', 'border');
    const body = newElement('div', 'body');
    this.element.appendChild(reverse ? body : border);
    this.element.appendChild(reverse ? border : body);

    this.setHeight = height => body.style.height = `${height}px`;
  }
}

class PairOfBarriers {
  constructor(height, opening, x) {
    this.element = newElement('div', 'pair-of-barriers');

    this.upper = new Barrier(true);
    this.lower = new Barrier(false);

    this.element.appendChild(this.upper.element);
    this.element.appendChild(this.lower.element);

    this.randomizeOpening = () => {
      const upperHeight = Math.random() * (height - opening);
      const lowerHeight = height - opening - upperHeight;
      this.upper.setHeight(upperHeight);
      this.lower.setHeight(lowerHeight);
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0]);
    this.setX = x => this.element.style.left = `${x}px`;
    this.getWidth = () => this.element.clientWidth;

    this.randomizeOpening();
    this.setX(x);
  }
}

class Barriers {
  constructor(height, width, opening, space, notifyPoint) {
    this.pairs = [
      new PairOfBarriers(height, opening, width),
      new PairOfBarriers(height, opening, width + space),
      new PairOfBarriers(height, opening, width + space * 2),
      new PairOfBarriers(height, opening, width + space * 3)
    ];

    const displacement = 3;
    this.animate = () => {
      this.pairs.forEach(pair => {
        pair.setX(pair.getX() - displacement);

        if (pair.getX() < -pair.getWidth()) {
          pair.setX(pair.getX() + space * this.pairs.length);
          pair.randomizeOpening();
        }

        const middle = width / 2;
        const crossedMiddle = pair.getX() + displacement >= middle
          && pair.getX() < middle;
        if (crossedMiddle) notifyPoint();
      });
    }
  }
}

class Yoda {
  constructor(gameHeight) {
    let flying = false;

    this.element = newElement('img', 'baby-yoda');
    this.element.src = 'img/Yoda.png';

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
    this.setY = y => this.element.style.bottom = `${y}px`;

    window.onkeydown = e => flying = true;
    window.onkeyup = e => flying = false;

    this.animate = () => {
      const newY = this.getY() + (flying ? 8 : -5);
      const maxHeight = gameHeight - this.element.clientHeight;

      if (newY <= 0) {
        this.setY(0);
      } else if (newY >= maxHeight) {
        this.setY(maxHeight);
      } else {
        this.setY(newY);
      }
    }

    this.setY(gameHeight / 2);
  }
}

class Progress {
  constructor() {
    this.element = newElement('span', 'progress');
    this.updatePoints = points => {
      this.element.innerHTML = points;
    }
    this.updatePoints(0);
  }
}

function areOverlapping(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;

  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

  return horizontal && vertical;
}

function collided(yoda, barriers) {
  let collided = false;
  barriers.pairs.forEach(PairOfBarriers => {
    if (!collided) {
      const upper = PairOfBarriers.upper.element;
      const lower = PairOfBarriers.lower.element;
      collided = areOverlapping(yoda.element, upper)
        || areOverlapping(yoda.element, lower);
    }
  });
  return collided;
}

function FlappyYoda() {
  let points = 0;

  const gameArea = document.querySelector('[wm-flappy]');
  const height = gameArea.clientHeight;
  const width = gameArea.clientWidth;

  const progress = new Progress();

  const barriers = new Barriers(height, width, 200, 400,
    () => progress.updatePoints(++points));

  const yoda = new Yoda(height);
  gameArea.appendChild(progress.element);
  gameArea.appendChild(yoda.element);
  barriers.pairs.forEach(pair => gameArea.appendChild(pair.element));

  const timer = setInterval(() => {
    barriers.animate();
    yoda.animate();

    if (collided(yoda, barriers)) {
      clearInterval(timer);
    }
  }, 20);
}
new FlappyYoda().start;