import React, { useContext, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from 'UserContext';
import { CenteredSpinner } from 'components/CenteredSpinner';
import {
  RightPageForm,
  PageContainer,
  LeftPageContainer,
  GradientHeader,
  HeaderSubtitle,
} from 'components/KYC/SplitPageForm';
import { ErrorMessage } from 'components/ErrorMessage';
import { uploadKYC } from 'api/kyc';
import styled from 'styled-components';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export const UploadPage: React.FC = () => {
  const { refreshLoggedIn } = useContext(UserContext);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>('');
  const history = useHistory();
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFileAction = () => {
    if (inputRef && inputRef.current && inputRef.current.click) {
      inputRef.current.click();
    }
  };

  const onSubimtForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    if (!inputRef?.current?.files?.length) {
      setError('Please select a pdf, jpg or png file for upload');
      setIsLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', inputRef.current.files[0]);
      const response = await uploadKYC({ KYCFile: formData });
      const data = await response.json().then((x) => x);
      if (data.status === 'failure') {
        setError(data.error);
        setIsLoading(false);
        return;
      }
      await refreshLoggedIn();
      history.push('/home');
    } catch (e) {
      setError(e.message);
      console.log('Error:', e);
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      {isLoading && <CenteredSpinner />}
      {!isLoading && (
        <>
          <LeftPageContainer />
          <RightPageForm onSubmit={onSubimtForm} back={() => history.push('/connect')} progress={'100%'}>
            <GradientHeader>Verify It's You</GradientHeader>
            <HeaderSubtitle>
              Please upload a government issued ID or Passport to complete verification. We want to keep you safe!
            </HeaderSubtitle>
            <UploadContainer>
              <Form.Control
                className="mb-3"
                ref={inputRef}
                hidden
                type="file"
                onChange={(e: any) => setImgSrc(URL.createObjectURL(e.target.files[0]))}
              />
              <UploadButton onClick={uploadFileAction}>Upload Photo</UploadButton>
              <ThumbImage src={imgSrc} />
            </UploadContainer>
            <ErrorMessage error={error} />
          </RightPageForm>
        </>
      )}
    </PageContainer>
  );
};

const UploadButton = styled(Button)`
  width: fit-content;
  align-self: center;
`;

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: solid 3px transparent;
  border-image-slice: 1;
  background-image: linear-gradient(#171717, #171717),
    linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border-radius: 20px;
  padding: 50px 40px 40px 40px;
`;

const ThumbImage = styled.img`
  padding-top: 10px;
`;
