import React from 'react'
import { ClipboardCheck } from 'lucide-react'
import { BackButton, StatusBar } from '../components/AppChrome'
import { formatAnswer } from '../utils/grading'
import mistakeClipboardSearch from '../assets/daily-practice-ui/mistake-clipboard-search.png'
import mistakeRainCloud from '../assets/daily-practice-ui/mistake-rain-cloud.png'
import { SemanticText } from '../utils/koreanText.jsx'

export default function MistakeReview({ mistakes, onContinue }) {
  return (
    <main className="screen mistakes-screen">
      <StatusBar />
      <BackButton />
      <section className="mistake-hero">
        <div>
          <h1>Review Items</h1>
          <p>Check what we’ll practice again.</p>
          <span className="mistake-count"><ClipboardCheck size={24} /> {mistakes.length} items to revisit</span>
        </div>
        <img className="clipboard-art asset-illustration" src={mistakeClipboardSearch} alt="" />
      </section>

      <section className="mistake-list">
        {mistakes.length === 0 ? (
          <article className="review-card empty-review-card">
            <h2>Everything looks strong!</h2>
            <p>You completed today’s practice without any review items.</p>
          </article>
        ) : mistakes.map(({ question, result }, index) => (
          <article className="review-card" key={question.question_id}>
            <div className={`mistake-label ${result.answer_status === 'dontKnow' ? 'unknown' : ''}`}>
              <strong>{index + 1}</strong>
              <span>{result.answer_status === 'dontKnow' ? 'I don’t know yet' : 'Incorrect answer'}</span>
            </div>
            <div className="mistake-content">
              <div className="mistake-term">
                <img className="mistake-term-icon" src={mistakeRainCloud} alt="" />
                <SemanticText as="h2" text={question.review_label ?? question.target_item} />
                <p className="romanization">{question.romanization}</p>
                <p className="meaning">{question.english_meaning}</p>
              </div>
              <div className="compare-grid">
                <span>My answer</span>
                <strong>{result.answer_status === 'dontKnow' ? 'Not answered yet' : formatAnswer(result.student_answer)}</strong>
                <span>Correct answer</span>
                <strong>{formatAnswer(question.correct_answer)}</strong>
              </div>
            </div>
            <p className="why-strip">
              <strong>Review area</strong> {question.evaluation_skill}
            </p>
          </article>
        ))}
      </section>

      <button className="primary-button wide" onClick={onContinue} type="button">Continue</button>
    </main>
  )
}
