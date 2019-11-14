import { ServerLoader, ServerSettings, GlobalAcceptMimesMiddleware, Err } from "@tsed/common";
import Path from "path";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import cors from 'cors';
import methodOverride from 'method-override';
import "@tsed/swagger";
import "@tsed/socketio";
import timezone from 'moment-timezone';
import "@tsed/multipartfiles";
import multer from "multer";
import moment from "moment";

import config from '../config'
import responseAPI from './middleware/response/responseAPI';
import handleError from "./middleware/error/handleError";
import handleNotFound from "./middleware/error/handleNotFound";
import './middleware/response/customSendResponse';
import fs from 'fs';
import md5 from 'md5';
import logger from './util/logger';

//---------------------------------
//     Config port - SSL
//---------------------------------
const rootDir = __dirname;
let httpsOptions = {}
let port = {}
if (config.ENV == 'product') {
    httpsOptions = {
        cert: fs.readFileSync(__dirname + "/ssl/certificate.crt"),
        key: fs.readFileSync(__dirname + "/ssl/private.key"),
        ca: fs.readFileSync(__dirname + "/ssl/certificate-ca.crt")
    }
    port = {
        httpsPort: `${config.HOST}:${config.PORT}`,
        httpPort: false
    }
} else {
    port = {
        httpPort: `${config.HOST}:${config.PORT}`,
        httpsPort: false
    }
}
//---------------------------------
//     Config multer
//---------------------------------

const storage = multer.diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {

        let controller = req.ctx.endpoint.targetName
        let des = controller.replace("Controller", "").toLowerCase()
        if (!des) {
            callback(new Error("Wrong controller"), null);
        }
        callback(null, `${config.UPLOAD_DIR}/${des}`)
    },
    filename: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
        if (!file.mimetype.includes("image")) {
            return callback(new Error("Invalidate file's extend name "), null)
        }
        callback(null, md5(file.filename + moment().valueOf().toString()) + Path.extname(file.originalname))
    }

});
//---------------------------------
//     Config server
//---------------------------------
const prefix = config.PREFIX_URL
const option = {
    httpsOptions,
    rootDir,
    socketIO: {

    },
    statics: {
        "/": `${config.STATIC_DIR}`
    },
    acceptMimes: ["application/json"],
    mount: {
        [prefix]: `${rootDir}/controllers/**/**Controller.{ts,js}`
    },
    swagger: [
        {
            path: "/docs_admin",
            doc: "docs_admin"
        },
        {
            path: "/docs_customer",
            doc: "docs_customer"
        },
        {
            path: "/docs_driver",
            doc: "docs_driver"
        }
    ],
    typeorm: [
        config.TYPE_ORM
    ],
    multer: {
        storage,
    },

}


//---------------------------------
//     Config timezone
//---------------------------------
timezone.tz.setDefault("Asia/Ho_Chi_Minh");


@ServerSettings({ ...option, ...port })
export class Server extends ServerLoader {

    /**
     * This method let you configure the middleware required by your application to works.
     * @returns {Server} 
     */
    public $onMountingMiddlewares(): void | Promise<any> {
        this
            .use(GlobalAcceptMimesMiddleware)
            .use(cors())
            .use(compression())
            .use(methodOverride())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
                extended: true
            }))
            .use(responseAPI)

        return null;
    }

    public $onReady() {
        console.log('..........................................................................................');
        console.log('......................................SERVER STARTED......................................');
        console.log('..........................................................................................');
        logger('info').info(`SERVER RESTART AT ${moment().format("YYYY-MM-DD HH:mm:ss")}`)
    }

    public $afterRoutesInit() {
        this.use(handleNotFound)
            .use(handleError)
    }

    public $onServerInitError(err: any) {
        console.error(err);
    }
}

// new Server().start();
// 