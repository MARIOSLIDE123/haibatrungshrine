export type ArenaQuestionType =
  | 'single-choice'
  | 'fill-in-the-blank'
  | 'true-false'
  | 'multiple-select'
  | 'matching-columns'
  | 'word-order';

export interface BaseArenaQuestion {
  id: number;
  type: ArenaQuestionType;
  title: string;
  question: string;
  explanation: string;
}

export interface ArenaSingleChoiceQuestion extends BaseArenaQuestion {
  type: 'single-choice';
  options: string[];
  correctAnswer: string;
}

export interface ArenaFillInTheBlankQuestion extends BaseArenaQuestion {
  type: 'fill-in-the-blank';
  acceptedAnswers: string[];
  placeholder?: string;
  sentencePrompt?: string;
}

export interface ArenaTrueFalseQuestion extends BaseArenaQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface ArenaMultipleSelectQuestion extends BaseArenaQuestion {
  type: 'multiple-select';
  options: string[];
  correctAnswers: string[];
  requiredCount?: number;
}

export interface ArenaMatchingItem {
  id: string;
  text: string;
}

export interface ArenaMatchingQuestion extends BaseArenaQuestion {
  type: 'matching-columns';
  columnA: ArenaMatchingItem[];
  columnB: ArenaMatchingItem[];
  correctPairs: Record<string, string>; // columnA id -> columnB id
}

export interface ArenaWordOrderQuestion extends BaseArenaQuestion {
  type: 'word-order';
  wordBank: string[];
  acceptedSentences: string[];
}

export type ArenaQuestion =
  | ArenaSingleChoiceQuestion
  | ArenaFillInTheBlankQuestion
  | ArenaTrueFalseQuestion
  | ArenaMultipleSelectQuestion
  | ArenaMatchingQuestion
  | ArenaWordOrderQuestion;

