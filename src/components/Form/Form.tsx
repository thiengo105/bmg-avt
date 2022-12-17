import { Button, Space, Upload, UploadFile } from "antd";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  text-align: center;

  .upload-wrapper {
    display: block;
  }

  .ant-upload.ant-upload-select {
    display: block;
  }
`;

type InfoFormProps = {
  loading: boolean;
  imageLoading: boolean;
  hasImage: boolean;
  onFileChange(file: File): void;
  onDoneClick(): void;
};

const InfoForm: React.FC<InfoFormProps> = ({
  loading,
  imageLoading,
  hasImage,
  onFileChange,
  onDoneClick,
}) => {
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);

  useEffect(() => {
    if (fileList.length === 1 && fileList[0].originFileObj) {
      onFileChange(fileList[0].originFileObj);
    }
  }, [fileList, onFileChange]);

  return (
    <Wrapper>
      <Space direction="horizontal">
        <Upload
          maxCount={1}
          fileList={fileList}
          onChange={(info) => {
            setFileList(info.fileList);
          }}
          beforeUpload={() => false}
          showUploadList={false}
          accept="image/*,.heic"
          style={{ width: "100%" }}
          className="upload-wrapper"
        >
          <Button type="primary" size="large" block loading={imageLoading}>
            Chọn ảnh
          </Button>
        </Upload>
        <Button
          type="primary"
          size="large"
          block
          onClick={onDoneClick}
          loading={loading}
          disabled={!hasImage}
        >
          Xong
        </Button>
      </Space>
    </Wrapper>
  );
};

export default InfoForm;
