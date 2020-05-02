import { runOneTestCase, runTestCases } from "./testCaseRunner";
import contactQuestionWithDateVariableAndSkippingQuestion
  from "../test/testCases/contactQuestionWithDateVariableAndSkippingQuestion.questionnaire";
import { Questionnaire, TestCase } from "covquestions-js/models/questionnaire";
import simpleBooleanContactQuestion from "../test/testCases/simpleBooleanContactQuestion.questionnaire";
import simpleMultiselectSymptomsQuestion from "../test/testCases/simpleMultiselectSymptomsQuestion.questionnaire";
import simpleNumericAgeQuestion from "../test/testCases/simpleNumericAgeQuestion.questionnaire";
import simpleSelectGenderQuestion from "../test/testCases/simpleSelectGenderQuestion.questionnaire";
import simpleTextQuestion from "../test/testCases/simpleTextQuestion.questionnaire";

function runTestCasesFor(questionnaire: Questionnaire) {
  if (questionnaire.testCases === undefined) {
    throw Error("No test cases provided");
  }

  const expectEveryTestCaseToPass = questionnaire.testCases.map(({ description }) => ({
    description,
    success: true,
  }));

  const results = runTestCases(questionnaire);

  expect(results).toEqual(expectEveryTestCaseToPass);
}

describe("testCaseRunner", () => {
  it("should run all test cases for contactQuestionWithDateVariableAndSkippingQuestion", () => {
    runTestCasesFor(contactQuestionWithDateVariableAndSkippingQuestion);
  });
  it("should run all test cases for simpleBooleanContactQuestion", () => {
    runTestCasesFor(simpleBooleanContactQuestion);
  });

  it("should run all test cases for simpleMultiselectSymptomsQuestion", () => {
    runTestCasesFor(simpleMultiselectSymptomsQuestion);
  });

  it("should run all test cases for simpleNumericAgeQuestion", () => {
    runTestCasesFor(simpleNumericAgeQuestion);
  });

  it("should run all test cases for simpleSelectGenderQuestion", () => {
    runTestCasesFor(simpleSelectGenderQuestion);
  });

  it("should run all test cases for simpleTextQuestion", () => {
    runTestCasesFor(simpleTextQuestion);
  });

  describe("questionMode", () => {
    const testCaseWithMissingOptionalAnswers: TestCase = {
      description: "Skipping the optional question should be possible",
      answers: {},
      results: {},
    };

    const testCaseWithTooManyAnswer: TestCase = {
      description: "Skipping the optional question should be possible",
      answers: { q1_text: "strange text", someOtherId: "something" },
      results: {},
    };

    it("should succeed to run in normal mode (default), if not all optional answers are provided", () => {
      const result = runOneTestCase(simpleTextQuestion, testCaseWithMissingOptionalAnswers);

      expect(result).toEqual({
        description: testCaseWithMissingOptionalAnswers.description,
        success: true,
      });
    });

    it("should fail to run in strict mode, if not all answers are provided", () => {
      const result = runOneTestCase(simpleTextQuestion, {
        ...testCaseWithMissingOptionalAnswers,
        options: { questionMode: "strict" },
      });

      expect(result).toEqual({
        description: testCaseWithMissingOptionalAnswers.description,
        errorMessage: 'No answer for question with ID "q1_text" was provided, while questionMode is strict.',
        success: false,
      });
    });

    it("should succeed to run in normal mode, if too many answers are provided", () => {
      const result = runOneTestCase(simpleTextQuestion, testCaseWithTooManyAnswer);

      expect(result).toEqual({
        description: testCaseWithTooManyAnswer.description,
        success: true,
      });
    });

    it("should fail to run in strict mode, if too many answers are provided", () => {
      const result = runOneTestCase(simpleTextQuestion, {
        ...testCaseWithTooManyAnswer,
        options: { questionMode: "strict" },
      });

      expect(result).toEqual({
        description: testCaseWithTooManyAnswer.description,
        errorMessage: 'Not all provided answer were needed to fill the questionnaire: ["someOtherId"]',
        success: false,
      });
    });
  });

  describe("resultsMode", () => {
    const testCaseWithoutAllResults: TestCase = {
      description: "Skipping the optional question should be possible",
      answers: { q1_text: "test" },
      results: { rc_text: "TEXT" },
    };

    const questionnaireWithTwoResultCategories: Questionnaire = {
      ...simpleTextQuestion,
      resultCategories: [
        ...simpleTextQuestion.resultCategories,
        {
          id: "additionalCategory",
          description: "something",
          results: [{ id: "additionalResult", text: "some text", value: true }],
        },
      ],
    };

    it("should succeed to run in normal mode, if not all results are provided", () => {
      const result = runOneTestCase(questionnaireWithTwoResultCategories, testCaseWithoutAllResults);

      expect(result).toEqual({
        description: testCaseWithoutAllResults.description,
        success: true,
      });
    });

    it("should fail to run in strict mode, if too many answers are provided", () => {
      const result = runOneTestCase(questionnaireWithTwoResultCategories, {
        ...testCaseWithoutAllResults,
        options: { resultsMode: "strict" },
      });

      expect(result).toEqual({
        description: testCaseWithoutAllResults.description,
        errorMessage:
          'The execution provided additional results in strict mode: "additionalCategory: additionalResult"',
        success: false,
      });
    });

    it("should fail to run in normal mode, if wrong result is provided", () => {
      const result = runOneTestCase(simpleTextQuestion, {
        description: "Failing test",
        answers: { q1_text: "test" },
        results: { rc_text: "WRONG_RESULT_ID" },
      });

      expect(result).toEqual({
        description: "Failing test",
        success: false,
        errorMessage: 'Wrong results "rc_text: TEXT" vs "rc_text: WRONG_RESULT_ID"',
      });
    });
  });
});
