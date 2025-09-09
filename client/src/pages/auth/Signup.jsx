import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

import { Button } from "@/components/ui/button.jsx"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import { ButtonLoading } from '@/mycomponents/ButtonLoading';
import { useUserContext } from '@/context/UserContext';
import { API } from '@/middleware/Api';
import { saveAccessToken } from '@/utils/utils';

const Signup = () => {

    const navigate = useNavigate();
    const { user, setUser } = useUserContext();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [isButtonLoading, setIsButtonLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleError = (error) => {
        const responseErrors = error.response?.data || { global: error.message };
        setErrors(responseErrors);
    };

    const saveTokenAndUser = (token) => {
        //console.log(token);
        saveAccessToken(token);
        const user = jwtDecode(token);
        setUser(user);
    }
    
    const handleSave = async (e) => {
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            setErrors({ confirmPassword: "Password and confirm password don't match" });
            return;
        }

        setIsButtonLoading(true);

        try {
            const response = await API.post(`/auth/signup`, {
                ...formData,
            });

            //console.log(response.data);

            setFormData({
                name: '',
                email: '',
                password: '',
            });
            setConfirmPassword('');
            setErrors([]);

            saveTokenAndUser(response.data.data.accessToken);
        } catch (error) {
            console.log(error);
            handleError(error);
        } finally {
            setIsButtonLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) navigate(user?.role ? "/" : "/profile", { replace: true });
    }, [user, navigate]);

    return (
        <div className='lg:flex h-[100vh]'>
            <div className='lg:w-[50%]'>
                <img src='https://static.vecteezy.com/system/resources/thumbnails/005/879/539/small_2x/cloud-computing-modern-flat-concept-for-web-banner-design-man-enters-password-and-login-to-access-cloud-storage-for-uploading-and-processing-files-illustration-with-isolated-people-scene-free-vector.jpg'
                    className='cover h-full w-full' />
            </div>

            <div className='flex w-full lg:w-[50%] h-full'>
                <Card className="mx-auto my-auto w-[450px]">
                    <form onSubmit={handleSave}>
                        <CardHeader>
                            <CardTitle>Signup</CardTitle>
                            <CardDescription>
                                Register as user
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex">Name<p className='text-red-600'>*</p></Label>
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="John smith"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                <p className='validation-error'>{errors.name || ""}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex">Email<p className='text-red-600'>*</p></Label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="something12@gmail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <p className='validation-error'>{errors.email || ""}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex">Password<p className='text-red-600'>*</p></Label>
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="8 characters min"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <p className='validation-error'>{errors.password || ""}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="flex">Confirm Password<p className='text-red-600'>*</p></Label>
                                <Input type="password"
                                    name="confirmPassword"
                                    placeholder="8 characters min"
                                    value={confirmPassword}
                                    onChange={(event) => { setConfirmPassword(event.target.value); }}
                                />
                                <p className='validation-error'>{errors.confirmPassword || ""}</p>
                            </div>

                            <p className='validation-error'>{errors.global || ""}</p>
                        </CardContent>

                        <CardFooter className="flex-col">
                            {isButtonLoading ?
                                <ButtonLoading css={"w-full"} /> :
                                <Button type="submit" className="w-full"
                                    style={{ backgroundColor: 'rgb(24,62,139)' }}>Save</Button>
                            }
                            <div className='flex mt-4'>
                                <Link to="/auth/login" className='flex mx-auto text-sm'>
                                    Already have an account? <p className='text-blue-900 ml-1'>Login</p>
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default Signup;