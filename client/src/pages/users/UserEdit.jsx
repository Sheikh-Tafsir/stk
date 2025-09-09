import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button.jsx';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.jsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.jsx"
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import StaredLabel from '@/mycomponents/StaredLabel';
import { API } from '@/middleware/Api';
import { ButtonLoading } from "@/mycomponents/ButtonLoading";
import ImageInput from '@/mycomponents/ImageInput';
import { TOAST_TYPE, USER_ROLE, PARTICIPANT_TYPE } from '@/utils/enums';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';
import { ToastAlert } from '@/mycomponents/ToastAlert';
import { initialToastState } from '@/utils/utils';
import InputViewMode from '@/mycomponents/InputViewMode';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

const UserEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEditable = location.pathname.endsWith("/edit");

    const [user, setUser] = useState({});
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState({ page: true, button: false });
    const [toastData, setToastData] = useState(initialToastState);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await API.get(`/users/${id}`);
                //console.log(response.data.data);
                setUser(response.data.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
                handleError(error);
            } finally {
                setIsLoading((prev) => ({ ...prev, page: false }));
            }
        };

        fetchProfile();
    }, []);

    const prepareFormData = () => {
        const fd = new FormData();
        Object.entries(user).forEach(([key, val]) => {
            if (val) fd.append(key, val);
        });

        if (image) fd.append('image', image);

        return fd;
    }

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading((prev) => ({ ...prev, button: true }));
        setErrors([]);

        try {
            await API.put(`/users/${id}`, prepareFormData(), {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 20000
            });

            showToast("Successfully Updated", TOAST_TYPE.SUCCESS);
        } catch (error) {
            console.error("Error updating user:", error);
            handleError(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, button: false }));
        }
    }

    const handleError = (error) => {
        setErrors(error.response?.data || { message: error.message });
    };

    const showToast = (message, type) => {
        setToastData({ message, type, id: Date.now() }) // ensure uniqueness
    }

    return (
        <div className="min-h-[100vh] flex pb-4">
            <Card className="mx-auto my-auto w-[450px]">
                <form onSubmit={handleSave}>
                    <fieldset disabled={!isEditable}>
                        <CardHeader>
                            <CardTitle>{isEditable ? "Edit" : "View"} User</CardTitle>
                        </CardHeader>
                        {isLoading.page && <PageLoadingOverlay />}

                        <CardContent className="space-y-4">
                            <ImageInput
                                existingImage={user.image}
                                onImageChange={setImage}
                                error={errors.image}
                            />

                            <div className="space-y-1">
                                <Label>Email</Label>
                                <InputViewMode value={user?.email} isEditable={isEditable} />
                            </div>

                            <div className="space-y-1">
                                <StaredLabel label="Name" />
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Md Rafiquddin"
                                    value={user.name || ""}
                                    onChange={(e) => setUser((prev) => ({ ...prev, "name": e.target.value }))}
                                />
                                {errors.name && <p className="validation-error">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Role</Label>
                                <InputViewMode value={user?.role} isEditable={isEditable} />
                            </div>

                            <div className="space-y-1">
                                <Label>Phone No</Label>
                                <Input
                                    name="phoneNo"
                                    placeholder="01..."
                                    value={user.phone || ""}
                                    onChange={(e) => setUser((prev) => ({ ...prev, "phone": e.target.value }))}
                                    type="text"
                                />
                                {errors.phone && <p className="validation-error">{errors.phone}</p>}
                            </div>

                            {(user?.role == USER_ROLE.CARE_GIVER) &&
                                <div className="space-y-1">
                                    <Label>Assigned patients: </Label>
                                    <InputViewMode value={user?.participantCount} isEditable={isEditable} />
                                </div>
                            }

                            {user?.role == USER_ROLE.PATIENT &&
                                <>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="age">Age</Label>
                                        <Input
                                            id="age"
                                            placeholder="Participant Age"
                                            value={user.age || ''}
                                            onChange={(e) => setUser((prev) => ({ ...prev, "age": e.target.value }))}
                                            type="number"
                                        />
                                        {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
                                    </div>

                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select onValueChange={(value) => setUser((prev) => ({ ...prev, "gender": value }))} value={user.gender || ""}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value={null}>Select Gender</SelectItem>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                                    </div>

                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="type">Type</Label>
                                        <Select onValueChange={(value) => setUser((prev) => ({ ...prev, "type": value }))} value={user.type || ""}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value={null}>Select Type</SelectItem>
                                                    {Object.values(PARTICIPANT_TYPE).map((item) => (
                                                        <SelectItem key={item} value={item} className="cursor-pointer">
                                                            {item}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <p className="validation-error">{errors.type}</p>
                                    </div>

                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="expCount">Experiments done</Label>
                                        <InputViewMode value={user?.expCount} isEditable={isEditable} />
                                    </div>

                                    {user.predictedType &&
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="prediction">Predicted Type</Label>
                                            <InputViewMode value={user?.predictedType} isEditable={isEditable} />
                                        </div>
                                    }

                                    {user.predictionConfidence &&
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="predictionConfidence">Prediction Confidence</Label>
                                            <InputViewMode value={user?.predictionConfidence} isEditable={isEditable} />
                                        </div>
                                    }
                                </>
                            }

                            {errors.global && <p className="validation-error">{errors.global}</p>}
                        </CardContent>
                    </fieldset>

                    <CardFooter className="flex-col">
                        {!isEditable ?
                            <Button type="button" className="w-full" onClick={() => navigate(`edit`)}>Edit</Button>
                            :
                            isLoading.button ?
                                <ButtonLoading css={"w-full"} /> :
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-900">Save</Button>

                        }
                        <Link to="/users" className="w-full text-center mt-2 text-sm underline">
                            Back to User List
                        </Link>
                    </CardFooter>
                </form>
            </Card>
            {toastData.message && (
                <ToastAlert
                    key={toastData.id}
                    message={toastData.message}
                    type={toastData.type}
                />
            )}
        </div>
    );
};

export default UserEdit;