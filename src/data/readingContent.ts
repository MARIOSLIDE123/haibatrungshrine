export interface VocabularyItem {
  id: string;
  word: string;
  partOfSpeech: string;
  phonetic: string;
  definition: string;
  example: string;
}

export interface ReadingSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface ReadingArticle {
  title: string;
  subtitle: string;
  location: string;
  sections: ReadingSection[];
  vocabulary: VocabularyItem[];
  sourceAttribution: string;
}

export const readingContent: ReadingArticle = {
  title: "Hai Ba Trung Shrine – Dong Nhan Shrine, Hanoi",
  subtitle: "A Famous Historical Heritage Site in Hanoi for Grade 6 Students",
  location: "680 Bach Dang Street, Dong Nhan Ward, Hai Ba Trung District, Hanoi",
  sections: [
    {
      id: "intro",
      title: "1. Who Does the Shrine Honour?",
      paragraphs: [
        "Hai Ba Trung Shrine, also widely known as Dong Nhan Shrine, is one of the most sacred and famous historical sites in Hanoi. The shrine honours Trung Trac and Trung Nhi—two brave sisters and national heroines who led the first major uprising against foreign domination in 40 AD.",
        "Their courageous leadership brought freedom to the Vietnamese people and inspired national pride for thousands of years. Today, generations of students and visitors come to the shrine to express gratitude and honour the memory of the two sisters."
      ]
    },
    {
      id: "location",
      title: "2. Location and Setting",
      paragraphs: [
        "Hai Ba Trung Shrine is located at 680 Bach Dang Street, in Dong Nhan Ward, Hai Ba Trung District, Hanoi. It sits in a peaceful, tree-lined neighbourhood not far from the Red River.",
        "When visitors arrive at 680 Bach Dang Street, they enter a quiet courtyard surrounded by shaded green gardens, stepping away from the busy traffic of Hanoi into a serene sanctuary of history and reflection."
      ]
    },
    {
      id: "history",
      title: "3. History and Relocation",
      paragraphs: [
        "According to ancient records such as Viet Su Luoc, villagers first built a shrine beside the Red River in Dong Nhan village in 1160, during the reign of King Ly Anh Tong. A famous local legend says that after the Trung Sisters sacrificed their lives in the Hat River, their spirits protected the land, and two sacred statues appeared floating down the Red River. Fishermen brought the statues ashore and built the first temple.",
        "Centuries later, in 1819, severe riverbank erosion caused the land beside the river to slide away. Because of riverbank erosion, the villagers carefully moved the main temple further inland to Huong Vien village, which corresponds to its current location on Bach Dang Street.",
        "Over time, the shrine was protected and cherished. On 5 February 1994, the site was officially recognized as a national historical and architectural-artistic monument. Later, the main building was restored in 1998, preserving its timeless wooden structure and beauty."
      ]
    },
    {
      id: "architecture",
      title: "4. Traditional Architecture and Historical Objects",
      paragraphs: [
        "The architectural complex of Hai Ba Trung Shrine is built in traditional Vietnamese temple style. It features an impressive three-gate entrance (tam quan), a spacious front courtyard, a main hall, a sacred rear sanctuary, and two side buildings.",
        "Inside the complex are many precious historical relics. Visitors can admire ancient stone steles, bronze bells, and royal decrees. Most famously, the shrine preserves two black wooden elephants with real ivory tusks that stand majestically beside the ceremonial courtyard, reminding us of the Trung Sisters riding into battle."
      ]
    },
    {
      id: "ceremony",
      title: "5. The Annual Ceremony and Preserving Heritage",
      paragraphs: [
        "Every year, on the fifth day of the second lunar month, a grand festival takes place at the shrine. The highlight of the celebration is the traditional water ceremony, where holy water is taken in decorated dragon boats from the Red River to bathe the statues in a sacred cleansing ritual.",
        "Hai Ba Trung Shrine is an invaluable part of our national heritage. When visiting this sacred landmark, visitors should show respect by dressing politely, keeping voices quiet, and keeping the grounds clean so future generations can enjoy this historic treasure."
      ]
    }
  ],
  vocabulary: [
    {
      id: "shrine",
      word: "Shrine",
      partOfSpeech: "noun",
      phonetic: "/ʃraɪn/",
      definition: "A sacred place where people honour a special person, hero, or spirit.",
      example: "Many students visit the shrine to learn about history."
    },
    {
      id: "heroine",
      word: "Heroine",
      partOfSpeech: "noun",
      phonetic: "/ˈher.əʊ.ɪn/",
      definition: "A woman admired for her great courage, bravery, and noble qualities.",
      example: "Trung Trac and Trung Nhi were famous heroines in Vietnamese history."
    },
    {
      id: "erosion",
      word: "Erosion",
      partOfSpeech: "noun",
      phonetic: "/ɪˈrəʊ.ʒən/",
      definition: "The gradual wearing away of rocks and soil by water, wind, or weather.",
      example: "Riverbank erosion forced the villagers to relocate the temple in 1819."
    },
    {
      id: "sanctuary",
      word: "Sanctuary",
      partOfSpeech: "noun",
      phonetic: "/ˈsæŋk.tʃʊə.ri/",
      definition: "A holy, safe, and peaceful place inside a religious building.",
      example: "The sacred statues are kept in the rear sanctuary."
    },
    {
      id: "ivory",
      word: "Ivory",
      partOfSpeech: "noun",
      phonetic: "/ˈaɪ.vər.i/",
      definition: "A hard, smooth, yellowish-white material that forms elephant tusks.",
      example: "The two wooden elephants have real ivory tusks."
    },
    {
      id: "heritage",
      word: "Heritage",
      partOfSpeech: "noun",
      phonetic: "/ˈher.ɪ.tɪdʒ/",
      definition: "Places, objects, traditions, and practices passed down from earlier generations.",
      example: "We must protect our cultural heritage for future students."
    },
    {
      id: "ceremony",
      word: "Ceremony",
      partOfSpeech: "noun",
      phonetic: "/ˈser.ə.mə.ni/",
      definition: "A formal event held with traditional customs for a special purpose.",
      example: "The annual water ceremony is held in the second lunar month."
    },
    {
      id: "respect",
      word: "Respect",
      partOfSpeech: "noun / verb",
      phonetic: "/rɪˈspekt/",
      definition: "Polite behaviour and high regard shown towards someone or something important.",
      example: "Visitors should show respect when entering the temple."
    }
  ],
  sourceAttribution: "Content compiled from official historical records (Viet Su Luoc, Hanoi Department of Culture and Sports) and educational resources for Grade 6 English curriculum (Unit: My Neighbourhood / Historical Wonders)."
};
