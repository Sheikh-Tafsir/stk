import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuestionCreate from './QuestionCreateComponent';
import { QUESTION_OPTION_MAP, TOAST_TYPE } from '@/utils/enums';
import { Label } from '@/components/ui/label';
import { API } from '@/middleware/Api';
import { ToastAlert } from '@/mycomponents/ToastAlert';
import { ButtonLoading } from '@/mycomponents/ButtonLoading';
import { initialToastState } from '@/utils/utils';
import { Link, useSearchParams } from 'react-router-dom';
import InputViewMode from '@/mycomponents/InputViewMode';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';

const QuizCreate = () => {
    const [searchParams] = useSearchParams();
    const queryParams = Object.fromEntries(searchParams.entries());

    const difficulty = queryParams.difficulty || "";
    const course = queryParams.course || "";

    const [quiz, setQuiz] = useState({});
    const [questions, setQuestions] = useState([]);
    const [errors, setErrors] = useState({});
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await API.get("/quizes", {
                    params: { course, difficulty } // <-- correct syntax
                });

                //console.log(response.data.data);
                const quizData = response.data.data;
                if (quizData) {
                    setQuiz(quizData);
                    setQuestions(quizData.questions)
                }
            } catch (error) {
                console.error("Error fetching quiz:", error);
                showToast("Could not get quiz", TOAST_TYPE.ERROR);
            } finally {
                setIsPageLoading(false);
            }
        };

        if (course && difficulty) {
            fetchQuiz();
        }
    }, [difficulty, course]);

    const handleSubmit = async () => {
        if (questions.length < 1) {
            setErrors({ questions: "Add at least one question" });
            return;
        }

        setIsButtonLoading(true);

        try {
            await API.post('/quizes', { course, difficulty, questions });

            setQuestions([]);
            setErrors({});
            showToast("Quiz created successfully", TOAST_TYPE.SUCCESS);
        } catch (error) {
            console.log(error);
            setErrors(error.response?.data || { message: error.message });
        } finally {
            setIsButtonLoading(false);
        }
    };

    const showToast = (message, type) => setToastData({ message, type, id: Date.now() });

    const handleDelete = (index) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            {isPageLoading && <PageLoadingOverlay />}

            <div className="container min-h-[90vh] space-y-4 pb-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Quiz Builder ({questions.length}/5 Questions)</CardTitle>
                    </CardHeader>

                    <CardContent className="flex gap-4 mt-4">
                        <div className="space-y-2 w-[50%]">
                            <Label>Course</Label>
                            <InputViewMode value={course} isEditable={true} />
                            <p className="text-red-500 text-sm">{errors.course}</p>
                        </div>

                        <div className="space-y-2 w-[50%]">
                            <Label>Difficulty</Label>
                            <InputViewMode value={difficulty} isEditable={true} />
                            <p className="text-red-500 text-sm">{errors.difficulty}</p>
                        </div>
                    </CardContent>
                </Card>

                {!quiz?.id && <QuestionCreate setQuestions={setQuestions} />}

                {questions.length > 0 && (
                    <Card as="form" onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Preview Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={index} className="border p-3 rounded-md space-y-2">
                                    <p className="font-semibold">
                                        Q{index + 1}. {q.questionText}
                                    </p>
                                    <ul className="list-disc list-inside pl-4 space-y-1">
                                        {QUESTION_OPTION_MAP.map(opt => (
                                            <li key={opt} className={q.correctAnswer === opt ? "font-bold text-green-600" : ""}>
                                                {opt.toUpperCase()}: {q[opt]}
                                            </li>
                                        ))}
                                    </ul>

                                    {!quiz?.id &&
                                        <Button type="button" variant="destructive" onClick={() => handleDelete(index)}>
                                            Delete
                                        </Button>
                                    }
                                </div>
                            ))}
                        </CardContent>

                        {questions.length > 0 && !quiz?.id && (
                            <CardFooter>
                                {isButtonLoading ? (
                                    <ButtonLoading css="w-full" />
                                ) : (
                                    <>
                                        <p>{errors.message}</p>
                                        <Button className="w-full bg-blue-600" onClick={() => handleSubmit()}>
                                            Save Quiz
                                        </Button>
                                    </>
                                )}
                            </CardFooter>
                        )}
                    </Card>
                )}

                <div className='flex'>
                    <Link to="/quizes/select" className="w-full text-center mt-2 text-sm underline">Back to select</Link>
                </div>
            </div>

            {toastData.message && <ToastAlert key={toastData.id} message={toastData.message} type={toastData.type} />}
        </>
    );
};

export default QuizCreate;
