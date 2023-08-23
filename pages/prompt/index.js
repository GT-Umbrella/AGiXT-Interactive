import axios from "axios";
import { sdk } from "../../lib/apiClient";
import useSWR from "swr";
import ReactMarkdown from "react-markdown";
import { Container } from "@mui/material";
import ContentSWR from "../../components/data/ContentSWR";
import PopoutDrawerWrapper from "../../components/menu/PopoutDrawerWrapper";
import PromptList from "../../components/systems/prompt/PromptList";
import { useRouter } from "next/router";
export default function Home() {
  const router = useRouter();
  const docs = useSWR(
    "docs/prompt",
    async () =>
      (
        await axios.get(
          "https://raw.githubusercontent.com/Josh-XT/AGiXT/main/docs/2-Concepts/Prompts.md"
        )
      ).data
  );
  const prompts = useSWR("prompt", async () => await sdk.getPrompts());
  return (
    <PopoutDrawerWrapper
      title={"Prompt Homepage"}
      leftHeading={"Prompts"}
      leftSWR={prompts}
      leftMenu={PromptList}
      rightHeading={null}
      rightSWR={null}
      rightMenu={null}
    >
      <Container>
        <ContentSWR
          swr={docs}
          content={({ data }) => <ReactMarkdown>{data}</ReactMarkdown>}
        />
      </Container>
    </PopoutDrawerWrapper>
  );
}
