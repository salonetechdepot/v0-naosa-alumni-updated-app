import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface RegistrationApprovedProps {
  username: string;
  systemReference: string;
  baseUrl?: string;
}

export const RegistrationApproved = ({
  username,
  systemReference,
  baseUrl = "https://naosa.org",
}: RegistrationApprovedProps) => {
  const previewText = `Congratulations! Your NAOSA registration has been approved!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="80"
              height="80"
              alt="NAOSA Logo"
              style={logo}
            />
          </Section>
          <Heading style={h1}>Registration Approved! 🎉</Heading>
          <Text style={paragraph}>
            Dear <strong>{username}</strong>,
          </Text>
          <Text style={paragraph}>
            Congratulations! Your registration with the Nasir Ahmadiyya Old
            Students Association (NAOSA) has been approved.
          </Text>
          <Text style={paragraph}>
            You are now an official member of NAOSA. Your name will appear on
            our members list, and you'll have access to all association benefits
            and activities.
          </Text>

          <Section style={successSection}>
            <Text style={successText}>
              Your System Reference: <strong>{systemReference}</strong>
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={`${baseUrl}/members`}>
              View Members Directory
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Welcome to the NAOSA community! If you have any questions, please
            contact us at{" "}
            <Link href="mailto:NAOSAkenema@gmail.com" style={link}>
              NAOSAkenema@gmail.com
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default RegistrationApproved;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: "0 auto",
  padding: "20px 0",
};

const container = {
  border: "1px solid #eaeaea",
  borderRadius: "5px",
  margin: "40px auto",
  padding: "20px",
  maxWidth: "465px",
};

const logoSection = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "normal",
  textAlign: "center" as const,
  margin: "30px 0",
};

const paragraph = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
};

const successSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "5px",
  border: "1px solid #bbf7d0",
  padding: "16px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const successText = {
  fontSize: "14px",
  color: "#000",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#22c55e",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 20px",
};

const hr = {
  borderColor: "#eaeaea",
  margin: "26px 0",
};

const footer = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "24px",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};
