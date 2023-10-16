import AGiXTChat from "agixtchat";
export default function Home() {
  return (
    <AGiXTChat
      baseUri={"http://localhost:7437"} // Base URI
      apiKey={""} // API Key
      dark={true} // Set dark mode by default
      agentName={"gpt4free"} // Agent name
      mode={"prompt"} // Modes are prompt or chain
      conversationName={"Convert Extensions to new ones"}
      enableFileUpload={false} // Enable file upload button
      // If mode is prompt, set promptName and promptCategory
      promptName={"Chat"} // Only matters if mode is prompt
      promptCategory={"Default"} // Only matters if mode is prompt
      // If mode is chain, set the remaining args
      selectedChain={"Smart Chat"} // Only matters if mode is chain
      chainArgs={{}} // Only matters if mode is chain, these are chain arg overrides
      useSelectedAgent={true} // Only matters if mode is chain, this will force the selected agent to run all chain steps
    />
  );
}