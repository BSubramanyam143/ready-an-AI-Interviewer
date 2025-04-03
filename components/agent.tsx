'use client'

import Image from "next/image";
import { cn } from "@/components/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapi } from "@/components/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/components/lib/actions/general.action";
import { SparkleIcon, Sparkles } from "lucide-react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  type,
  interviewId,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userIsSpeaking, setUserIsSpeaking] = useState(false); // Track when user is speaking
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        
        // Check if user is speaking based on the role of the message
        // When a user message is detected, we set userIsSpeaking to true
        if (message.role === "user") {
          setUserIsSpeaking(true);
        } else {
          // When any non-user message is detected, set userIsSpeaking to false
          setUserIsSpeaking(false);
        }
      }
    };
    // speech start for AI
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Error", error);
    
    // now pass into vapi here
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    console.log("generate feedback");

    const { success, feedbackId: id, } = await createFeedback({
      interviewId: interviewId!,
      userId: userId!,
      transcript: messages,
    });
    if (success && id) {
      router.push(`/interview/${id}/feedback`);
    } else {
      console.log("Error saving feedback");
      router.push("/");
    }
  };

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
          NEXT_BASE_URL: process.env.NEXT_BASE_URL || "", // Add NEXT_BASE_URL for deployed environments
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => {
            return `-${question}`; // Fixed missing return statement
          })
          .join("\n");
      }
      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };
  const handleDisconnect = async () => {
    if (callStatus !== CallStatus.FINISHED) {
      setCallStatus(CallStatus.FINISHED);
      await vapi.stop();
    }
  };
  

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveorFinished =
    callStatus === CallStatus.INACTIVE || CallStatus.FINISHED;

  return (
    <>
     <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Sparkles  className="text-black h-[60px] w-[60px] "/>
            {isSpeaking && <span className="animate-speak"></span>}
          </div>
          <h3 className="italic">AI Interviewer</h3>
        </div>
        
        {/* User card with enhanced border animation when user is speaking */}
        <div 
          className={cn(
            "card-border relative",
            userIsSpeaking ? "border-2  p-0.5" : ""
          )}
        >
          <div className={cn(
            "card-content relative z-10  h-full w-full flex flex-col items-center justify-center border-primary-200/50",
            userIsSpeaking ? "animate-pulse" : ""
          )}>
            <Image
              src="/user.jpeg"  
              alt="profile-image"
              width={539}
              height={539}
              className={cn(
                "rounded-full object-cover size-[100px]",
               
              )}
            />
           <h3 className="italic">
  {userName} {userIsSpeaking && "speaking..."}
</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}
      
      {/* call status here*/}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative">
              {isCallInactiveorFinished ? "Call" : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;