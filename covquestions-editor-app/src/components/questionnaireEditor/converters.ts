import { CovscriptGenerator, CovscriptToJsonLogicConverter } from "@covopen/covscript";
import { LogicExpression, Questionnaire } from "@covopen/covquestions-js";
import { EditorQuestionnaire, EditorQuestionnaireMeta } from "../../models/editorQuestionnaire";
import { indentCovScript } from "./indentCovScript";

export function convertLogicExpressionToString(value?: LogicExpression): string {
  const generator = new CovscriptGenerator();
  if (value === undefined) {
    return "";
  }

  return indentCovScript(generator.generate(value));
}

export function convertStringToLogicExpression(value?: string): LogicExpression | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  const parser = new CovscriptToJsonLogicConverter();

  return parser.parse(value);
}

export function addStringRepresentationToQuestionnaire(questionnaire: Questionnaire): EditorQuestionnaire {
  return {
    ...questionnaire,
    questions: questionnaire.questions.map((question) => {
      let enableWhenExpressionString;
      try {
        enableWhenExpressionString = convertLogicExpressionToString(question.enableWhenExpression);
      } catch (error) {
        console.log("Cannot convert expression of question to string", error);
      }
      return {
        ...question,
        enableWhenExpressionString,
      };
    }),
    resultCategories: questionnaire.resultCategories.map((resultCategory) => ({
      ...resultCategory,
      results: resultCategory.results.map((result) => {
        let expressionString;
        try {
          expressionString = convertLogicExpressionToString(result.expression);
        } catch (error) {
          console.log("Cannot convert expression of result to string", error);
        }
        return {
          ...result,
          expressionString,
        };
      }),
    })),
    variables: questionnaire.variables.map((variable) => {
      let expressionString;
      try {
        expressionString = convertLogicExpressionToString(variable.expression);
      } catch (error) {
        console.log("Cannot convert expression of variable to string", error);
      }
      return {
        ...variable,
        expressionString,
      };
    }),
  };
}

export function removeStringRepresentationFromQuestionnaire(questionnaire: EditorQuestionnaire): Questionnaire {
  return {
    ...questionnaire,
    questions: questionnaire.questions.map((question) => {
      const { enableWhenExpressionString, ...rest } = question;
      return rest;
    }),
    resultCategories: questionnaire.resultCategories.map((resultCategory) => ({
      ...resultCategory,
      results: resultCategory.results.map((result) => {
        const { expressionString, ...rest } = result;
        return rest;
      }),
    })),
    variables: questionnaire.variables.map((variable) => {
      const { expressionString, ...rest } = variable;
      return rest;
    }),
  };
}

export function addRootPropertiesToMetaObject(questionnaire: Questionnaire): EditorQuestionnaireMeta {
  return {
    ...questionnaire.meta,
    language: questionnaire.language,
    title: questionnaire.title,
  };
}

export function moveRootPropertiesToQuestionnaire(
  questionnaire: Questionnaire,
  editorMeta: EditorQuestionnaireMeta
): Questionnaire {
  const { title, language, ...meta } = editorMeta;
  questionnaire.meta = meta;
  questionnaire.title = title;
  questionnaire.language = language;
  return questionnaire;
}