export const brainArenaQuestions: ArenaQuestion[] = [
  {
    id: 1,
    type: 'single-choice',
    title: 'QUESTION 1 — SINGLE CHOICE',
    question: 'Who does Hai Ba Trung Shrine honour?',
    options: [
      'Trung Trac and Trung Nhi',
      'Two famous artists',
      'Two modern scientists',
      'Two foreign explorers',
    ],
    correctAnswer: 'Trung Trac and Trung Nhi',
    explanation: 'The shrine honours Trung Trac and Trung Nhi, two famous heroines in Vietnamese history.',
  },
  {
    id: 2,
    type: 'fill-in-the-blank',
    title: 'QUESTION 2 — FILL IN THE BLANK',
    question: 'Hai Ba Trung Shrine is located at 680 ______ Street, Hanoi.',
    sentencePrompt: 'Hai Ba Trung Shrine is located at 680 ______ Street, Hanoi.',
    acceptedAnswers: ['Bach Dang', 'Bạch Đằng'],
    placeholder: 'Type the street name...',
    explanation: 'The reading gives the address as 680 Bach Dang Street, Hanoi.',
  },
  {
    id: 3,
    type: 'true-false',
    title: 'QUESTION 3 — TRUE OR FALSE',
    question: 'According to the historical record mentioned in the article, villagers built a shrine beside the river in 1160.',
    correctAnswer: true,
    explanation: 'The article says that Viet Su Luoc records the construction of a shrine beside the river in 1160.',
  },
  {
    id: 4,
    type: 'single-choice',
    title: 'QUESTION 4 — SINGLE CHOICE',
    question: 'According to local legend, in which river did the Trung Sisters die?',
    options: [
      'The Red River',
      'The Hat River',
      'The Mekong River',
      'The Perfume River',
    ],
    correctAnswer: 'The Hat River',
    explanation: 'This is part of a local legend described in the reading.',
  },
  {
    id: 5,
    type: 'fill-in-the-blank',
    title: 'QUESTION 5 — FILL IN THE BLANK',
    question: 'In ______, riverbank erosion led the main temple to move to Huong Vien.',
    sentencePrompt: 'In ______, riverbank erosion led the main temple to move to Huong Vien.',
    acceptedAnswers: ['1819'],
    placeholder: 'Enter the 4-digit year...',
    explanation: 'The article gives the year 1819.',
  },
  {
    id: 6,
    type: 'single-choice',
    title: 'QUESTION 6 — SINGLE CHOICE',
    question: 'Why did the main temple move to Huong Vien?',
    options: [
      'Because a new school was built.',
      'Because of riverbank erosion.',
      'Because a market opened nearby.',
      'Because the temple became a museum.',
    ],
    correctAnswer: 'Because of riverbank erosion.',
    explanation: 'Riverbank erosion caused the main temple to move.',
  },
  {
    id: 7,
    type: 'multiple-select',
    title: 'QUESTION 7 — MULTIPLE SELECT',
    question: 'Which TWO details about the elephants are mentioned in the reading? Select TWO answers.',
    requiredCount: 2,
    options: [
      'They were made of black wood.',
      'They had real ivory tusks.',
      'They were made of glass.',
      'They were used as school desks.',
    ],
    correctAnswers: [
      'They were made of black wood.',
      'They had real ivory tusks.',
    ],
    explanation: 'The reading mentions two black wooden elephants with real ivory tusks.',
  },
  {
    id: 8,
    type: 'matching-columns',
    title: 'QUESTION 8 — MATCHING COLUMNS',
    question: 'Match each word with its correct meaning.',
    columnA: [
      { id: '1', text: '1. Shrine' },
      { id: '2', text: '2. Legend' },
      { id: '3', text: '3. Heritage' },
      { id: '4', text: '4. Ceremony' },
    ],
    columnB: [
      { id: 'A', text: 'A. A formal event held for a special purpose.' },
      { id: 'B', text: 'B. A traditional story from the past.' },
      { id: 'C', text: 'C. A place where people honour a person or spirit.' },
      { id: 'D', text: 'D. Places, objects, traditions, and practices passed down from earlier generations.' },
    ],
    correctPairs: {
      '1': 'C',
      '2': 'B',
      '3': 'D',
      '4': 'A',
    },
    explanation: 'These words help us talk about historical places and cultural traditions.',
  },
  {
    id: 9,
    type: 'word-order',
    title: 'QUESTION 9 — WORD ORDER',
    question: 'Put the words in the correct order to make a sentence.',
    wordBank: ['respect', 'Visitors', 'show', 'should'],
    acceptedSentences: ['Visitors should show respect.'],
    explanation: 'We use ‘should’ to give advice about appropriate behaviour.',
  },
  {
    id: 10,
    type: 'single-choice',
    title: 'QUESTION 10 — SINGLE CHOICE',
    question: 'When was the main building restored, according to the reading?',
    options: ['1680', '1819', '1994', '1998'],
    correctAnswer: '1998',
    explanation: 'The article states that the main building was restored in 1998.',
  },
  {
    id: 11,
    type: 'true-false',
    title: 'QUESTION 11 — TRUE OR FALSE',
    question: 'The site became a national historical and architectural-artistic monument on 5 February 1994.',
    correctAnswer: true,
    explanation: 'This date is stated in the supplied English reading.',
  },
  {
    id: 12,
    type: 'multiple-select',
    title: 'QUESTION 12 — MULTIPLE SELECT',
    question: 'Which features are mentioned as parts of the architectural complex? Select ALL correct answers.',
    options: [
      'A three-gate entrance',
      'A main hall',
      'A rear sanctuary',
      'Two side buildings',
      'A modern cinema',
    ],
    correctAnswers: [
      'A three-gate entrance',
      'A main hall',
      'A rear sanctuary',
      'Two side buildings',
    ],
    explanation: 'The reading mentions a three-gate entrance, a main hall, a rear sanctuary, and two side buildings.',
  },
  {
    id: 13,
    type: 'fill-in-the-blank',
    title: 'QUESTION 13 — FILL IN THE BLANK',
    question: 'Complete the sentence: The main building was restored in ______.',
    sentencePrompt: 'Complete the sentence: The main building was restored in ______.',
    acceptedAnswers: ['1998'],
    placeholder: 'Enter year...',
    explanation: 'The restoration year given in the article is 1998.',
  },
  {
    id: 14,
    type: 'single-choice',
    title: 'QUESTION 14 — SINGLE CHOICE',
    question: 'When is the annual water ceremony held?',
    options: [
      'On the first day of the first lunar month.',
      'On the fifth day of the second lunar month.',
      'On the tenth day of the sixth lunar month.',
      'On the last day of the twelfth lunar month.',
    ],
    correctAnswer: 'On the fifth day of the second lunar month.',
    explanation: 'The article says that the annual ceremony takes place on the fifth day of the second lunar month.',
  },
  {
    id: 15,
    type: 'word-order',
    title: 'QUESTION 15 — WORD ORDER',
    question: 'Arrange the words to make a correct sentence.',
    wordBank: ['Trung Nhi', 'The shrine', 'and', 'honours', 'Trung Trac'],
    acceptedSentences: [
      'The shrine honours Trung Trac and Trung Nhi.',
      'The shrine honours Trung Nhi and Trung Trac.',
    ],
    explanation: 'This sentence summarises the main purpose of the shrine.',
  },
];
