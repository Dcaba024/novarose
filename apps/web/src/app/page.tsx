import { AiSalesAgentWidget } from "@/components/agent/ai-sales-agent-widget";
import { Footer } from "@/components/marketing/footer";
import { LandingPage } from "@/components/marketing/landing-page";
import { Navbar } from "@/components/marketing/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <LandingPage />
      <Footer />
      <AiSalesAgentWidget />
    </>
  );
}
