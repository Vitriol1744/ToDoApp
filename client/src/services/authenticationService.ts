import Api from '@/api/api'

export type RegistrationCredentials =
    {
        firstName: string,
        lastName: string,
        password: string,
        phone: string,
        email: string,
        createdAt: string,
        updatedAt: string
    }

export default
{
    register(credentials: RegistrationCredentials) { return Api().post('/register', credentials); },
    login(credentials: { email: string, password: string }) { return Api().post('/login', credentials, { withCredentials: true }); },
    verifyUserToken() { return Api().post('/verify', null, { withCredentials: true }); }
}