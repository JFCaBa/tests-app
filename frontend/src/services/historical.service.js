// src/services/historical.service.js

const historicalData = {
  keyDates: {
    generalDates: [
      {
        year: 1812,
        event: "Отечественная война (Patriotic War) against France",
      },
      {
        year: 1917,
        event: "Great Russian Revolution, Russia proclaimed a republic",
      },
      { year: "1941-1945", event: "The Great Patriotic War" },
      {
        year: 1945,
        event: "End of Great Patriotic War, Soviet forces took Berlin",
      },
      { year: 1961, event: "Yuri Gagarin made the first flight into space" },
      {
        year: 1991,
        event: "Formation of the Содружество Независимых Государств (СНГ)",
      },
      { year: 1993, event: "Adoption of the Constitution of Russia" },
    ],
    holidays: [
      { date: "January 7", name: "Рождество Христово (Christmas)" },
      {
        date: "February 23",
        name: "День защитника Отечества (Defender of the Fatherland Day)",
      },
      { date: "May 9", name: "День Победы (Victory Day)" },
      { date: "June 6", name: "A.S. Pushkin's Birthday" },
      { date: "June 12", name: "День России (Day of Russia)" },
      {
        date: "November 4",
        name: "День народного единства (Day of National Unity)",
      },
    ],
  },
  keyFigures: {
    military: [
      {
        name: "G.K. Zhukov",
        description: "Celebrated military commander of the Great Patriotic War",
      },
      {
        name: "A.V. Suvorov",
        description: "Great Russian military commander of the 18th century",
      },
      {
        name: "M.I. Kutuzov",
        description:
          "Commander of the Russian army during the 1812 Patriotic War and Battle of Borodino",
      },
    ],
    political: [
      {
        name: "Boris Yeltsin",
        description:
          "First President of Russia, associated with the adoption of the 1993 Constitution",
      },
      {
        name: "Ivan Grozny",
        description:
          "First Russian Tsar, associated with the annexation of Kazan",
      },
    ],
    cultural: [
      {
        name: "A.S. Pushkin",
        description: "Famous poet and author of 'Eugene Onegin'",
      },
      {
        name: "L.N. Tolstoy",
        description: "Notable Russian writer",
      },
      {
        name: "F.M. Dostoevsky",
        description: "Author of 'Crime and Punishment'",
      },
      {
        name: "P.I. Tchaikovsky",
        description: "Composer of 'The Nutcracker'",
      },
    ],
    scientific: [
      {
        name: "D.I. Mendeleev",
        description: "Prominent Russian scientist",
      },
      {
        name: "S.P. Korolev",
        description:
          "Distinguished Soviet designer of rocket and space systems",
      },
      {
        name: "I.V. Kurchatov",
        description: "Researcher in nuclear physics",
      },
      {
        name: "Y.A. Gagarin",
        description: "First human to journey into outer space (1961)",
      },
      {
        name: "A.S. Popov",
        description: "Inventor of the radio",
      },
    ],
  },
};

class HistoricalService {
  searchByYear(year) {
    return historicalData.keyDates.generalDates.find((date) =>
      String(date.year).includes(String(year))
    );
  }

  searchByFigure(name) {
    const categories = Object.values(historicalData.keyFigures);
    for (const category of categories) {
      const figure = category.find((f) =>
        f.name.toLowerCase().includes(name.toLowerCase())
      );
      if (figure) return figure;
    }
    return null;
  }

  enhanceResponse(userInput, subject) {
    // Don't process if not history-related
    if (subject !== "history") return null;

    const input = userInput.toLowerCase();
    let enhancedInfo = [];

    // Check for year mentions
    const yearMatch = input.match(/\b\d{4}\b/);
    if (yearMatch) {
      const yearInfo = this.searchByYear(yearMatch[0]);
      if (yearInfo) {
        enhancedInfo.push(`In ${yearInfo.year}: ${yearInfo.event}`);
      }
    }

    // Check for historical figure mentions
    Object.values(historicalData.keyFigures)
      .flat()
      .forEach((figure) => {
        if (input.includes(figure.name.toLowerCase())) {
          enhancedInfo.push(`${figure.name}: ${figure.description}`);
        }
      });

    // Check for holiday mentions
    historicalData.keyDates.holidays.forEach((holiday) => {
      if (input.includes(holiday.name.toLowerCase())) {
        enhancedInfo.push(`${holiday.name} is celebrated on ${holiday.date}`);
      }
    });

    // If no specific matches but asking about dates or figures in general
    if (enhancedInfo.length === 0) {
      if (input.includes("date") || input.includes("when")) {
        const randomDate =
          historicalData.keyDates.generalDates[
            Math.floor(
              Math.random() * historicalData.keyDates.generalDates.length
            )
          ];
        enhancedInfo.push(
          `Here's an important date to remember: In ${randomDate.year}, ${randomDate.event}`
        );
      }

      if (
        input.includes("who") ||
        input.includes("person") ||
        input.includes("figure")
      ) {
        const categories = Object.keys(historicalData.keyFigures);
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];
        const figures = historicalData.keyFigures[randomCategory];
        const randomFigure =
          figures[Math.floor(Math.random() * figures.length)];
        enhancedInfo.push(
          `${randomFigure.name} is an important figure in Russian history: ${randomFigure.description}`
        );
      }
    }

    return enhancedInfo.length > 0 ? enhancedInfo.join("\n\n") : null;
  }
}

export const historicalService = new HistoricalService();
export default historicalService;
