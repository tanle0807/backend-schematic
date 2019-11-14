const SECOND_IN_A_YEAR = 60 * 60 * 24 * 30 * 12

const config = {
    APPLICATION_NAME: 'HFV',
    ENV: 'dev',
    PORT: 4050,
    HOST: '192.168.1.123',
    PREFIX_TABLE: 'ep_',
    JWT_SECRET: 'NEETEAM_056_HFV',
    JWT_EXPIRE: SECOND_IN_A_YEAR, // 1 YEAR
    LOG_PATH: './log',
    UPLOAD_DIR: "uploads",
    STATIC_DIR: "./uploads",
    PREFIX_URL: "/v1",
    TYPE_ORM: {
        type: 'mysql',
        host: '192.168.1.50',
        port: 3306,
        username: 'username',
        password: 'password',
        database: '056hfv',
        bigNumberStrings: false,
        name: 'default',
        synchronize: true,
        entities: [
            `${__dirname}/src/entity/*{.ts,.js}`
        ],
        migrations: [
            `${__dirname}/src/migrations/*{.ts,.js}`
        ],
        subscribers: [
            `${__dirname}/src/subscriber/*{.ts,.js}`
        ]
    }
}
export default config
