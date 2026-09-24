import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Statement } from "@/components/sections/Statement";
import { Products } from "@/components/sections/Products";
import { Care } from "@/components/sections/Care";
import { Manifesto } from "@/components/sections/Manifesto";
import { Stories } from "@/components/sections/Stories";
import { Quiz } from "@/components/sections/Quiz";
import { Faq } from "@/components/sections/Faq";
import { DeferredScene } from "@/components/three/lazy";
import { ScrollButton } from "@/components/ui/ScrollButton";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Statement />
        <Products />
        <Care />
        <Manifesto />
        <Stories />
        <Quiz />
        <Faq />
      </main>
      <Footer />
      <ScrollButton />
      <DeferredScene />
    </>
  );
}
