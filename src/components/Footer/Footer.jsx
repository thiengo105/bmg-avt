import styled from "styled-components";

const Wrapper = styled.footer`
  padding: 0 40px;
  text-align: center;

  @media screen and (max-width: 768px) {
    padding: 15px;
  }
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
