var questions = [
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' },
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' },
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' },
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' },
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' },
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' },
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' },
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' },
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' },
  { question: 'this is a question', answer: 'answer1' },
  { question: 'this is another question', answer: 'answer2' }
]

var GAMES = [
  {
    name: 'Rebus 1',
    type: 'rebus',
    image: 'assets/rebus-1.jpg',
    solution: 'Rebus Answer',
    questions,
    points: 100,
    boardClearPoints: 500
  },
  {
    name: 'Video 1',
    type: 'intermission',
    source: 'assets/video1.swf'
  },
  {
    name: 'Audience Round',
    type: 'categories',
    pointValues: ['☆', '☆', '☆', '☆'],
    board: [
      {
        category: 'Topic 1',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 2',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 3',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 4',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      }
    ]
  },
  {
    name: 'Categories 1',
    type: 'categories',
    pointValues: [100, 200, 300, 500],
    board: [
      {
        category: 'Topic 1',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 2',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 3',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 4',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      }
    ]
  },
  {
    name: 'Categories 2',
    type: 'categories',
    pointValues: [100, 200, 300, 500],
    board: [
      {
        category: 'Topic 1',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 2',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 3',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 4',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      }
    ]
  },
  {
    name: 'Categories 3',
    type: 'categories',
    pointValues: [100, 200, 300, 500],
    board: [
      {
        category: 'Topic 1',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 2',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 3',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      },
      {
        category: 'Topic 4',
        questions: [
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' },
          { question: 'this is a question', answer: 'answer1' },
          { question: 'this is another question', answer: 'answer2' }
        ]
      }
    ]
  }
]

var CONFIG = {
  teams: ['team1', 'team2', 'team3'],
  pointValues: [100, 200, 300, 500],
  transitionDuration: 200,
  rebusRow: 4,
  rebusColumn: 4
}

var YEAR = 2024
