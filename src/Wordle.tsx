import { useState } from "react"
import { useEffect } from 'react'
import './Wordle.css'

const numRow = 7
const numCol = 5
const defaultWordle = 'react'

function Wordle() {
  // -1 = wrong, 1 = wordle word contains this letter in a diff position, 2 = wordle word contains this letter in the same position
  const [gridValues, setGridValues] = useState(Array(numRow * numCol).fill(null).map(() => ({state: 0, value: ''})))
  const [letterCount, setLetterCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [correctWordle, setCorrectWordle] = useState(false)
  const [wordleWord, setWordleWord] = useState(defaultWordle)

  const resetAllStates = () => {
    setGridValues(Array(numRow * numCol).fill(null).map(() => ({state: 0, value: ''})))
    setLetterCount(0)
    setWordCount(0)
    setCorrectWordle(false)
    fetchNewWordle()
  }

  const fetchNewWordle = async () => {
    try {
      const response = await fetch(`https://random-words-api.kushcreates.com/api?language=en&length=${numCol}&type=lowercase&words=1`);
      if (!response.ok) {
        throw new Error(`${response.body}`);
      }
      const wordle = await response.json();
      setWordleWord(wordle[0].word);
    } catch (error) {
      console.error('Error fetching data:', error);
      setWordleWord(defaultWordle)
    }
  }

  useEffect(() => {

    const lowerBound = () => wordCount * numCol
    const upperBound = () => lowerBound() + numCol
    
    function changeGridValueAt(index: number, newValue: string) {
      const nextGridValues = gridValues.map((v, i) => {
        if (i === index) {
          return {...v, value: newValue}
        } 
        else {
          return v
        }
      })
      setGridValues(nextGridValues)
    }

    function addNewLetter(letter: string) {
      changeGridValueAt(letterCount, letter.toUpperCase())
      setLetterCount(letterCount => letterCount + 1)
    }

    function removeLastLetter() {
      changeGridValueAt(letterCount - 1, '')
      setLetterCount(letterCount => letterCount - 1)
    }

    function submitWord() {
      const word = gridValues.slice(letterCount-numCol, letterCount)
        .map(x => x.value)
        .join('')
        .toLowerCase()
        if (word === wordleWord) {
          setCorrectWordle(true)
        }
        evaluateGuess(word.split(''))
        setWordCount(wordCount => wordCount + 1)
    }

    function evaluateGuess(guessed: string[]) {
      let sameposition: number[] = []
      let diffposition: number[] = []

      wordleWord.split('').map((_, i) => {
        if (guessed[i] === wordleWord[i]) {
          sameposition.push(lowerBound() + i)
        }
        else if (wordleWord.includes(guessed[i])) {
          diffposition.push(lowerBound() + i)
        }
      })

      const nextGridValues = gridValues.map((v, i) => {
        if (i < lowerBound() || i >= upperBound()) {
          return v
        }
        if (sameposition.length > 0 && i == sameposition[0]) {
          sameposition = sameposition.slice(1)
          return {...v, state: 2}
        }
        else if (diffposition.length > 0 && i == diffposition[0]) {
          diffposition = diffposition.slice(1)
          return {...v, state: 1}
        }
        else {
          return {...v, state: -1}
        }
      })
      setGridValues(nextGridValues)
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

  const squareColor = (position: number) => {
    if (gridValues[position].state === 2) return "sameposition" 
    if (gridValues[position].state === 1) return "diffposition" 
    if (gridValues[position].state === -1) return "wrong" 
  }

  return (
    <>
      {correctWordle && <GameOverPopUp win={true} wordleWord={wordleWord}/>}
      {!correctWordle && wordCount >= numRow && <GameOverPopUp win={false} wordleWord={wordleWord}/>}
      <div className="gridContainer">
        {[...Array(numRow * numCol)].map((_, i) => {
          return (
            <div className={"square " + squareColor(i)} key={i}>
              <div className="squareNumber">{i+1}</div>
              <div className="letterDisplay">{gridValues[i].value}</div>
            </div>
          ) 
        })}
      </div>
    </>
  )
}

// Don't judge me leave me alone asdadgfsdhgfd
function GameOverPopUp({win, wordleWord} : {win: Boolean, wordleWord: string}) {
  const winningText = "You've guessed it!"
  const losingText = "You've lost..."
  const revealWordleText = "The word is"

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
