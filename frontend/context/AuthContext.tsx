'use client'
import { createContext, useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode";
import { UserData } from '@/types/UserData';


interface TokenType {
    token?: string;
    refresh?: string;
    detail?:string;
}

interface LoginReturnType{
    success:boolean,
    detail:string,
}

interface AuthContextType {
    userInfo: UserData | null;
    user: any;
    authTokens: TokenType | null;
    loginUser: (formData: { email: string; password: string }) => Promise<LoginReturnType>;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
    userInfo: null,
    user: null,
    authTokens: null,
    loginUser: async () => {
        throw new Error("loginUser must be used within an AuthProvider");
    },
    logoutUser: () => {
        throw new Error("logoutUser must be used within an AuthProvider");
    }
}) 
export default AuthContext;


export const AuthProvider = ({children}:{ children: React.ReactNode }) =>{
    const [authTokens, setAuthTokens] = useState<TokenType | null>(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [userInfo, setUserInfo] = useState<UserData | null>(null)

    const fetchUserData = async (token:string) =>{
        const response = await fetch('http://localhost:8000/user/',{
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
        let data = await response.json()

        try {
            setUserInfo(data)
        }
        catch {
            throw new Error('Something is wrong with this account!')
        }
    }

    const loginUser = async (formData: { email: string; password: string })=>{ 
        const response = await fetch('http://localhost:8000/login/',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'email':formData.email, 'password':formData.password})
        })
        let data = await response.json()
        
        try {
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            console.log(jwtDecode(data.access))
            localStorage.setItem('authTokens', JSON.stringify(data))
            await fetchUserData(data.access)
            return {
                success: true,
                detail: data.detail ?? 'Logged in!'
            }
        }
        catch {
            return{
                success: false,
                detail: data.detail ?? 'Something went wrong'
            }
        }
    }

    const logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
    }


    const updateToken = async ()=> {
        if(authTokens?.refresh){
            const response = await fetch('http://localhost:8000/api/token/refresh/', {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({'refresh':authTokens?.refresh})
            })

            const data = await response.json()
            
            if (response.status === 200){
                setAuthTokens(data)
                setUser(jwtDecode(data.access))
                localStorage.setItem('authTokens', JSON.stringify(data))
            }else{
                logoutUser()
            }
        }

        if(loading){
            setLoading(false)
        }
    }

    const contextData = {
        userInfo:userInfo,
        user:user,
        authTokens:authTokens,
        loginUser:loginUser,
        logoutUser:logoutUser,
    }



    useEffect(()=> {

        if(loading){
            updateToken()
        }

        const fourMinutes = 1000 * 60 * 4

        const interval =  setInterval(()=> {
            if(authTokens){
                updateToken()
            }
        }, fourMinutes)
        return ()=> clearInterval(interval)

    }, [authTokens, loading])

    return(
        <AuthContext.Provider value={contextData} >
            {loading ? null : children}
        </AuthContext.Provider>
    )
};