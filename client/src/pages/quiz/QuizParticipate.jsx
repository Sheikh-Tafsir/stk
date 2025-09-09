import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { API } from "@/middleware/Api";
import { ToastAlert } from "@/mycomponents/ToastAlert";
import { initialToastState } from "@/utils/utils";
import { ButtonLoading } from "@/mycomponents/ButtonLoading";
import { QUESTION_OPTION_MAP, TOAST_TYPE } from "@/utils/enums";
import PageLoadingOverlay from "@/mycomponents/pageLoadingOverlay/PageLoadingOverlay";

const QuizParticipate = () => {
    const [searchParams] = useSearchParams();
    const queryParams = Object.fromEntries(searchParams.entries());

    const course = queryParams.course || "";
    const difficulty = queryParams.difficulty || "";

    const [quiz, setQuiz] = useState({
        participated: false,
        questions: [],
    });
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);
    const [score, setScore] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await API.get(`/quizes?course=${course}&difficulty=${difficulty}`);
                const data = response.data.data;
                if (!data) {
                    return;
                }
                //console.log(data)

                // Pre-fill answers if they exist
                const preFilledAnswers = {};
                data.questions.forEach((q) => {
                    if (q.answer) {
                        preFilledAnswers[q.id] = q.answer; // backend sends { answer: "a" }
                    }
                });

                setQuiz(data);
                setAnswers(preFilledAnswers);
            } catch (err) {
                console.error(err);
                showToast("Failed to load quiz", TOAST_TYPE.ERROR);
            } finally {
                setIsPageLoading(false);
            }
        };
        
        fetchQuiz();
    }, [course, difficulty]);


    const handleSelect = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Calculate score locally
            let correctCount = 0;
            quiz.questions.forEach((q) => {
                if (answers[q.id] === q.correctAnswer) {
                    correctCount++;
                }
            });

            setScore(correctCount);


            // Transform answers into array of {questionId, answer}
            const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer,
            }));

            // Send results to backend
            await API.post(`/quizes/${quiz.id}/participate`, {
                answers: formattedAnswers,
            });

            setToastData({
                message: "Quiz data saved",
                type: TOAST_TYPE.SUCCESS,
                id: Date.now(),
            });
        } catch (err) {
            console.error(err);
            setToastData({
                message: "Error submitting quiz",
                type: TOAST_TYPE.ERROR,
                id: Date.now(),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const showToast = (message, type) => setToastData({ message, type, id: Date.now() });

    // if (!isPageLoading && !quiz.course) {

    // }
    return (
        <>
            {isPageLoading && <PageLoadingOverlay />}

            <div className="container min-h-[90vh] pt-6 space-y-4">
                <Card className="pb-4">
                    <CardHeader>
                        <CardTitle>
                            {course} Quiz ({difficulty})
                        </CardTitle>
                    </CardHeader>

                    {!isPageLoading && !quiz.course ?
                        <CardContent className="space-y-6">
                            <p>Quiz question not published</p>
                        </CardContent>
                        :
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                {quiz?.questions.map((q, index) => (
                                    <div key={q.id} className="border p-4 rounded space-y-3">
                                        <p className="font-semibold">
                                            Q{index + 1}. {q.questionText}
                                        </p>
                                        <RadioGroup
                                            value={answers[q.id] || ""}
                                            onValueChange={(val) => handleSelect(q.id, val)}
                                        >
                                            {QUESTION_OPTION_MAP.map((opt) => (
                                                <div key={opt} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                                                    <Label htmlFor={`${q.id}-${opt}`}>
                                                        {opt.toUpperCase()}: {q[opt]}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                ))}
                            </CardContent>

                            {!quiz?.participated && quiz.course &&
                                <CardFooter>
                                    {isSubmitting ? (
                                        <ButtonLoading css="w-full" />
                                    ) : (
                                        <Button type="submit" className="w-full bg-blue-600">
                                            Submit
                                        </Button>
                                    )}
                                </CardFooter>
                            }
                        </form>
                    }

                    <div className="flex">
                        <Link to="/quizes/select" className="mx-auto mt-2 text-sm underline">Go back</Link>
                    </div>
                </Card>

                {quiz?.participated ?
                    <Card className="p-4">
                        <p className="text-lg font-semibold text-center">
                            ✅ You scored {quiz.score}/{quiz.questions.length}
                        </p>
                    </Card>
                    :
                    score !== null && !isSubmitting && (
                        <Card className="p-4">
                            <p className="text-lg font-semibold text-center">
                                ✅ You scored {score}/{quiz.questions.length}
                            </p>
                        </Card>
                    )
                }
            </div>

            {toastData.message && (
                <ToastAlert
                    key={toastData.id} // ← forces remount
                    message={toastData.message}
                    type={toastData.type}
                />
            )}
        </>
    );
};

export default QuizParticipate;
