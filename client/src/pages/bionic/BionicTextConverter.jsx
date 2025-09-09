import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RotateCcw, Type } from "lucide-react"
import { TOAST_TYPE } from "@/utils/enums"
import { ToastAlert } from "@/mycomponents/ToastAlert"
import { API } from "@/middleware/Api"
import { ButtonLoading } from "@/mycomponents/ButtonLoading"

export default function BionicTextConverter() {
    const [inputText, setInputText] = useState("")
    const [boldnessLevel, setBoldnessLevel] = useState([50])
    const [bionicStyle, setBionicStyle] = useState("bold")
    const [realTimeMode, setRealTimeMode] = useState(true)
    const [toastData, setToastData] = useState({ message: "", type: "", id: 0 });
    const [sampleButtonLoading, setSampleButtonLoading] = useState(false);

    // Function to convert text to bionic format
    const convertToBionic = (text, boldness, style) => {
        if (!text.trim()) return ""

        const words = text.split(/(\s+)/)

        return words.map((word, index) => {
            // If it's whitespace, return as is
            if (/^\s+$/.test(word)) {
                return <span key={index}>{word}</span>
            }

            // Remove punctuation for calculation but keep it
            const cleanWord = word.replace(/[^\w]/g, "")
            if (cleanWord.length === 0) {
                return <span key={index}>{word}</span>
            }

            // Calculate how many characters to make bold
            const boldLength = Math.max(1, Math.ceil((cleanWord.length * boldness) / 100))

            // Find where the clean word starts in the original word
            const punctuationStart = word.search(/\w/)
            const punctuationEnd = word.length - word.split("").reverse().join("").search(/\w/)

            if (punctuationStart === -1) {
                return <span key={index}>{word}</span>
            }

            const prefix = word.slice(0, punctuationStart)
            const mainWord = word.slice(punctuationStart, punctuationEnd)
            const suffix = word.slice(punctuationEnd)

            const boldPart = mainWord.slice(0, boldLength)
            const normalPart = mainWord.slice(boldLength)

            const getStyledElement = (text) => {
                switch (style) {
                    case "bold":
                        return <strong className="font-bold">{text}</strong>
                    case "highlight":
                        return <span className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">{text}</span>
                    case "underline":
                        return <span className="underline decoration-2 underline-offset-2">{text}</span>
                    case "color":
                        return <span className="text-blue-600 dark:text-blue-400 font-semibold">{text}</span>
                    default:
                        return <strong className="font-bold">{text}</strong>
                }
            }

            return (
                <span key={index}>
                    {prefix}
                    {getStyledElement(boldPart)}
                    {normalPart}
                    {suffix}
                </span>
            )
        })
    }

    // Convert text to bionic format
    const bionicText = useMemo(() => {
        return convertToBionic(inputText, boldnessLevel[0], bionicStyle)
    }, [inputText, boldnessLevel, bionicStyle])

    const handleReset = () => {
        setInputText("")
        setBoldnessLevel([50])
        setBionicStyle("bold")
        setRealTimeMode(true)
    }

    const generateStory = async () => {
        setSampleButtonLoading(true);
        try {
            const response = await API.post("/common/generate-story");
            //console.log(response.data);
            setInputText(response.data.data);
        } catch (error) {
            console.log(error);
            showToast(error.response.data,TOAST_TYPE.ERROR)
        } finally {
            setSampleButtonLoading(false);
        }

    }

    const showToast = (message, type) => {
        setToastData({ message, type, id: Date.now() });
    }

    return (
        <div className="min-h-screen pt-4">
            <div className="w-[90%] mx-auto space-y-6">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-3 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Input Text
                                </CardTitle>
                                <CardDescription>
                                    Paste or type your text here.{" "}
                                    {realTimeMode ? "Changes will be applied in real-time." : "Click convert to apply changes."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Paste your text here or try the sample text..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="min-h-[200px] text-base leading-relaxed resize-none"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {!sampleButtonLoading ?
                                        <Button variant="outline" size="sm" onClick={() => generateStory()}>
                                            Generate Story
                                        </Button>
                                        :
                                        <ButtonLoading css=""/>
                                    }
                                    <Button variant="outline" size="sm" onClick={handleReset}>
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                        Reset
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Output Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Bionic Text Output</CardTitle>
                                <CardDescription>
                                    Your text transformed with bionic formatting for enhanced readability.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="min-h-[200px] p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                                    {inputText.trim() ? (
                                        <div className="text-base leading-relaxed whitespace-pre-wrap">{bionicText}</div>
                                    ) : (
                                        <div className="text-muted-foreground text-center py-12">Your bionic text will appear here...</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Settings Panel */}
                    <div className="space-y-4">
                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">About Bionic Reading</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>
                                    Bionic reading highlights the first portion of words to guide your eyes and potentially improve
                                    reading speed and comprehension.
                                </p>
                                <p>Adjust the boldness level and style to find what works best for your reading preferences.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Formatting Options</CardTitle>
                                <CardDescription>Customize how your bionic text appears</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Real-time Mode */}
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="realtime" className="text-sm font-medium">
                                        Real-time Mode
                                    </Label>
                                    <Switch id="realtime" checked={realTimeMode} onCheckedChange={setRealTimeMode}/>
                                </div>

                                {/* Boldness Level */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Boldness Level: {boldnessLevel[0]}%</Label>
                                    <Slider
                                        value={boldnessLevel}
                                        onValueChange={setBoldnessLevel}
                                        max={100}
                                        min={10}
                                        step={10}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Subtle</span>
                                        <span>Strong</span>
                                    </div>
                                </div>

                                {/* Style Selection */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Highlighting Style</Label>
                                    <Select value={bionicStyle} onValueChange={(value) => setBionicStyle(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bold">Bold Text</SelectItem>
                                            <SelectItem value="highlight">Highlight Background</SelectItem>
                                            <SelectItem value="underline">Underline</SelectItem>
                                            <SelectItem value="color">Colored Text</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Style Preview */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Preview</Label>
                                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                                        {convertToBionic("Sample text preview", boldnessLevel[0], bionicStyle)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {toastData.message && (
                <ToastAlert
                    key={toastData.id}
                    message={toastData.message}
                    type={toastData.type}
                />
            )}
        </div>
    )
}
