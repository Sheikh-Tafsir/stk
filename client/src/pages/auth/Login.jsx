import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";
import { EyeOff, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from '@/components/ui/checkbox';
import { ButtonLoading } from '@/mycomponents/ButtonLoading';
import { useUserContext } from '@/context/UserContext';
import { saveAccessToken } from '@/utils/utils';
import { API } from '@/middleware/Api';

const Login = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState([]);
    const [isButtonLoading, setIsButtonLoading] = useState({ login: false, google: false });
    const [showPassword, setShowPassword] = useState(false);

    const saveTokenAndUser = (token) => {
        // console.log(token);
        saveAccessToken(token);
        const user = jwtDecode(token);
        setUser(user);
    }

    const handleError = (error) => {
        const responseErrors = error.response?.data || { message: error?.response?.data?.message };
        setErrors(responseErrors);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        setIsButtonLoading({ ...isButtonLoading, login: true });
        try {
            const response = await API.post(`/auth/login`,
                {
                    email,
                    password,
                    rememberMe,
                })

            //console.log(response);
            setEmail('');
            setPassword('');
            setRememberMe(false);
            setErrors([])

            saveTokenAndUser(response.data.data.accessToken);
        } catch (error) {
            console.log(error);
            handleError(error);
        } finally {
            setIsButtonLoading({ ...isButtonLoading, login: false });
        }
    };

    //google login
    const handleGoogleAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsButtonLoading({ ...isButtonLoading, google: true });
            try {
                const response = await API.post('/auth/google-login', {
                    token: tokenResponse.access_token,
                });

                //console.log(response.data);

                saveTokenAndUser(response.data.data.accessToken);
            } catch (err) {
                handleError(err);
            } finally {
                setIsButtonLoading({ ...isButtonLoading, google: false });
            }
        },
        onError: (err) => handleError(err),
    });

    useEffect(() => {
        if (user?.id) navigate(user?.role ? "/" : "/profile", { replace: true });
    }, [user, navigate]);

    return (
        <div className='lg:flex h-[100vh]  overflow-hidden'>
            <div className='flex w-full lg:w-[50%] h-full'>
                <Card className="mx-auto my-auto w-[420px] pb-8">
                    <form onSubmit={handleLogin}>
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>
                                Good to see you again
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex">Email<p className='text-red-600'>*</p></Label>
                                <Input id="email" type="email" placeholder="ex something12@gmail.com" value={email} onChange={(event) => { setEmail(event.target.value); }} />
                                <p className='validation-error'>{errors.email || ""}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex">Password<p className='text-red-600'>*</p></Label>
                                <div className='flex rounded-lg' style={{ border: "1px solid rgb(0,0,0,0.1)" }}>
                                    <Input type={showPassword ? "text" : "password"} placeholder="ex rahul123" value={password} onChange={(event) => { setPassword(event.target.value); }}
                                        className="w-[94%] border-none" />
                                    <span
                                        className="my-auto cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <Eye className='p-1' /> : <EyeOff className='p-1' />}
                                    </span>
                                </div>
                                <p className='validation-error'>{errors.password || ""}</p>
                            </div>

                            <div className='flex justify-between w-full'>
                                <div className="flex items-center space-x-2">
                                    <Checkbox onChange={(event) => { setRememberMe(!rememberMe) }} />
                                    <label
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Remember Me?
                                    </label>
                                </div>

                                <div className=''>
                                    <Link to="/auth/forgot-password" className='text-sm'>Forgot Password?</Link>
                                </div>
                            </div>
                    
                            <p className='validation-error'>{errors.message || ""}</p>
                        </CardContent>

                        <CardFooter className="">
                            {isButtonLoading.login ?
                                <ButtonLoading css={"w-full"} /> :
                                <Button type="submit" className="w-full"
                                    disabled={isButtonLoading.google}
                                >
                                    Login
                                </Button>
                            }

                        </CardFooter>
                    </form>

                    <p className='text-center mb-4'>or </p>
                    <div className='flex'>
                        {isButtonLoading.google ?
                            <ButtonLoading css={"w-[90%] mx-auto"} /> :
                            <Button onClick={handleGoogleAuth}
                                className="w-[90%] mx-auto flex" variant="outline"
                                disabled={isButtonLoading.login}
                            >
                                <FcGoogle className='my-auto mr-2 text-xl' />
                                <p>Google</p>
                            </Button>
                        }

                    </div>

                    <div className='flex mt-4'>
                        <Link to="/auth/signup" className='flex mx-auto text-sm'>
                            Don't have an account? <p className='text-blue-900 ml-1'>Signup</p>
                        </Link>
                    </div>
                </Card>
            </div>

            <div className='lg:w-[50%]'>
                <img src='https://img.freepik.com/premium-vector/illustration-cartoon-female-user-entering-login_241107-682.jpg?w=740'
                    className='cover h-full w-full' />
            </div>
        </div>
    )
}

export default Login;