import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Send, Loader2, BookImage, Mic, Volume2 } from 'lucide-react'

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API } from '@/middleware/Api';
import { getPriorityColor, priorityList } from '@/utils/cssUtils';
import { validateFile } from '@/utils/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';

export default function TaskToDo({ onNewChatCreate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [buttonLoading, setButtonLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [voiceListening, setVoiceListening] = useState(false);

  const {
    transcript,
    listening: isListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const fetchTaskToDos = async () => {
    if(!id) return;

    const response = await API.get(`/tasks/${id}`);
    // console.log(response);
    return response.data.data || [];
  }

  const { data: todos = [], isLoading: isPageLoading, isError, error } = useQuery({
    queryKey: ['todos', id],
    queryFn: fetchTaskToDos,
    enabled: !!id,
  })


    useEffect(() => {
      if (isError) {
        navigate('/tasks');
      }
    }, [isError, navigate]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const startVoiceInputListening = () => {
    setVoiceListening(true);
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopVoiceInputListening = () => {
    setVoiceListening(false);
    SpeechRecognition.stopListening();
  };

  const updateTodo = useMutation({
    mutationFn: async ({ todo }) => {
      return await API.put(`/tasks/${id}/todos/${todo.id}`, {
        done: !todo.done, // flip here for consistency
      });
    },
    onError: (err, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', id], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos', id]);
    },
  })

  const toggleTodoDone = (todo) => {
    const previousTodos = [...todos]; // snapshot
  
    // Optimistically update UI
    queryClient.setQueryData(['todos', id], todos.map(item =>
      todo.id === item.id ? { ...item, done: !item.done } : item
    ));
  
    // Mutate
    updateTodo.mutate(
      { todo },
      {
        context: { previousTodos },
      }
    );
  };

  const handleImageChange = ({ target: { files } }) => {
    const file = files[0];
    if (validateFile(file)) {
      setImage(file);
    } else {
      // setErrors({ global: "File too large, Select image smaller than 5MB." });
      Alert("File too large, Select image smaller than 5MB.");
    }
  };

  //open image input when click import button
  const handleImageChangeClicked = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (voiceListening) stopVoiceInputListening();
    if (!prompt.trim()) return;

    setButtonLoading(true);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (image) formData.append("image", image);
      setPrompt("");

      const response = await API.post("/tasks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      //console.log(response.data);
      onNewChatCreate();
      navigate(`/tasks/${response.data.data}`);
    } catch (error) {
      console.error('Error fetching designation:', error);
    } finally {
      setImage(null);
      setButtonLoading(false);
    }
  }

  useEffect(() => {
    setPrompt(transcript);
  }, [transcript]);

  // Text to speech
  const speakTodo = (task) => {
    const utterance = new SpeechSynthesisUtterance(task.step);
    speechSynthesis.speak(utterance);
  };

  if (isError) return <div>{error.response.data.message}</div>;

  return (
    <div className="w-full pb-4">
      {isPageLoading && <PageLoadingOverlay />}
      <Card className="pt-8">
        <CardContent className="relative h-[78.5vh]">
          {id ? (
            <>
              <ScrollArea className="h-full">
                {todos && todos.length > 0 ?
                  todos.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 mb-4 rounded-lg border ${item.done ? 'bg-muted' : 'bg-card'
                        }`}
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={item.done}
                          onCheckedChange={() => toggleTodoDone(item)}
                          aria-label={`Mark "${item.step}" as ${item.done ? 'incomplete' : 'complete'}`}
                        />
                        <div className="space-y-1">
                          <p className={`font-medium ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                            {(index + 1) + ". " + item.step}
                          </p>
                        </div>
                      </div>

                      {/* <Badge className={`${getPriorityColor(priorityList[0])} text-white capitalize mr-2`}>
                        {priorityList[0]}
                      </Badge> */}

                      <Button type="button" size="icon" onClick={() => speakTodo(item)} variant="outline">
                        <Volume2 className="h-5 w-5" />
                        <span className="sr-only">Speech To Text</span>
                      </Button>
                    </div>
                  ))
                  :
                  <p>Nothing to show</p>
                }
              </ScrollArea>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 absolute bottom-0 left-0 w-full p-4">
              <Input name="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" ref={fileInputRef} />
              {image ?
                <div className='w-10 h-10 rounded overflow-hidden shadow-lg' onClick={handleImageChangeClicked}>
                  <img src={URL.createObjectURL(image)} className='w-full h-full' />
                </div>
                :
                <Button type="button" size="icon" onClick={handleImageChangeClicked} className="bg-blue-900">
                  <BookImage className="h-5 w-5" />
                  <span className="sr-only">Image url</span>
                </Button>
              }

              <Button type="button" size="icon" variant={voiceListening ? "outline" : ""} onClick={!voiceListening ? startVoiceInputListening : stopVoiceInputListening}
                disabled={!voiceListening ? isListening : !isListening} className="bg-blue-600">
                <Mic className="h-5 w-5" />
                <span className="sr-only">Text to speech</span>
              </Button>

              <Input
                placeholder="Type a message..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1"
              />
              {!buttonLoading ?
                <Button type="submit" size="icon" className="bg-blue-600">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
                :
                <Button type="submit" size="icon" disabled>
                  <Loader2 className="animate-spin" />
                </Button>
              }
            </form>
          )
          }
        </CardContent>
      </Card>
    </div >
  )
}

