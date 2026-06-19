import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EVALUATION_SKILLS,
  buildPersonalizedReview,
  evaluateSkills,
  statusForFailureCount,
} from '../src/agent/reviewBuilderAgent.js'
import { mockDraftQuestions } from '../src/mock/mockDraftQuestions.js'
import { gradeQuestion } from '../src/utils/grading.js'

const unitOneQuestions = mockDraftQuestions.filter((question) => question.unit_id === 'unit_01')

test('Unit 1 contains the planned 20-question skill distribution', () => {
  assert.equal(unitOneQuestions.length, 20)
  assert.deepEqual(
    Object.fromEntries(EVALUATION_SKILLS.map((skill) => [
      skill,
      unitOneQuestions.filter((question) => question.evaluation_skill === skill).length,
    ])),
    {
      'Vocabulary Understanding': 7,
      'Vocabulary Use': 3,
      'Grammar Ending': 3,
      'Sentence Structure': 3,
      'Reading Check': 2,
      'Situation Expression': 2,
    },
  )
})

test('choice and sentence-order questions are graded correctly', () => {
  assert.equal(gradeQuestion(unitOneQuestions[0], 'student').is_correct, true)
  assert.equal(gradeQuestion(unitOneQuestions[0], 'teacher').is_correct, false)
  assert.equal(
    gradeQuestion(unitOneQuestions[15], ['아니요', '저는', '미국 사람이', '아닙니다']).is_correct,
    true,
  )
})

test('skill status thresholds include incorrect and dontKnow results', () => {
  assert.equal(statusForFailureCount(0), 'Strong')
  assert.equal(statusForFailureCount(1), 'Keep Practicing')
  assert.equal(statusForFailureCount(2), 'Needs Review')

  const results = [
    { question_id: 'u01_q01', evaluation_skill: 'Vocabulary Understanding', answer_status: 'incorrect' },
    { question_id: 'u01_q02', evaluation_skill: 'Vocabulary Understanding', answer_status: 'dontKnow' },
  ]
  const vocabulary = evaluateSkills(results, unitOneQuestions)
    .find((evaluation) => evaluation.skill === 'Vocabulary Understanding')

  assert.equal(vocabulary.failure_count, 2)
  assert.equal(vocabulary.status, 'Needs Review')
})

test('personalized review contains only failed Unit 1 items', () => {
  const results = [
    { question_id: 'u01_q01', evaluation_skill: 'Vocabulary Understanding', answer_status: 'incorrect' },
    { question_id: 'u01_q08', evaluation_skill: 'Vocabulary Use', answer_status: 'dontKnow' },
    { question_id: 'u01_q11', evaluation_skill: 'Grammar Ending', answer_status: 'correct' },
  ]
  const review = buildPersonalizedReview({ questions: unitOneQuestions, results })

  assert.equal(review.length, 2)
  assert.equal(review.every((question) => question.unit_id === 'unit_01'), true)
  assert.deepEqual(review.map((question) => question.source_question_id), ['u01_q01', 'u01_q08'])
})
