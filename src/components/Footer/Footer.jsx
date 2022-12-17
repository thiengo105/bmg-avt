import styled from "styled-components";

const Wrapper = styled.footer`
  padding: 15px;
  text-align: center;
`;

const Footer = () => {
  return (
    <Wrapper>
      Made by{" "}
      <a
        href="https://www.facebook.com/thiengo105"
        target="_blank"
        rel="noopener noreferrer"
      >
        Thiện
      </a>{" "}
      from{" "}
      <a
        href="https://www.facebook.com/nhombonmuagio"
        target="_blank"
        rel="noopener noreferrer"
      >
        Bốn Mùa Gió
      </a>{" "}
      with <span>{String.fromCodePoint(0x2764)}</span>
    </Wrapper>
  );
};

export default Footer;
