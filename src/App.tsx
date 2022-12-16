import React, { useCallback, useMemo, useRef, useState } from "react";
import Frame from "components/Frame/Frame";
import styled from "styled-components";
import "antd/dist/antd.css";
import Form from "components/Form/Form";
import Konva from "konva";
import { uploadToCloudinary } from "services/upload";
import { Alert, Divider, Modal } from "antd";
import heic2any from "heic2any";
import Footer from "components/Footer/Footer";
import people from "data/db.json";
import confetti from "canvas-confetti";

const Wrapper = styled.div`
  display: flex;
  padding: 40px;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    padding: 15px;
  }
`;

const ColLeft = styled.div`
  width: 400px;
  max-width: 100%;
  margin-right: 40px;

  @media screen and (max-width: 768px) {
    width: auto;
    max-width: none;
    margin-right: 0;
  }
`;

const ColRight = styled.div`
  width: 400px;

  @media screen and (max-width: 768px) {
    width: auto;
  }
`;

function App() {
  const [id, setId] = useState<number>(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const frameRef = useRef<Konva.Stage>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const name = useMemo(() => {
    const person = people.find((person) => person.id === id);
    if (person) {
      return person.name;
    }
    return "";
  }, [id]);

  async function onDoneClick() {
    if (frameRef.current) {
      setLoading(true);
      const fileName = `${name}.png`;
      const url = frameRef.current.toDataURL();

      frameRef.current.toBlob({
        async callback(blob) {
          try {
            const file = new File([blob], fileName);
            await uploadToCloudinary(file);
            setLoading(false);
            confetti({
              particleCount: 120,
              spread: 120,
              zIndex: 2000,
            });
            Modal.confirm({
              icon: null,
              title: "Đã tải lên ảnh thẻ tình nguyện viên",
              content: `Cảm ơn ${name} nha! Bạn có muốn tải luôn cái ảnh về không?`,
              okText: "OK tải đi",
              cancelText: "Thôi khỏi",
              onOk: () => {
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
              },
            });
          } catch (error: any) {
            setLoading(false);
            Modal.error({
              title: "Thất bại",
              content: (
                <div>
                  <p>Có lỗi xảy ra rồi, bạn báo cho tác giả giùm nha!</p>
                  {error.response?.data?.error?.message && (
                    <Alert
                      type="error"
                      message="Lỗi:"
                      description={error.response.data.error.message}
                    />
                  )}
                </div>
              ),
            });
          }
        },
      });
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
        <ColLeft>
          <Frame ref={frameRef} name={name} image={image} />
        </ColLeft>
        <ColRight>
          <Form
            name={name}
            loading={loading}
            imageLoading={imageLoading}
            hasImage={!!image}
            onFileChange={onFileChange}
            onIdChange={(id) => {
              setId(id);
            }}
            onDoneClick={onDoneClick}
          />
        </ColRight>
      </Wrapper>
      <Divider />
      <Footer />
    </div>
  );
}

export default App;
