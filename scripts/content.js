const squareLetterToTransformMapWhiteBottom = {
  a: 0,
  b: 100,
  c: 200,
  d: 300,
  e: 400,
  f: 500,
  g: 600,
  h: 700
}
const squareNumberToTransformMapWhiteBottom = {
  8: 0,
  7: 100,
  6: 200,
  5: 300,
  4: 400,
  3: 500,
  2: 600,
  1: 700
}
const squareLetterToTransformMapBlackBottom = {
  a: 700,
  b: 600,
  c: 500,
  d: 400,
  e: 300,
  f: 200,
  g: 100,
  h: 0
}
const squareNumberToTransformMapBlackBottom = {
  8: 700,
  7: 600,
  6: 500,
  5: 400,
  4: 300,
  3: 200,
  2: 100,
  1: 0
}
// depending on white or black being bottom
let finalSquareLetterToTransformMap = null;
let finalSquareNumberToTransformMap = null;
const pieces = ['pawn', 'rook', 'bishop', 'knight', 'queen', 'king']
const pieceToUnicodeMap = {
  king: '\u265A',
  queen: '\u265B',
  rook: '\u265C',
  bishop: '\u265D',
  knight: '\u265E',
  null: '\u265F'
}
const highlightFontSize = getComputedStyle(document.querySelector('.piece')).width
const highlightFontSizeNumber = highlightFontSize.replace(/\D/g, '')
const highlightStyle = {
  position: 'absolute',
  height: '12.5%',
  width: '12.5%',
  left: '0',
  top: '0',
  fontSize: `${highlightFontSizeNumber / 4}px`,
}
const highlightElementId = 'customBestMoveHighlight'
const highlightElement = document.createElement('div')
highlightElement.id = highlightElementId
Object.assign(highlightElement.style, highlightStyle)
const boardElement = document.querySelector('.board')

let currentTurn = 0
// 1: 'knight', 5: 'bishop', ...
let bestMovePieces = new Map()
// 1: 'd6', 5: 'a2', ...
let bestMoveSquares = new Map()

document.addEventListener('keydown', (ev) => {
  if (ev.key === "ArrowLeft") {
    currentTurn--
    insertHighlightElement()
  }
  if (ev.key === "ArrowRight") {
    currentTurn++
    insertHighlightElement()
  }
})

setInterval(() => {
  const moveCounterElement = document.querySelector('.move-san-premove')
  if (!moveCounterElement) return

  if (!finalSquareLetterToTransformMap || !finalSquareNumberToTransformMap) {
    const whiteIsBottom = document.querySelector('.coordinates').childNodes[0].textContent === '8';
    finalSquareLetterToTransformMap = whiteIsBottom ? squareLetterToTransformMapWhiteBottom : squareLetterToTransformMapBlackBottom
    finalSquareNumberToTransformMap = whiteIsBottom ? squareNumberToTransformMapWhiteBottom : squareNumberToTransformMapBlackBottom
  }

  currentTurn = toMoveCounter(moveCounterElement.textContent)

  const bestMoveParentElement = document.querySelector('.move-san-highlight')
  if (!bestMoveParentElement) return
  const bestMoveSquareText = bestMoveParentElement.childNodes[0].textContent

  if (bestMoveSquareText !== '') {
    const finalBestMovePiece = null
    const finalBestMoveSquare = simplifySquare(bestMoveSquareText)
    bestMovePieces.set(currentTurn, finalBestMovePiece)
    bestMoveSquares.set(currentTurn, finalBestMoveSquare)

  } else {
    const bestMovePieceElement = bestMoveParentElement.querySelector('.move-san-figurine')
    const bestMoveSquareElement = bestMoveParentElement.querySelector('.move-san-afterfigurine')

    const finalBestMovePiece = pieces.find(piece => {
      for (const className of bestMovePieceElement.classList.values()) {
        if (className.includes(piece)) {
          return true
        }
      }
      return false
    }) ?? null
    const finalBestMoveSquare = simplifySquare(bestMoveSquareElement.textContent)

    bestMovePieces.set(currentTurn, finalBestMovePiece)
    bestMoveSquares.set(currentTurn, finalBestMoveSquare)
  }
}, 200);

// 1., 1..., 2., ... to 1, 2, 3, ...
function toMoveCounter(moveCounterString) {
  let moveCounter = (parseInt(moveCounterString.replaceAll('.', '')) * 2) - 1
  if (moveCounterString.includes("...")) {
    moveCounter++
  }
  return moveCounter
}

function simplifySquare (moveSquare) {
  if (moveSquare === 'O-O') {
    return moveSquare
  }
  // If a move gives check then there is a plus sign at the end.
  const withoutPlus = moveSquare.replace('+', '')
  return withoutPlus.substring(withoutPlus.length - 2)
}

function insertHighlightElement() {
  if (!finalSquareLetterToTransformMap || !finalSquareNumberToTransformMap) return

  const previousBestMoveSquare = bestMoveSquares.get(currentTurn - 1)
  const previousBestMovePiece = bestMovePieces.get(currentTurn - 1)

  if (!previousBestMoveSquare) {
    const toRemoveElement = document.getElementById(highlightElementId)
    if (toRemoveElement) {
      boardElement.removeChild(toRemoveElement)
    }
    return
  }

  const translateX = finalSquareLetterToTransformMap[previousBestMoveSquare.charAt(0)] - 3
  const translateY = finalSquareNumberToTransformMap[previousBestMoveSquare.charAt(1)] - 7

  // Rochade edge case
  if (!translateX && !translateY) {
    highlightElement.textContent = 'Rochade'
    highlightElement.style.transform = 'translate(350%, 378%)'
  } else {
    highlightElement.textContent = pieceToUnicodeMap[previousBestMovePiece]
    highlightElement.style.transform = `translate(${translateX}%, ${translateY}%)`
  }

  boardElement.appendChild(highlightElement)
}
