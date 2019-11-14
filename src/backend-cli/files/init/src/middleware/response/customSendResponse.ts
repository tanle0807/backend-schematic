import { OverrideProvider, Res, ResponseData, SendResponseMiddleware } from "@tsed/common";

@OverrideProvider(SendResponseMiddleware)
export class customDefaultResponse extends SendResponseMiddleware {
    public use(@ResponseData() data: any, @Res() response: Res): any {
        let message = ""
        if (data && data.message) {
            message = data.message
            delete data.message
        }
        const originalResult = super.use({ data: { ...data }, message, status: true }, response);

        return { data: originalResult, errors: [] };
    }
}
