import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { Button } from '@/components/ui/button';
import { QUESTION_OPTION_MAP } from '@/utils/enums';

const QuestionCreateComponent = ({ setQuestions }) => {
    const questionInitial = {
        questionText: "",
        a: "",
        b: "",
        c: "",
        d: "",
        correctAnswer: "",
    };
    const [question, setQuestion] = useState(questionInitial);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!question.questionText.trim()) newErrors.questionText = "Question is required";
        QUESTION_OPTION_MAP.forEach(opt => {
            if (!question[opt]?.trim()) newErrors[opt] = `Option ${opt.toUpperCase()} is required`;
        });
        if (!question.correctAnswer) newErrors.correctAnswer = "Select the correct answer";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Add question
        setQuestions(prev => [...prev, question]);

        // Reset
        setQuestion(questionInitial);
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setQuestion(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Card className="py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Question</Label>
                        <Textarea
                            name="questionText"
                            value={question.questionText}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                        {errors.questionText && <p className="text-red-500 text-sm">{errors.questionText}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Options</Label>
                        {QUESTION_OPTION_MAP.map(opt => (
                            <div key={opt}>
                                <Input
                                    name={opt}
                                    value={question[opt]}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                    placeholder={`Option ${opt.toUpperCase()}`}
                                />
                                {errors[opt] && <p className="text-red-500 text-sm">{errors[opt]}</p>}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <Select
                            value={question.correctAnswer}
                            onValueChange={value => setQuestion(prev => ({ ...prev, correctAnswer: value }))}
                        >
                            <SelectTrigger className="w-full border p-2 rounded bg-white text-sm">
                                <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {QUESTION_OPTION_MAP.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.correctAnswer && <p className="text-red-500 text-sm">{errors.correctAnswer}</p>}
                    </div>
                </CardContent>

                <CardFooter className="gap-2">
                    <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Add Question
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setQuestion(questionInitial)}>
                        Clear All
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default QuestionCreateComponent;
