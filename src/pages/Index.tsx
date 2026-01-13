import { CrisprApp } from "@/components/crispr/CrisprApp";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>CRISPR Guide Design Tool | Educational DNA Analysis</title>
        <meta
          name="description"
          content="Design CRISPR guide RNAs with PAM scanning, scoring, and visualization. Educational tool for learning about CRISPR-Cas systems."
        />
      </Helmet>
      <CrisprApp />
    </>
  );
};

export default Index;
