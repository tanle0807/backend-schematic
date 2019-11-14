import { Server } from "./Server"

new Server().start()
    .then(() => {
    })
    .catch((err) => {
        console.error(err);
    })


