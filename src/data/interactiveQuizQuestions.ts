export type QuestionType =
  | 'single-choice'
  | 'true-false'
  | 'fill-in-the-blank'
  | 'matching'
  | 'sentence-order';

export interface BaseQuestion {
  id: number;
  type: QuestionType;
  topic: string;
  question: string;
  explanation: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: string[];
  correctAnswer: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  type: 'fill-in-the-blank';
  acceptedAnswers: string[];
  placeholder?: string;
  sentencePrompt?: string;
}

export interface MatchingPair {
  term: string;
  definition: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface SentenceOrderQuestion extends BaseQuestion {
  type: 'sentence-order';
  words: string[];
  correctSentence: string;
}

export type QuizQuestion =
  | SingleChoiceQuestion
  | TrueFalseQuestion
  | FillInTheBlankQuestion
  | MatchingQuestion
  | SentenceOrderQuestion;

export const interactiveQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: 'single-choice',
    topic: '1. Location and Importance',
    question: 'Where is Hai Ba Trung Shrine (Dong Nhan Shrine) located in Hanoi?',
    options: [
      '680 Bach Dang Street, Dong Nhan Ward',
      '12 Trang Tien Street, Hoan Kiem District',
      '105 Thuy Khue Street, Tay Ho District',
      '24 Nguyen Trai Street, Thanh Xuan District',
    ],
    correctAnswer: '680 Bach Dang Street, Dong Nhan Ward',
    explanation:
      'Hai Ba Trung Shrine is located at 680 Bach Dang Street, Dong Nhan Ward, Hai Ba Trung District, Hanoi.',
  },
  {
    id: 2,
    type: 'true-false',
    topic: '2. Trung Trac and Trung Nhi',
    question:
      'Trung Trac and Trung Nhi were two brave heroines in Vietnamese history who led the first uprising in 40 AD.',
    correctAnswer: true,
    explanation:
      'True! The shrine honours the two Trung Sisters, renowned national heroines who led the historic uprising for independence in 40 AD.',
  },
  {
    id: 3,
    type: 'fill-in-the-blank',
    topic: '3. History of the Shrine',
    question:
      'In 1819, severe riverbank ______ forced the villagers to relocate the main temple to Huong Vien.',
    sentencePrompt: 'In 1819, severe riverbank ______ forced the villagers to relocate the main temple to Huong Vien.',
    acceptedAnswers: ['erosion', 'riverbank erosion'],
    placeholder: 'Type the missing word...',
    explanation:
      'Riverbank erosion caused the land beside the Red River to slide, leading the villagers to move the shrine inland in 1819.',
  },
  {
    id: 4,
    type: 'matching',
    topic: '4. Traditional Architecture & Historical Objects',
    question: 'Match each architectural or historical feature with its description:',
    pairs: [
      {
        term: 'Three-gate entrance',
        definition: 'A traditional front entrance gate (tam quan) leading into the temple.',
      },
      {
        term: 'Rear sanctuary',
        definition: 'The most sacred inner hall where the holy statues are enshrined.',
      },
      {
        term: 'Black wooden elephants',
        definition: 'Two magnificent ceremonial statues standing by the courtyard.',
      },
      {
        term: 'Real ivory tusks',
        definition: 'Authentic historic features adorning the wooden elephants.',
      },
    ],
    explanation:
      'The architectural complex features a three-gate entrance, rear sanctuary, and two famous black wooden elephants with real ivory tusks.',
  },
  {
    id: 5,
    type: 'sentence-order',
    topic: '5. The Annual Ceremony & Heritage',
    question: 'Put the words in the correct order to make a complete rule for visitors:',
    words: ['Visitors', 'should', 'show', 'respect', 'at', 'the', 'shrine.'],
    correctSentence: 'Visitors should show respect at the shrine.',
    explanation:
      'Visitors should show respect at the shrine by wearing polite clothes, speaking quietly, and protecting our cultural heritage.',
  },
];
