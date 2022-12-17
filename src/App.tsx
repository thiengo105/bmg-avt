import { useCallback, useRef, useState } from "react";
import Frame from "components/Frame/Frame";
import styled from "styled-components";
import "antd/dist/antd.css";
import Form from "components/Form/Form";
import Konva from "konva";
import { Divider } from "antd";
import heic2any from "heic2any";
import Footer from "components/Footer/Footer";
import confetti from "canvas-confetti";

const Wrapper = styled.div`
  max-width: 670px;
  padding: 15px;
  margin: 0 auto;
`;

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const frameRef = useRef<Konva.Stage>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onDoneClick() {
    if (frameRef.current) {
      setLoading(true);
      const fileName = `hanx2023.png`;
      const url = frameRef.current.toDataURL();

      setLoading(false);
      confetti({
        particleCount: 120,
        spread: 120,
        zIndex: 2000,
      });

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
    }
  }

  const onFileChange = useCallback(async (file: File) => {
    setImage(null);
    setImageLoading(true);
    let fileToConvert = file;

    // Convert HEIC format on iPhone to JPG
    if (file.type.includes("image/heic")) {
      const convertedBlob = (await heic2any({
        blob: file,
        toType: "image/jpg",
        quality: 0.8,
      })) as Blob;
      fileToConvert = new File([convertedBlob], file.name);
    }

    const url = URL.createObjectURL(fileToConvert);
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = url;
    image.onload = () => {
      setImage(image);
      setImageLoading(false);
    };
  }, []);

  return (
    <div>
      <Wrapper>
        <Frame ref={frameRef} image={image} />
        <Form
          loading={loading}
          imageLoading={imageLoading}
          hasImage={!!image}
          onFileChange={onFileChange}
          onDoneClick={onDoneClick}
        />
      </Wrapper>
      <Divider />
      <Footer />
    </div>
  );
}

export default App;
