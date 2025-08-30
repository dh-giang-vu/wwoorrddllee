import { useState } from "react"
import { useEffect } from 'react'
import './Wordle.css'

const numRow = 7
const numCol = 5
const wordleWord = 'react'

function Wordle() {

  const [gridValues, setGridValues] = useState(Array(numRow * numCol).fill(''))
  const [letterCount, setLetterCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [correctWordle, setCorrectWordle] = useState(false)

  const resetAllStates = () => {
    setGridValues(Array(numRow * numCol).fill(''))
    setLetterCount(0)
    setWordCount(0)
    setCorrectWordle(false)
  }

  useEffect(() => {

    const lowerBound = () => wordCount * numCol
    const upperBound = () => lowerBound() + numCol
    
    function changeGridValueAt(index: Number, newValue: String) {
      const nextGridValues = gridValues.map((v, i) => {
        if (i === index) {
          return newValue
        } 
        else {
          return v
        }
      })
      setGridValues(nextGridValues)
    }

    function addNewLetter(letter: String) {
      changeGridValueAt(letterCount, letter.toUpperCase())
      setLetterCount(letterCount => letterCount + 1)
    }

    function removeLastLetter() {
      changeGridValueAt(letterCount - 1, '')
      setLetterCount(letterCount => letterCount - 1)
    }

    function submitWord() {
      const word = gridValues.slice(letterCount-numCol, letterCount).join('').toLowerCase()
      setWordCount(wordCount => wordCount + 1)
      if (word === wordleWord) {
        setCorrectWordle(true)
      }
    }

    function handleKeyboardInput(e: KeyboardEvent) {
      if (wordCount >= numRow || correctWordle) {
        if (e.key == 'Escape') {
          resetAllStates()
        }
        return
      }
      if (e.key >= 'a' && e.key <= 'z' && letterCount < upperBound()) {
        addNewLetter(e.key)
      }
      else if (e.key == 'Backspace' && letterCount > lowerBound()) {
        removeLastLetter()
      }
      else if (e.key == 'Enter' && letterCount == upperBound()) {
        submitWord()
      }
    }

    window.addEventListener("keydown", handleKeyboardInput)

    return () => {
      window.removeEventListener("keydown", handleKeyboardInput)
    }
  })

  return (
    <>
      {correctWordle && <GameOverPopUp win={true}/>}
      {!correctWordle && wordCount >= numRow && <GameOverPopUp win={false}/>}
      <div className="gridContainer">
        {[...Array(numRow * numCol)].map((_, i) => {
          return (
            <div className="square" key={i}>
              <div className="squareNumber">{i+1}</div>
              <div className="letterDisplay">{gridValues[i]}</div>
            </div>
          ) 
        })}
      </div>
    </>
  )
}

// Don't judge me leave me alone asdadgfsdhgfd
function GameOverPopUp({win} : {win: Boolean}) {
  const winningText = "You've guessed it!"
  const losingText = "You've lost..."
  const revealWordleText = "The word was"

  return (
    <div className="popUpContainer">
      {win && <div className="popUpText">{winningText}</div>}
      {!win && <div className="popUpText">{losingText}</div>}
      <div className="wordReveal">{revealWordleText} <span className="highlight">{wordleWord.toUpperCase()}</span></div>
      <div className="popUpInstruction">(Press <span className="highlight">Esc</span> to start again)</div>
    </div>
  )
}

export default Wordle
