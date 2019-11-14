import { applyDecorators } from "@tsed/core";
import { IResponseOptions, mapReturnedResponse, UseBefore } from "@tsed/common";
import Joi, { ValidationResult, SchemaMap, ValidationErrorItem } from '@hapi/joi';

import { capitalize, isEmptyObject } from '../../util/helper'
import { MESSAGE_VALIDATOR_VI, Language } from '../../util/language'

const LANGUAGES = [Language.Vietnamese as string, Language.English as string]

function validateRequest(req: any, rules: SchemaMap) {
    const parameters = { ...req.body, ...req.query, ...req.headers, ...req.params }
    let validateKeys = Object.keys(rules)

    for (const key in parameters) {
        if (!validateKeys.includes(key)) {
            delete parameters[key]
        }
    }

    const schema = Joi.object(rules)
    const result = schema.validate(parameters)
    return result
}

function handleLanguageRequest(req: any) {
    const query = req.query
    const defaultLanguage = 'en'

    if (!query && !query.lang) {
        return defaultLanguage
    }

    const requestLanguage = query.lang
    if (!LANGUAGES.includes(requestLanguage)) {
        return defaultLanguage
    }

    return requestLanguage
}

function getMessageEnglish(originMessage: string, originLabel: string): string {
    const labelCapitalized = capitalize(originLabel)
    const label = `"${labelCapitalized}"`
    const message = originMessage.replace(/\"[a-z]*\"/gm, label)
    return message
}

function getMessageWithCustomLabels(labels: Object, language: string, error: ValidationErrorItem): string {
    const originLabel = error.context.label
    const originKey = error.context.key
    const originType = error.type

    const label = labels[originKey] || originLabel

    if (language == Language.Vietnamese) {
        const originLimit = error.context.limit || false
        const message = `"${label}"` + MESSAGE_VALIDATOR_VI[originType](originLimit)
        return message
    } else {
        return getMessageEnglish(error.message, label)
    }
}

function handleMessage(language: string, error: ValidationErrorItem, labels: any): string {
    const originMessage = error.message
    const originLabel = error.context.label

    if (!isEmptyObject(labels)) {
        return getMessageEnglish(originMessage, originLabel)
    }

    if (language == Language.Vietnamese) {
        const labelsVietnamese = labels[Language.Vietnamese]
        if (!labelsVietnamese)
            return getMessageEnglish(originMessage, originLabel)

        return getMessageWithCustomLabels(labelsVietnamese, Language.Vietnamese, error)
    } else {
        const labelsEnglish = labels[Language.English]
        if (!labelsEnglish)
            return getMessageEnglish(originMessage, originLabel)
        return getMessageWithCustomLabels(labelsEnglish, Language.English, error)
    }
}

function handleResultValidate(result: ValidationResult<any>, req: any, labels: any): string {
    const language = handleLanguageRequest(req)

    if (!result || !result.error) return
    const errors = result.error.details
    if (!errors || !errors.length) return
    // Danh sach loi chi chua 1 error nen lay truc tiep phan tu 0
    const error = errors[0]
    const message = handleMessage(language, error, labels)
    return message
}

export function Validator(rules: SchemaMap, labels: Object = {}, options: IResponseOptions = {}) {
    const response = mapReturnedResponse(options);

    return applyDecorators(
        UseBefore((req: any, res: any, next: any) => {
            const result = validateRequest(req, rules)
            const message = handleResultValidate(result, req, labels)

            if (message) {
                return res.sendClientError(message)
            }
            next();
        })
    );
}
