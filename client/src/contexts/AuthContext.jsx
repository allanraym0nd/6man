import React, {createContext, useContext, useReducer, useEffect} from "react";
import { apiService } from "../services/api";

const AuthContext = createContext()

const authReducer = (state,action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {...state, loading:true, error:null};
        case 'LOGIN_SUCCESS':
            return {
                ...state, 
                loading:false,
                user:action.payload.user,
                token:action.payload.token,
                isAuthenticated:true,
                error:null
            };
            case 'LOGIN_ERROR':
                return {
                    ...state, 
                    loading:false,
                    error: action.payload,
                    isAuthenticated:false,
            
                };
            case 'LOGOUT':
                    return { 
                        ...state, 
                        user: null, 
                        token: null, 
                        isAuthenticated: false,
                        error: null 
                 };
            case 'CLEAR_ERROR':
                return {
                    ...state,
                    error:null

                }
            case 'UPDATE_USER':
                return {
                    ...state,
                    user:action.payload
                };
                default:
                    return state;          

    }
}


const initialState = {
    user:null,
    token:null,
    isAuthenticated:false,
    loading:false,
    error:null
}

export const AuthProvider = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect (() => {
        const token = localStorage.getItem("token")
        const userData = localStorage.getItem("userData")

        if(token && userData) { 
            try {
                const user = JSON.parse(userData)
                dispatch({
                    type:'LOGIN_SUCCESS',
                    payload:{user,token}

                })
            }catch(error) {
                localStorage.removeItem("token")
                 localStorage.removeItem("userData")

            }
        }
    }, []);

    const login = async(email, password) => {
        try {
            dispatch({type: 'LOGIN_START'})

            const response = await apiService.login(email,password)
            const {token, user} = response.data

            localStorage.getItem("token", token)
            localStorage.setItem("userData", JSON.stringify(user))

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {user,token}
            })
            return {success: true}
        }catch(error) {
            const errorMessage = error.response?.data?.message || 'Login Failed'
            dispatch({
                type: 'LOGIN_ERROR',
                payload: errorMessage
            })

            return {success: false, error: errorMessage}
        }
    }

    const signup = async (userData) => {
        try {
            dispatch({
                type:"LOGIN_START"
            })

             const response = await apiService.signup(userData);
             const { token, user } = response.data;

             localStorage.setItem('token', token);
             localStorage.setItem('userData', JSON.stringify(user))
             
             dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token }
            });

            return {success: true}

        }catch(error) {
            const errorMessage = error.response?.data?.message || 'Signup failed';
            dispatch: ({
                type: 'LOGIN_ERROR',
                payload: errorMessage

            }); 
            return {success: false, error:errorMessage}

        }
    }


    const logout = () => {
        localStorage.removeItem("token"); 
        localStorage.removeItem("userData");
        dispatch({type:'LOGOUT'})
    }

    const clearError = () => {
        dispatch({type: 'CLEAR_ERROR'})

    }

    const updateUser = (userData) => {
        const updatedUser = {...state.user, ...userData}
        localStorage.setItem("userData", JSON.stringify(updatedUser))
        dispatch({type: 'UPDATE_USER', payload:updatedUser})
    }


    return (
        <AuthContext.Provider value={{
            ...state, 
            login,
            signup,
            logout,
            clearError,
            updateUser
        }}> 
        {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context){
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context;
}

//  calls useContext to retrieve the value provided by the AuthProvider.