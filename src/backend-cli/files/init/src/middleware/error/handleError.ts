import { Request, Response, NextFunction } from "express";
import logger from '../../util/logger'
import moment from 'moment';

function generateRequestID(): string {
    const timestamp = moment().valueOf()
    const requestId = `REQ-${timestamp}`
    return requestId
}

function logRequest(req: Request, err: any) {
    const statusCode = err.status || 500

    const messageSummary = `Request: ${req.method} ${req.url} - CODE: ${statusCode}`
    const messageError = `${err.stack}`
    const messageHeader = `Headers: ${JSON.stringify(req.headers, null, "\t")}`
    const messageBody = `Body: ${JSON.stringify(req.body, null, "\t")}`
    const messageQuery = `Query: ${JSON.stringify(req.query, null, "\t")}`

    logger('error').error(`\n${messageSummary}\n${messageHeader}\n${messageBody}\n${messageQuery}\n${messageError}`)
}

export default function handleError(err: any, req: Request, res: Response, next: NextFunction) {
    const statusCode = err.status || 500
    const message = err.message || "Server error!"

    logRequest(req, err)
    return res.status(statusCode).send({ message, data: {}, status: false })
}
