import React from "react"
import { X, UserRoundPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CHAT_MEMBER_TYPE, CHAT_TYPE } from "@/utils/enums"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ChatInfo = ({ name, image, type, participants, handleUserSelectorDialogOpen, connected }) => {
    return (
        <div className="bg-white p-6 h-full rounded">
            <div className="flex flex-col items-center mb-6">
                <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={image} alt={name} />
                    <AvatarFallback className="text-4xl">{name?.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <p className="text-center">{name}</p>
            </div>

            <div className="flex-1">
                <div className="space-y-2">
                    {type == CHAT_TYPE.GROUP ?
                        <>
                            <p className="text-sm font-medium text-muted-foreground my-auto">Chat Members</p>
                            {participants && participants.map((participant) => (
                                <div className="flex py-2 justify-between" key={participant.userId}>
                                    <div className="flex">
                                        <Avatar>
                                            <AvatarImage src={participant.image} alt={name} />
                                            <AvatarFallback>{participant?.User?.name?.slice(0, 1)}</AvatarFallback>
                                        </Avatar>
                                        <p className="my-auto ml-2">{participant?.User?.name}</p>
                                    </div>
                                    <Badge className={participant.role != CHAT_MEMBER_TYPE.ADMIN ? 'bg-blue-500 h-8' : 'bg-red-500 h-8'}>{participant.role}</Badge>
                                </div>
                            ))}

                            <Button variant="ghost" onClick={() => handleUserSelectorDialogOpen(participants, null)} className="w-full justify-start p-0">
                                <UserRoundPlus />
                                Add People
                            </Button>
                        </>
                        :
                        <p className="text-sm font-medium text-muted-foreground my-auto">{connected ? "Connected": "Not Connected"}</p>
                    }
                </div>
            </div>
        </div>
    )
}

export default ChatInfo