// src/services/law.service.js

const legalData = {
  registrationProcedures: {
    migrationRegistration: {
      name: "Migration Registration",
      timeLimit: "7 working days",
      requirements: [
        "Valid passport",
        "Migration card",
        "Local address",
        "Host party's documents",
      ],
      exceptions: [
        "Citizens of member states of the Eurasian Economic Union have 30 days",
        "Highly qualified specialists and their family members have 90 days",
      ],
    },
    workPermit: {
      name: "Work Permit Registration",
      timeLimit: "10 working days",
      requirements: [
        "Valid passport",
        "Medical certificates",
        "Employment contract or job offer",
        "Certificate of no criminal record",
      ],
      validity: "1 year maximum",
    },
    temporaryResidence: {
      name: "Temporary Residence Permit",
      timeLimit: "6 months for decision",
      requirements: [
        "Valid passport",
        "Medical certificates",
        "Proof of sufficient funds",
        "Russian language proficiency certificate",
        "Knowledge of Russian history and laws certificate",
      ],
      validity: "3 years",
    },
  },

  keyLaws: {
    federalLaws: [
      {
        number: "115-FZ",
        name: "Legal Status of Foreign Citizens",
        key_points: [
          "Defines types of visas and stays",
          "Work permit requirements",
          "Rights and obligations of foreign citizens",
          "Grounds for deportation",
        ],
      },
      {
        number: "109-FZ",
        name: "Migration Registration",
        key_points: [
          "Registration procedure",
          "Timeframes for registration",
          "Required documents",
          "Responsibilities of the host party",
        ],
      },
      {
        number: "62-FZ",
        name: "Citizenship of the Russian Federation",
        key_points: [
          "Grounds for obtaining citizenship",
          "Simplified procedures",
          "Required documents",
          "Grounds for rejection",
        ],
      },
    ],
    importantRegulations: [
      {
        topic: "Work Activities",
        rules: [
          "Work permit or patent required",
          "Employer must have permission to hire foreign workers",
          "Changes in work location must be reported",
          "Maximum working hours: 40 hours per week",
        ],
      },
      {
        topic: "Residence Rules",
        rules: [
          "Address registration required",
          "Changes in address must be reported within 7 days",
          "Multiple registration locations not allowed",
          "Registration through official channels only",
        ],
      },
    ],
  },

  rightsDuties: {
    rights: [
      "Right to work according to permit",
      "Right to education",
      "Right to medical care",
      "Right to freedom of movement within allowed areas",
      "Right to property ownership",
    ],
    duties: [
      "Respect Russian laws and regulations",
      "Pay taxes on earned income",
      "Maintain valid registration",
      "Report changes in status or location",
      "Carry valid ID documents",
    ],
  },

  violations: {
    administrative: [
      {
        violation: "Late registration",
        penalty: "2000-5000 rubles fine",
      },
      {
        violation: "Working without permit",
        penalty: "2000-5000 rubles fine with possible deportation",
      },
      {
        violation: "Living without registration",
        penalty: "2000-3000 rubles fine",
      },
    ],
    serious: [
      {
        violation: "False documentation",
        consequence: "Criminal liability and deportation",
      },
      {
        violation: "Repeated violations",
        consequence: "Entry ban for 3-5 years",
      },
    ],
  },
};

class LawService {
  searchByProcedure(procedure) {
    return legalData.registrationProcedures[procedure] || null;
  }

  searchByLaw(lawNumber) {
    return legalData.keyLaws.federalLaws.find((law) =>
      law.number.toLowerCase().includes(lawNumber.toLowerCase())
    );
  }

  findViolation(violationType) {
    const adminViolation = legalData.violations.administrative.find((v) =>
      v.violation.toLowerCase().includes(violationType.toLowerCase())
    );
    if (adminViolation) return adminViolation;

    const seriousViolation = legalData.violations.serious.find((v) =>
      v.violation.toLowerCase().includes(violationType.toLowerCase())
    );
    return seriousViolation;
  }

  enhanceResponse(userInput, subject) {
    // Don't process if not law-related
    if (subject !== "laws") return null;

    const input = userInput.toLowerCase();
    let enhancedInfo = [];

    // Check for registration procedures
    Object.entries(legalData.registrationProcedures).forEach(([key, proc]) => {
      if (
        input.includes(key.toLowerCase()) ||
        input.includes(proc.name.toLowerCase())
      ) {
        enhancedInfo.push(
          `${proc.name}:\n` +
            `• Time limit: ${proc.timeLimit}\n` +
            `• Key requirements:\n${proc.requirements
              .map((r) => `  - ${r}`)
              .join("\n")}`
        );
      }
    });

    // Check for specific law mentions
    legalData.keyLaws.federalLaws.forEach((law) => {
      if (
        input.includes(law.number.toLowerCase()) ||
        input.includes(law.name.toLowerCase())
      ) {
        enhancedInfo.push(
          `Federal Law ${law.number} - ${law.name}:\n` +
            law.key_points.map((point) => `• ${point}`).join("\n")
        );
      }
    });

    // Check for violation mentions
    if (
      input.includes("violation") ||
      input.includes("penalty") ||
      input.includes("fine")
    ) {
      const violations = legalData.violations.administrative
        .concat(legalData.violations.serious)
        .slice(0, 3);

      enhancedInfo.push(
        "Important violations to be aware of:\n" +
          violations
            .map((v) => `• ${v.violation}: ${v.penalty || v.consequence}`)
            .join("\n")
      );
    }

    // Check for rights and duties mentions
    if (
      input.includes("right") ||
      input.includes("duty") ||
      input.includes("obligation")
    ) {
      if (input.includes("right")) {
        enhancedInfo.push(
          "Key Rights:\n" +
            legalData.rightsDuties.rights
              .slice(0, 3)
              .map((r) => `• ${r}`)
              .join("\n")
        );
      }
      if (input.includes("duty") || input.includes("obligation")) {
        enhancedInfo.push(
          "Key Duties:\n" +
            legalData.rightsDuties.duties
              .slice(0, 3)
              .map((d) => `• ${d}`)
              .join("\n")
        );
      }
    }

    // If no specific matches but asking about general legal topics
    if (enhancedInfo.length === 0) {
      if (input.includes("register") || input.includes("registration")) {
        const randomProc = Object.values(legalData.registrationProcedures)[
          Math.floor(
            Math.random() *
              Object.values(legalData.registrationProcedures).length
          )
        ];
        enhancedInfo.push(
          `Important Registration Information - ${randomProc.name}:\n` +
            `Time limit: ${randomProc.timeLimit}\n` +
            `Key requirements:\n${randomProc.requirements
              .slice(0, 3)
              .map((r) => `• ${r}`)
              .join("\n")}`
        );
      }
    }

    return enhancedInfo.length > 0 ? enhancedInfo.join("\n\n") : null;
  }
}

export const lawService = new LawService();
export default lawService;
