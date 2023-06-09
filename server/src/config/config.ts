module.exports =
{
    port: process.env.PORT || 3003,
    db:
    {
        database: process.env.DB_NAME || 'todoapp',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        options:
        {
            dialect: process.env.DIALECT || 'sqlite',
            host: process.env.HOST || 'localhost',
            storage: './todoapp.sqlite'
        }
    }
}